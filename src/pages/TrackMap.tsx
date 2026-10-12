import { Link } from 'react-router'
import { getCatalog } from '../content/loader'
import { LEVEL_NAMES } from '../content/schema'
import { CheckCircleIcon, LockIcon, PlayCircleIcon } from '../components/icons'
import { isUnlocked } from '../engine/progress'
import { useProgress } from '../store/progressStore'

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

export function TrackMap() {
  const catalog = getCatalog()
  const { tracks, modules } = catalog
  const progress = useProgress()

  return (
    <section>
      <h1 className="text-3xl font-bold sm:text-4xl">Itinerarios</h1>
      <p className="mt-2 max-w-prose text-lg text-ink-soft">
        Dos itinerarios: primero los fundamentos (AZ-900) y después la administración práctica (AZ-104).
      </p>

      <div className="mt-8 space-y-12">
        {tracks.map((track) => {
          const trackModules = modules.filter((m) => m.trackId === track.id)
          const levels = [...new Set(trackModules.map((m) => m.level))]
          return (
            <article key={track.id}>
              <header className="flex flex-wrap items-baseline gap-3">
                <h2 className="text-2xl font-bold">{track.title}</h2>
                {track.optional && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary-hover">Opcional</span>
                )}
              </header>
              <p className="mt-1 max-w-prose text-ink-soft">{track.description}</p>

              {trackModules.length === 0 ? (
                <p className="mt-4 text-sm text-muted italic">Contenido en preparación.</p>
              ) : (
                // Cada nivel es una capa del océano, más oscura cuanto más profunda.
                <div className="mt-5 overflow-hidden rounded-3xl">
                  {levels.map((level, i) => {
                    const layer = LAYERS[Math.min(i, LAYERS.length - 1)]
                    return (
                      <section key={level} className={`flex flex-wrap gap-x-8 gap-y-4 p-5 sm:p-7 ${layer.bg} ${layer.text}`}>
                        <div className="w-full sm:w-44 sm:shrink-0">
                          <p className={`text-xs font-bold tracking-widest uppercase ${layer.kicker}`}>Nivel {level}</p>
                          <h3 className="text-2xl leading-tight font-extrabold">{layer.name}</h3>
                          <p className={`text-sm ${layer.sub}`}>{LEVEL_NAMES[level]}</p>
                        </div>
                        <ul className="grid min-w-0 flex-1 basis-80 gap-3 sm:grid-cols-2">
                          {trackModules
                            .filter((m) => m.level === level)
                            .map((m) => {
                              const passed = progress.exams[m.ref]?.passed
                              const open = isUnlocked(catalog, progress, m)
                              const status = passed ? 'Aprobado' : open ? 'Disponible' : 'Bloqueado'
                              return (
                                <li key={m.ref}>
                                  <Link
                                    to={`/modulo/${m.trackId}/${m.slug}`}
                                    className={`flex h-full flex-col gap-2 rounded-2xl border p-4 transition ${
                                      passed
                                        ? 'border-line bg-surface text-ink hover:border-primary'
                                        : open
                                          ? 'border-primary bg-surface text-ink ring-2 ring-[#14b8c4]'
                                          : layer.locked
                                    }`}
                                  >
                                    <span className="flex items-center justify-between gap-2">
                                      <span className={`text-sm font-bold ${open || passed ? 'text-primary-hover' : ''}`}>{status}</span>
                                      {passed ? (
                                        <CheckCircleIcon className="text-primary" />
                                      ) : open ? (
                                        <PlayCircleIcon className="text-primary" />
                                      ) : (
                                        <LockIcon />
                                      )}
                                    </span>
                                    <span className="font-display text-lg leading-snug font-semibold">{m.title}</span>
                                    <span className={`text-sm ${open || passed ? 'text-ink-soft' : 'opacity-85'}`}>{m.summary}</span>
                                    <span className={`mt-auto text-xs ${open || passed ? 'text-muted' : 'opacity-85'}`}>
                                      {plural(m.lessons.length, 'lección', 'lecciones')} · {plural(m.exercises.length, 'ejercicio', 'ejercicios')} · {m.xp} XP
                                    </span>
                                  </Link>
                                </li>
                              )
                            })}
                        </ul>
                      </section>
                    )
                  })}
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

/** Capas del océano para los niveles de un itinerario, de la superficie al abismo. */
const LAYERS = [
  { name: 'Superficie', bg: 'bg-depth-1', text: 'text-ink', kicker: 'text-primary-hover', sub: 'text-ink-soft', locked: 'border-line-strong bg-white/50 text-ink hover:bg-white/70' },
  { name: 'Aguas medias', bg: 'bg-depth-2', text: 'text-white', kicker: 'text-[#c8f4f8]', sub: 'text-[#d6f1f6]', locked: 'border-white/25 bg-white/10 text-white hover:bg-white/15' },
  { name: 'Aguas profundas', bg: 'bg-depth-3', text: 'text-white', kicker: 'text-[#bae6fd]', sub: 'text-[#cde6f2]', locked: 'border-white/25 bg-white/10 text-white hover:bg-white/15' },
  { name: 'Abismo', bg: 'bg-depth-4', text: 'text-white', kicker: 'text-[#7dd3fc]', sub: 'text-[#a9cfe0]', locked: 'border-white/25 bg-white/10 text-white hover:bg-white/15' },
]
