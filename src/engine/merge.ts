import type { ProgressState } from './progress'
import type { StoredCard } from './srs'

// Fusión del progreso de dos dispositivos (decisión 70). Pura y conmutativa:
// merge(a, b) y merge(b, a) dan el mismo resultado, y el progreso nunca retrocede
// (lo aprobado, resuelto o leído en cualquiera de los dos lados se conserva).

// Ordenada para que la fusión sea conmutativa (el orden de lectura no se usa en ningún sitio).
const union = (a: string[], b: string[]) => [...new Set([...a, ...b])].sort()

function mergeRecords<T>(a: Record<string, T>, b: Record<string, T>, pick: (x: T, y: T) => T): Record<string, T> {
  const out: Record<string, T> = { ...a }
  for (const [key, value] of Object.entries(b)) out[key] = key in a ? pick(a[key], value) : value
  return out
}

/** Gana la tarjeta repasada más recientemente; sin repasos, la de más repeticiones. */
function newerCard(x: StoredCard, y: StoredCard): StoredCard {
  const tx = x.last_review ? Date.parse(x.last_review) : -Infinity
  const ty = y.last_review ? Date.parse(y.last_review) : -Infinity
  if (tx !== ty) return tx > ty ? x : y
  return y.reps > x.reps ? y : x
}

function mergeStreak(a: ProgressState['streak'], b: ProgressState['streak']): ProgressState['streak'] {
  const best = Math.max(a.best, b.best)
  if (a.lastDay === b.lastDay) return { current: Math.max(a.current, b.current), best: Math.max(best, a.current, b.current), lastDay: a.lastDay }
  const latest = a.lastDay === null ? b : b.lastDay === null ? a : a.lastDay > b.lastDay ? a : b
  return { current: latest.current, best: Math.max(best, latest.current), lastDay: latest.lastDay }
}

export function mergeProgress(a: ProgressState, b: ProgressState): ProgressState {
  return {
    version: 2,
    // La XP es un acumulador sin historial de eventos: se conserva la mayor.
    xp: Math.max(a.xp, b.xp),
    lessonsRead: mergeRecords(a.lessonsRead, b.lessonsRead, union),
    exercises: mergeRecords(a.exercises, b.exercises, (x, y) => ({
      solved: x.solved || y.solved,
      attempts: Math.max(x.attempts, y.attempts),
      hintsUsed: Math.max(x.hintsUsed, y.hintsUsed),
    })),
    exams: mergeRecords(a.exams, b.exams, (x, y) => ({
      best: Math.max(x.best, y.best),
      passed: x.passed || y.passed,
      attempts: Math.max(x.attempts, y.attempts),
    })),
    streak: mergeStreak(a.streak, b.streak),
    cards: mergeRecords(a.cards, b.cards, newerCard),
  }
}

/** JSON con las claves ordenadas, para comparar progresos sin depender del orden. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([k1], [k2]) => (k1 < k2 ? -1 : 1))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stable(v)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

/** Igualdad por contenido, sin importar el orden de las claves (las listas sí cuentan en su orden). */
export const sameProgress = (a: ProgressState, b: ProgressState) => stable(a) === stable(b)
