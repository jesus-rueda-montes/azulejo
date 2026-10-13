import { useRef, useState } from 'react'
import { exportFileName, exportProgress, importProgress } from '../engine/progressFile'
import { useProgress } from '../store/progressStore'
import { resetProgress, signIn, signOut, syncNow, useSync, type SyncStatus } from '../sync/syncStore'

type Notice = { kind: 'ok' | 'error'; text: string } | null

export function SettingsPage() {
  const progress = useProgress()
  const fileInput = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const signedIn = useSync((s) => s.user !== null)

  const download = () => {
    const now = new Date()
    const blob = new Blob([exportProgress(progress, now)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = exportFileName(now)
    a.click()
    URL.revokeObjectURL(url)
    setNotice({ kind: 'ok', text: `Copia descargada: ${a.download}` })
  }

  const load = async (file: File) => {
    const r = importProgress(await file.text())
    if (!r.ok) return setNotice({ kind: 'error', text: r.error })
    const lessons = (p: typeof r.progress) => Object.values(p.lessonsRead).flat().length
    const ok = window.confirm(
      `Vas a reemplazar tu progreso actual por el de la copia del ${r.exportedAt.toLocaleDateString('es-ES')}.\n\n` +
        `Actual: ${progress.xp} XP · ${lessons(progress)} lecciones\n` +
        `Copia:  ${r.progress.xp} XP · ${lessons(r.progress)} lecciones\n\n¿Continuar?`,
    )
    if (!ok) return setNotice(null)
    progress.replace(r.progress)
    setNotice({ kind: 'ok', text: 'Progreso importado correctamente.' })
  }

  return (
    <section className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Ajustes</h1>

      <p className="text-sm text-muted">
        Tu progreso se guarda en este dispositivo. Con la sincronización activa, también se guarda en tu cuenta y lo
        ves igual en la web y en el móvil. Sin ella, descarga una copia de vez en cuando para no perderlo.
      </p>

      {notice && (
        <p
          role="status"
          className={`rounded-2xl border p-3 text-sm ${notice.kind === 'ok' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-red-300 bg-red-50 text-red-800'}`}
        >
          {notice.text}
        </p>
      )}

      <SyncPanel />

      <div className="rounded-2xl border border-line p-4">
        <h2 className="font-medium">Exportar progreso</h2>
        <p className="mt-1 text-sm text-muted">Descarga un archivo JSON con todo tu progreso.</p>
        <button type="button" onClick={download} className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
          Descargar copia
        </button>
      </div>

      <div className="rounded-2xl border border-line p-4">
        <h2 className="font-medium">Importar progreso</h2>
        <p className="mt-1 text-sm text-muted">
          Carga una copia descargada antes. Sustituye el progreso actual (se te pedirá confirmación); con la
          sincronización activa, la copia se combina con tu progreso de la nube.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          aria-label="Archivo de copia de progreso"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) void load(f)
            e.target.value = '' // permitir volver a elegir el mismo archivo
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="mt-3 rounded-full border border-line-strong px-5 py-2.5 text-sm hover:bg-primary-faint"
        >
          Elegir archivo…
        </button>
      </div>

      <div className="rounded-2xl border border-red-200 p-4">
        <h2 className="font-medium text-red-700">Borrar progreso</h2>
        <p className="mt-1 text-sm text-muted">
          Elimina XP, racha, lecciones, ejercicios, exámenes y flashcards de este dispositivo y, si has entrado con
          Google, también de la nube. No se puede deshacer.
        </p>
        <button
          type="button"
          onClick={async () => {
            const msg =
              '¿Seguro que quieres borrar todo tu progreso? Te recomendamos descargar antes una copia.' +
              (signedIn ? '\n\nSe borrará también de la nube. Si tienes la app en otro dispositivo, bórralo también allí o lo volverá a subir.' : '')
            if (!window.confirm(msg)) return
            const r = await resetProgress()
            setNotice(r.ok ? { kind: 'ok', text: 'Progreso borrado.' } : { kind: 'error', text: r.error })
          }}
          className="mt-3 rounded-full border border-red-300 px-5 py-2.5 text-sm text-red-800 hover:bg-red-50"
        >
          Borrar todo el progreso
        </button>
      </div>
    </section>
  )
}

const STATUS_TEXT: Record<SyncStatus, string> = {
  off: '',
  signedOut: '',
  syncing: 'Sincronizando…',
  ok: 'Sincronizado',
  offline: 'Sin conexión: se sincronizará al recuperarla',
  error: 'Error al sincronizar',
}

function SyncPanel() {
  const { status, user, lastSync, error } = useSync()
  return (
    <div className="rounded-2xl border border-line p-4">
      <h2 className="font-medium">Sincronización</h2>
      {status === 'off' ? (
        <p className="mt-1 text-sm text-muted">No está configurada en esta versión de la app.</p>
      ) : !user ? (
        <>
          <p className="mt-1 text-sm text-muted">
            Entra con tu cuenta de Google para tener el mismo progreso en todos tus dispositivos.
          </p>
          <button type="button" onClick={() => void signIn()} className="mt-3 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover">
            Entrar con Google
          </button>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            Conectado como <span className="font-medium text-ink">{user.email ?? user.name}</span>.
          </p>
          <p role="status" className="mt-1 text-sm text-muted">
            {STATUS_TEXT[status]}
            {status === 'ok' && lastSync && ` (${lastSync.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })})`}
            {status === 'error' && error && `: ${error}`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={status === 'syncing'}
              onClick={() => void syncNow()}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
            >
              Sincronizar ahora
            </button>
            <button type="button" onClick={() => void signOut()} className="rounded-full border border-line-strong px-5 py-2.5 text-sm hover:bg-primary-faint">
              Cerrar sesión
            </button>
          </div>
        </>
      )}
      {status === 'signedOut' && error && <p className="mt-2 text-sm text-red-800">{error}</p>}
    </div>
  )
}
