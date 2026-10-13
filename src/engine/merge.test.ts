import { describe, expect, it } from 'vitest'
import { mergeProgress, sameProgress } from './merge'
import { initialProgress, type ProgressState } from './progress'
import type { StoredCard } from './srs'

const card = (over: Partial<StoredCard>): StoredCard =>
  ({ due: '2026-10-20T00:00:00.000Z', reps: 1, state: 2, stability: 1, difficulty: 5, elapsed_days: 0, scheduled_days: 1, lapses: 0, learning_steps: 0, ...over }) as StoredCard

const base = (over: Partial<ProgressState>): ProgressState => ({ ...initialProgress(), ...over })

describe('mergeProgress', () => {
  it('fusionar con el estado vacío no cambia nada', () => {
    const p = base({ xp: 30, lessonsRead: { 'a/b': ['l1'] }, exams: { 'a/b': { best: 0.9, passed: true, attempts: 1 } } })
    expect(sameProgress(mergeProgress(p, initialProgress()), p)).toBe(true)
    expect(sameProgress(mergeProgress(initialProgress(), p), p)).toBe(true)
  })

  it('une lecciones sin duplicar y conserva lo mejor de ejercicios y exámenes', () => {
    const a = base({
      lessonsRead: { m: ['l1', 'l2'] },
      exercises: { 'm#e1': { solved: true, attempts: 1, hintsUsed: 0 } },
      exams: { m: { best: 0.6, passed: false, attempts: 2 } },
    })
    const b = base({
      lessonsRead: { m: ['l2', 'l3'], n: ['x'] },
      exercises: { 'm#e1': { solved: false, attempts: 3, hintsUsed: 2 } },
      exams: { m: { best: 0.9, passed: true, attempts: 1 } },
    })
    const r = mergeProgress(a, b)
    expect(r.lessonsRead).toEqual({ m: ['l1', 'l2', 'l3'], n: ['x'] })
    expect(r.exercises['m#e1']).toEqual({ solved: true, attempts: 3, hintsUsed: 2 })
    expect(r.exams.m).toEqual({ best: 0.9, passed: true, attempts: 2 })
  })

  it('la tarjeta repasada más recientemente gana', () => {
    const old = card({ last_review: '2026-10-10T10:00:00.000Z', reps: 5 })
    const recent = card({ last_review: '2026-10-12T10:00:00.000Z', reps: 2, due: '2026-11-01T00:00:00.000Z' })
    const r1 = mergeProgress(base({ cards: { k: old } }), base({ cards: { k: recent } }))
    const r2 = mergeProgress(base({ cards: { k: recent } }), base({ cards: { k: old } }))
    expect(r1.cards.k).toEqual(recent)
    expect(r2.cards.k).toEqual(recent)
  })

  it('una tarjeta con repasos gana a una nueva sin repasos', () => {
    const fresh = card({ reps: 0, state: 0 })
    const reviewed = card({ reps: 1, last_review: '2026-10-12T10:00:00.000Z' })
    expect(mergeProgress(base({ cards: { k: fresh } }), base({ cards: { k: reviewed } })).cards.k).toEqual(reviewed)
  })

  it('la racha toma la del día más reciente y no pierde la mejor', () => {
    const a = base({ streak: { current: 3, best: 10, lastDay: '2026-10-10' } })
    const b = base({ streak: { current: 4, best: 4, lastDay: '2026-10-12' } })
    expect(mergeProgress(a, b).streak).toEqual({ current: 4, best: 10, lastDay: '2026-10-12' })
    expect(mergeProgress(b, a).streak).toEqual({ current: 4, best: 10, lastDay: '2026-10-12' })
    const c = base({ streak: { current: 2, best: 2, lastDay: '2026-10-12' } })
    expect(mergeProgress(b, c).streak.current).toBe(4)
  })

  it('XP: se conserva la mayor', () => {
    expect(mergeProgress(base({ xp: 50 }), base({ xp: 80 })).xp).toBe(80)
  })

  it('es conmutativa e idempotente', () => {
    const a = base({ xp: 10, lessonsRead: { m: ['l1'] }, cards: { k: card({ last_review: '2026-10-10T00:00:00.000Z' }) } })
    const b = base({ xp: 20, lessonsRead: { m: ['l1', 'l2'] }, exams: { m: { best: 1, passed: true, attempts: 1 } } })
    const ab = mergeProgress(a, b)
    expect(sameProgress(ab, mergeProgress(b, a))).toBe(true)
    expect(sameProgress(mergeProgress(ab, ab), ab)).toBe(true)
    expect(sameProgress(mergeProgress(ab, a), ab)).toBe(true)
  })
})

describe('sameProgress', () => {
  it('ignora el orden de las claves', () => {
    const a = base({ lessonsRead: { x: ['1'], y: ['2'] } })
    const b = base({ lessonsRead: { y: ['2'], x: ['1'] } })
    expect(sameProgress(a, b)).toBe(true)
  })
  it('detecta diferencias', () => {
    expect(sameProgress(base({ xp: 1 }), base({ xp: 2 }))).toBe(false)
  })
})
