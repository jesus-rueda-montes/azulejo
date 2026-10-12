import { Suspense } from 'react'
import { Link, NavLink, Outlet } from 'react-router'
import { getCatalog } from '../content/loader'
import { dueQueue } from '../engine/srs'
import { BadgeToaster } from './BadgeToaster'
import { CardsIcon, HomeIcon, Logo, MapIcon, SettingsIcon } from './icons'
import { useProgress } from '../store/progressStore'

const links = [
  { to: '/', label: 'Inicio', Icon: HomeIcon },
  { to: '/itinerarios', label: 'Itinerarios', Icon: MapIcon },
  { to: '/repaso', label: 'Repaso', Icon: CardsIcon },
  { to: '/ajustes', label: 'Ajustes', Icon: SettingsIcon },
]

export function Layout() {
  const progress = useProgress()
  const due = dueQueue(getCatalog(), progress, new Date()).length
  const dueBadge = (className: string) =>
    due > 0 && (
      <span className={`rounded-full text-xs font-bold ${className}`} aria-label={`${due} pendientes`}>
        {due}
      </span>
    )

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5">
          <Link to="/" className="mr-auto flex min-h-11 items-center gap-2.5 font-display text-xl font-bold text-ink">
            <Logo />
            Azulejo
          </Link>
          {/* Escritorio: navegación en píldoras. En móvil se usa la barra inferior. */}
          <nav aria-label="Principal" className="hidden items-center gap-1 sm:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold transition ${
                    isActive ? 'bg-primary text-white' : 'text-ink-soft hover:bg-primary-faint'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {l.label}
                    {l.to === '/repaso' &&
                      dueBadge(`px-2 py-0.5 ${isActive ? 'bg-white text-primary-hover' : 'bg-primary-soft text-primary-hover'}`)}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <Suspense fallback={<p className="text-muted">Cargando…</p>}>
          <Outlet />
        </Suspense>
      </main>

      {/* Móvil: barra de pestañas inferior */}
      <nav
        aria-label="Principal"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface px-1 pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:hidden"
      >
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex min-h-12 flex-col items-center justify-center gap-0.5 text-xs ${
                isActive ? 'font-bold text-primary' : 'text-muted'
              }`
            }
          >
            <Icon />
            {label}
            {to === '/repaso' && dueBadge('absolute top-0.5 left-1/2 ml-2 bg-primary px-1.5 text-white')}
          </NavLink>
        ))}
      </nav>
      <BadgeToaster />
    </div>
  )
}
