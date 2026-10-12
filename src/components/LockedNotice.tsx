import { Link } from 'react-router'
import type { LockReason } from '../engine/progress'

export function LockedNotice({ reasons }: { reasons: LockReason[] }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className="font-medium">🔒 Módulo bloqueado</p>
      <p className="mt-1 text-sm text-muted">Para desbloquearlo, aprueba el examen de:</p>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-sm">
        {reasons.map((r) => (
          <li key={r.module.ref}>
            <Link to={`/modulo/${r.module.trackId}/${r.module.slug}`} className="text-primary hover:underline">
              {r.module.title}
            </Link>
            {r.kind === 'prereq' && <span className="text-muted"> (requisito de otro itinerario)</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
