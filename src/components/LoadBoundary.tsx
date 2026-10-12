import { Component, Suspense, type ReactNode } from 'react'

interface Props {
  /** Qué se está cargando, para los mensajes ("la lección", "los ejercicios"…). */
  what: string
  children: ReactNode
}

/**
 * Suspense + captura de errores para el contenido que se descarga bajo demanda
 * (cuerpos de lecciones, ejercicios, especificaciones de CLI). Si falla la
 * descarga (sin conexión, despliegue nuevo), muestra un aviso en vez de romper la página.
 */
export function LoadBoundary({ what, children }: Props) {
  return (
    <LoadErrorBoundary what={what}>
      <Suspense fallback={<p className="mt-6 text-muted">Cargando {what}…</p>}>{children}</Suspense>
    </LoadErrorBoundary>
  )
}

class LoadErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        No se pudo cargar {this.props.what}. Revisa tu conexión y{' '}
        <button type="button" onClick={() => location.reload()} className="underline hover:text-red-900">
          recarga la página
        </button>
        .
      </div>
    )
  }
}
