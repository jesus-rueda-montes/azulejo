import type { FirebaseOptions } from 'firebase/app'
import { create } from 'zustand'
import { mergeProgress, sameProgress } from '../engine/merge'
import { initialProgress } from '../engine/progress'
import { progressData, useProgress } from '../store/progressStore'
import { initCloud, readRemote, signInWithGoogle, signOutCloud, watchUser, writeRemote, type CloudUser } from './cloud'

// Sincronización del progreso entre dispositivos (decisión 70).
// IndexedDB sigue siendo la copia de trabajo: la app funciona sin conexión y,
// cuando puede, fusiona su progreso con el de la nube (mergeProgress) y sube
// el resultado. Se sincroniza al entrar, al volver a la app, al recuperar la
// conexión y unos segundos después de cada cambio.

export type SyncStatus = 'off' | 'signedOut' | 'syncing' | 'ok' | 'offline' | 'error'

interface SyncState {
  status: SyncStatus
  user: CloudUser | null
  lastSync: Date | null
  error: string | null
}

export const useSync = create<SyncState>()(() => ({ status: 'off', user: null, lastSync: null, error: null }))

const DEBOUNCE_MS = 3000
let running = false
let again = false
let applying = false
let timer: ReturnType<typeof setTimeout> | undefined

const hydrated = () =>
  new Promise<void>((resolve) => {
    if (useProgress.persist.hasHydrated()) return resolve()
    const unsub = useProgress.persist.onFinishHydration(() => {
      unsub()
      resolve()
    })
  })

const isOffline = () => typeof navigator !== 'undefined' && navigator.onLine === false

function failed(e: unknown) {
  const error = e instanceof Error ? e.message : String(e)
  if (!useSync.getState().user) useSync.setState({ status: 'signedOut', error })
  else if (isOffline()) useSync.setState({ status: 'offline', error: null })
  else useSync.setState({ status: 'error', error })
}

/** Fusiona el progreso local con el de la nube y guarda el resultado en los dos lados. */
export async function syncNow(): Promise<void> {
  const { user } = useSync.getState()
  if (!user) return
  if (running) {
    again = true
    return
  }
  running = true
  useSync.setState({ status: 'syncing', error: null })
  try {
    await hydrated()
    do {
      again = false
      const remote = await readRemote(user.uid)
      const local = progressData(useProgress.getState())
      const merged = remote ? mergeProgress(local, remote) : local
      if (!sameProgress(merged, local)) {
        applying = true
        try {
          useProgress.getState().replace(merged)
        } finally {
          applying = false
        }
      }
      if (!remote || !sameProgress(merged, remote)) await writeRemote(user.uid, merged)
    } while (again)
    useSync.setState({ status: 'ok', lastSync: new Date() })
  } catch (e) {
    failed(e)
  } finally {
    running = false
  }
}

function scheduleSync() {
  clearTimeout(timer)
  timer = setTimeout(() => void syncNow(), DEBOUNCE_MS)
}

export async function signIn(): Promise<void> {
  try {
    await signInWithGoogle()
  } catch (e) {
    // Cerrar la ventana de Google no es un error.
    const code = (e as { code?: string }).code
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
    failed(e)
  }
}

export async function signOut(): Promise<void> {
  try {
    await signOutCloud()
  } catch (e) {
    failed(e)
  }
}

/**
 * Borrar el progreso con la sincronización activa: primero se vacía la copia de
 * la nube (si no, la siguiente fusión lo recuperaría) y después la local.
 */
export async function resetProgress(): Promise<{ ok: true } | { ok: false; error: string }> {
  const { user } = useSync.getState()
  if (user) {
    try {
      await writeRemote(user.uid, initialProgress())
    } catch {
      return { ok: false, error: 'No se pudo borrar la copia de la nube (¿sin conexión?). No se ha borrado nada.' }
    }
  }
  useProgress.getState().reset()
  return { ok: true }
}

/** Arranca la sincronización si hay configuración de Firebase. Se llama una vez al iniciar la app. */
export function startSync(config: FirebaseOptions | null): void {
  if (!config) return
  initCloud(config)
  useSync.setState({ status: 'signedOut' })
  void watchUser((user) => {
    useSync.setState({ user, status: user ? 'syncing' : 'signedOut', error: null, ...(user ? {} : { lastSync: null }) })
    if (user) void syncNow()
  }).catch(failed)
  useProgress.subscribe(() => {
    if (!applying && useSync.getState().user) scheduleSync()
  })
  window.addEventListener('online', () => void syncNow())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void syncNow()
  })
}
