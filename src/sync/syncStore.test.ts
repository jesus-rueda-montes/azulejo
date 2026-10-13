import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initialProgress, type ProgressState } from '../engine/progress'
import { progressData, useProgress } from '../store/progressStore'

// La nube se simula en memoria: se prueba la lógica de sincronización, no Firebase.
const cloud = vi.hoisted(() => ({ remote: null as ProgressState | null, writes: 0, fail: false }))
vi.mock('./cloud', () => ({
  initCloud: () => {},
  watchUser: async () => () => {},
  signInWithGoogle: async () => {},
  signOutCloud: async () => {},
  readRemote: async () => {
    if (cloud.fail) throw new Error('sin red')
    return cloud.remote
  },
  writeRemote: async (_uid: string, p: ProgressState) => {
    if (cloud.fail) throw new Error('sin red')
    cloud.remote = p
    cloud.writes++
  },
}))

const { resetProgress, syncNow, useSync } = await import('./syncStore')

const user = { uid: 'u1', name: 'Yo', email: null }

beforeEach(async () => {
  cloud.remote = null
  cloud.writes = 0
  cloud.fail = false
  await useProgress.persist.rehydrate()
  useProgress.getState().reset()
  useSync.setState({ status: 'ok', user, lastSync: null, error: null })
})

describe('syncNow', () => {
  it('sube el progreso local si la nube está vacía', async () => {
    useProgress.getState().lessonRead('m', 'l1')
    await syncNow()
    expect(cloud.remote?.lessonsRead).toEqual({ m: ['l1'] })
    expect(useSync.getState().status).toBe('ok')
  })

  it('fusiona los dos lados y guarda el resultado en ambos', async () => {
    useProgress.getState().lessonRead('m', 'l1')
    cloud.remote = { ...initialProgress(), xp: 40, lessonsRead: { m: ['l2'] }, exams: { m: { best: 0.9, passed: true, attempts: 1 } } }
    await syncNow()
    const local = progressData(useProgress.getState())
    expect(local.lessonsRead).toEqual({ m: ['l1', 'l2'] })
    expect(local.exams.m.passed).toBe(true)
    expect(local.xp).toBe(40)
    expect(cloud.remote).toEqual(local)
  })

  it('no escribe si la nube ya está al día', async () => {
    await syncNow()
    expect(cloud.writes).toBe(1)
    await syncNow()
    expect(cloud.writes).toBe(1)
  })

  it('sin red marca error y no toca el progreso local', async () => {
    useProgress.getState().lessonRead('m', 'l1')
    cloud.fail = true
    await syncNow()
    expect(useSync.getState().status).toBe('error')
    expect(useProgress.getState().lessonsRead).toEqual({ m: ['l1'] })
  })
})

describe('resetProgress', () => {
  it('vacía la nube antes que el dispositivo', async () => {
    useProgress.getState().lessonRead('m', 'l1')
    await syncNow()
    expect(await resetProgress()).toEqual({ ok: true })
    expect(cloud.remote?.lessonsRead).toEqual({})
    expect(useProgress.getState().lessonsRead).toEqual({})
  })

  it('si no puede vaciar la nube, no borra nada', async () => {
    useProgress.getState().lessonRead('m', 'l1')
    cloud.fail = true
    const r = await resetProgress()
    expect(r.ok).toBe(false)
    expect(useProgress.getState().lessonsRead).toEqual({ m: ['l1'] })
  })
})
