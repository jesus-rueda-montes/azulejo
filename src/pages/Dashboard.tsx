import { Link } from 'react-router'
import { getCatalog } from '../content/loader'
import { BadgeGrid } from '../components/BadgeGrid'
import { CardsIcon } from '../components/icons'
import { computeBadges } from '../engine/badges'
import { isUnlocked } from '../engine/progress'
import { dueQueue } from '../engine/srs'
import { useProgress } from '../store/progressStore'

export function Dashboard() {
  const catalog = getCatalog()
  const progress = useProgress()
  const passed = catalog.modules.filter((m) => progress.exams[m.ref]?.passed).length
  // Siguiente paso: el primer módulo abierto y sin aprobar (itinerarios no opcionales primero).
  const optional = new Set(catalog.tracks.filter((t) => t.optional).map((t) => t.id))
  const next = [...catalog.modules]
    .sort((a, b) => Number(optional.has(a.trackId)) - Number(optional.has(b.trackId)))
    .find((m) => !progress.exams[m.ref]?.passed && isUnlocked(catalog, progress, m))

  const dueCards = dueQueue(catalog, progress, new Date()).length
  const badges = computeBadges(catalog, progress)
  const earned = badges.filter((b) => b.earned).length

  const stats = [
    { label: 'XP', value: progress.xp },
    { label: 'Racha', value: `${progress.streak.current} ${progress.streak.current === 1 ? 'día' : 'días'}` },
    { label: 'Mejor racha', value: `${progress.streak.best} d` },
    { label: 'Módulos aprobados', value: `${passed}/${catalog.modules.length}` },
  ]

  return (
    <section className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Bienvenido a Azulejo</h1>
        <p className="mt-2 max-w-prose text-lg text-ink-soft">
          Cloud y Microsoft Azure: los fundamentos de AZ-900 y la administración práctica de AZ-104.
        </p>
      </header>

      {next && (
        <div className="relative overflow-hidden rounded-3xl bg-deep p-6 pb-28 text-white sm:p-10 sm:pb-32">
          <Waves />
          <p className="relative text-sm font-semibold text-[#bdf0f6]">Continúa por aquí</p>
          <p className="relative mt-2 max-w-[20ch] font-display text-3xl leading-tight font-bold sm:text-4xl">{next.title}</p>
          <p className="relative mt-2 max-w-prose text-[#dff6fa]">{next.summary}</p>
          <Link
            to={`/modulo/${next.trackId}/${next.slug}`}
            className="relative mt-5 inline-flex min-h-12 items-center rounded-full bg-white px-6 font-bold text-deep hover:bg-primary-soft"
          >
            Ir al módulo
          </Link>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s, i) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface px-5 py-4">
            <dt className="text-sm font-medium text-muted">{s.label}</dt>
            <dd className={`mt-1 font-display text-2xl font-bold ${i === 0 ? 'text-primary' : ''}`}>{s.value}</dd>
          </div>
        ))}
      </dl>

      {dueCards > 0 && (
        <Link
          to="/repaso"
          className="flex flex-wrap items-center gap-4 rounded-2xl bg-primary-soft p-5 transition hover:bg-[#c3edf3]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface text-primary">
            <CardsIcon />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold text-primary-hover">Repaso de hoy</span>
            <span className="font-display text-xl font-bold">
              {dueCards} {dueCards === 1 ? 'tarjeta pendiente' : 'tarjetas pendientes'}
            </span>
          </span>
          <span className="inline-flex min-h-11 items-center rounded-full bg-primary px-5 font-semibold text-white">Repasar</span>
        </Link>
      )}

      <div>
        <h2 className="text-lg font-bold">
          Insignias <span className="font-sans text-sm font-medium text-muted">({earned}/{badges.length})</span>
        </h2>
        <div className="mt-3">
          {/* Primero las conseguidas */}
          <BadgeGrid badges={[...badges].sort((a, b) => Number(b.earned) - Number(a.earned))} />
        </div>
      </div>
    </section>
  )
}

/** Olas decorativas al pie del bloque «Continúa por aquí». */
function Waves() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 160"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full sm:h-28"
    >
      <path d="M0 70 C150 30 300 110 450 70 S750 30 900 70 S1100 110 1200 70 V160 H0Z" fill="#0e6b85" />
      <path d="M0 100 C200 70 350 140 550 100 S850 70 1000 100 S1150 130 1200 105 V160 H0Z" fill="#0f7c86" />
      <path d="M0 130 C180 110 380 160 600 130 S950 110 1200 135 V160 H0Z" fill="#2bb8c4" />
    </svg>
  )
}
