import { use, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ExerciseInput } from '../components/exercises/ExerciseInput'
import { HintPanel } from '../components/exercises/HintPanel'
import { LoadBoundary } from '../components/LoadBoundary'
import { LockedNotice } from '../components/LockedNotice'
import { loadExercises, type Module } from '../content/loader'
import { MarkdownView } from '../components/MarkdownView'
import type { Exercise } from '../content/schema'
import { emptyAnswer, isAnswered, isSupported, type GradeResult } from '../engine/grade'
import { gradeExercise } from '../lib/gradeExercise'
import { exerciseKey } from '../engine/progress'
import { useProgress } from '../store/progressStore'
import { Placeholder } from './Placeholder'
import { useModuleAccess } from './useModuleAccess'

export function ExercisePage() {
  const { exerciseId = '' } = useParams()
  const { mod, locked, reasons, progress } = useModuleAccess()
  const index = mod?.exercises.findIndex((e) => e.id === exerciseId) ?? -1
  if (!mod || index === -1) return <Placeholder title="Ejercicio no encontrado" phase="ninguna" />
  const base = `/modulo/${mod.trackId}/${mod.slug}`

  return (
    <section className="max-w-3xl">
      <Link to={base} className="text-sm text-muted hover:text-ink">
        ← {mod.title}
      </Link>
      <p className="mt-2 font-display font-bold">
        Ejercicio {index + 1} de {mod.exercises.length}
      </p>
      {/* Progreso por segmentos: resueltos, el actual y los pendientes. */}
      <div className="mt-2 mb-4 flex gap-1" aria-hidden>
        {mod.exercises.map((e, i) => (
          <span
            key={e.id}
            className={`h-1.5 flex-1 rounded-full ${
              i === index ? 'bg-sea-blue' : progress.exercises[exerciseKey(mod.ref, e.id)]?.solved ? 'bg-primary' : 'bg-line'
            }`}
          />
        ))}
      </div>
      {locked ? (
        <div className="mt-4">
          <LockedNotice reasons={reasons} />
        </div>
      ) : (
        <LoadBoundary what="el ejercicio">
          <LoadedPractice
            mod={mod}
            exerciseId={exerciseId}
            next={mod.exercises[index + 1] ? `${base}/ejercicio/${mod.exercises[index + 1].id}` : undefined}
            back={base}
          />
        </LoadBoundary>
      )}
    </section>
  )
}

// Los ejercicios del módulo se descargan al entrar al primero (loadExercises cachea la promesa).
function LoadedPractice({ mod, exerciseId, next, back }: { mod: Module; exerciseId: string; next?: string; back: string }) {
  const ex = use(loadExercises(mod)).find((e) => e.id === exerciseId)
  if (!ex) return <Placeholder title="Ejercicio no encontrado" phase="ninguna" />
  // key: al cambiar de ejercicio se reinicia todo el estado local.
  return <Practice key={ex.id} ex={ex} moduleRef={mod.ref} next={next} back={back} />
}

function Practice({ ex, moduleRef, next, back }: { ex: Exercise; moduleRef: string; next?: string; back: string }) {
  const key = exerciseKey(moduleRef, ex.id)
  const { attempt, hintUsed } = useProgress()
  const solvedBefore = useProgress((s) => s.exercises[key]?.solved ?? false)
  const [answer, setAnswer] = useState(() => emptyAnswer(ex))
  const [result, setResult] = useState<GradeResult>()
  const [hints, setHints] = useState(0)
  const [failedOnce, setFailedOnce] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [grading, setGrading] = useState(false)
  const [gradeError, setGradeError] = useState<string>()
  const supported = isSupported(ex)

  const check = async () => {
    if (!isAnswered(answer) || result || grading) return
    setGrading(true)
    setGradeError(undefined)
    let r: GradeResult
    try {
      r = await gradeExercise(ex, answer)
    } catch {
      setGradeError('No se pudo cargar el corrector. Revisa tu conexión y vuelve a intentarlo.')
      return
    } finally {
      setGrading(false)
    }
    setResult(r)
    attempt(key, r.correct)
    if (!r.correct) setFailedOnce(true)
    else setShowSolution(true)
  }

  const retry = () => {
    setResult(undefined)
    setShowSolution(false)
  }

  return (
    <div className="mt-2 space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="text-lg [&_p]:my-1">
          <MarkdownView source={ex.prompt} />
        </div>
        {solvedBefore && <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">✓ Resuelto</span>}
      </div>

      <ExerciseInput ex={ex} answer={answer} onChange={setAnswer} result={result} onSubmit={check} />

      {supported && (
        // En móvil, las acciones quedan fijas encima de la barra de pestañas.
        <div className="sticky bottom-[calc(3.3rem+max(0.5rem,env(safe-area-inset-bottom)))] z-30 -mx-4 flex flex-wrap gap-3 border-t border-line bg-bg/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          {!result && (
            <button
              type="button"
              onClick={check}
              disabled={!isAnswered(answer) || grading}
              className="min-h-12 flex-1 rounded-full bg-primary px-6 font-bold text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
            >
              {grading ? 'Comprobando…' : 'Comprobar'}
            </button>
          )}
          {result && !result.correct && (
            <button type="button" onClick={retry} className="rounded-full border border-line-strong px-5 py-2.5 hover:bg-primary-faint">
              Intentar de nuevo
            </button>
          )}
          {failedOnce && !showSolution && (
            <button
              type="button"
              onClick={() => setShowSolution(true)}
              className="rounded-full border border-line-strong px-5 py-2.5 hover:bg-primary-faint"
            >
              Ver solución explicada
            </button>
          )}
          {result?.correct && (
            <Link to={next ?? back} className="rounded-full bg-emerald-700 px-5 py-2.5 font-medium text-white hover:bg-emerald-800">
              {next ? 'Siguiente ejercicio →' : 'Volver al módulo'}
            </Link>
          )}
        </div>
      )}

      {gradeError && <p className="text-sm text-red-700">{gradeError}</p>}

      {result && (
        <p className={`font-medium ${result.correct ? 'text-emerald-700' : 'text-red-700'}`}>
          {result.correct ? '¡Correcto!' : 'No es correcto todavía. Revisa lo marcado en rojo, usa una pista o vuelve a intentarlo.'}
        </p>
      )}

      {showSolution && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">Solución explicada</p>
          {ex.solution.answer && (
            <pre className="mt-2 overflow-x-auto rounded-2xl bg-term px-3 py-2 font-mono text-sm text-term-ink">{ex.solution.answer}</pre>
          )}
          <div className="text-sm [&_p]:my-2">
            <MarkdownView source={ex.solution.explanation} />
          </div>
        </div>
      )}

      {supported && !result?.correct && (
        <HintPanel
          hints={ex.hints}
          revealed={hints}
          onReveal={() => {
            setHints((h) => h + 1)
            hintUsed(key)
          }}
        />
      )}
    </div>
  )
}
