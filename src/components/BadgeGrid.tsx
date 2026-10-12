import type { Badge } from '../engine/badges'

export function BadgeGrid({ badges }: { badges: Badge[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {badges.map((b) => (
        <li
          key={b.id}
          className={`rounded-2xl border p-4 ${b.earned ? 'border-line-strong bg-primary-faint' : 'border-line bg-surface'}`}
          title={b.description}
        >
          <span className={`text-2xl ${b.earned ? '' : 'opacity-30 grayscale'}`} aria-hidden>
            {b.icon}
          </span>
          <span className={`mt-1 block text-sm font-semibold ${b.earned ? 'text-ink' : 'text-ink-soft'}`}>{b.title}</span>
          <span className="block text-xs text-muted">{b.description}</span>
          {!b.earned && b.target > 1 && (
            <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-primary-soft" aria-label={`${b.current} de ${b.target}`}>
              <span className="block h-full bg-primary" style={{ width: `${(b.current / b.target) * 100}%` }} />
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
