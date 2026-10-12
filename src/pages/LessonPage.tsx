import { use, useMemo } from 'react'
import { Link, useParams } from 'react-router'
import { LoadBoundary } from '../components/LoadBoundary'
import { LockedNotice } from '../components/LockedNotice'
import { MarkdownView } from '../components/MarkdownView'
import { glossaryForTrack } from '../content/glossaryPlugin'
import { loadLessonBody, type Lesson } from '../content/loader'
import type { GlossaryEntry } from '../content/schema'
import { useProgress } from '../store/progressStore'
import { Placeholder } from './Placeholder'
import { useModuleAccess } from './useModuleAccess'

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const { catalog, mod, locked, reasons, progress } = useModuleAccess()
  const lessonRead = useProgress((s) => s.lessonRead)
  const index = mod?.lessons.findIndex((l) => l.id === lessonId) ?? -1
  if (!mod || index === -1) return <Placeholder title="Lección no encontrada" phase="ninguna" />

  const lesson = mod.lessons[index]
  const prev = mod.lessons[index - 1]
  const next = mod.lessons[index + 1]
  const base = `/modulo/${mod.trackId}/${mod.slug}`
  const isRead = (progress.lessonsRead[mod.ref] ?? []).includes(lesson.id)

  return (
    <article className="max-w-3xl">
      <Link to={base} className="text-sm text-muted hover:text-ink">
        ← {mod.title}
      </Link>
      <h1 className="mt-2 text-3xl font-bold">{lesson.frontmatter.title}</h1>
      <p className="mt-1 text-sm text-muted">
        Lección {index + 1} de {mod.lessons.length} · {lesson.frontmatter.minutes} min
      </p>

      {locked ? (
        <div className="mt-6">
          <LockedNotice reasons={reasons} />
        </div>
      ) : (
        <>
          <LoadBoundary key={lesson.path} what="la lección">
            <LessonBody lesson={lesson} glossary={catalog.glossary} trackId={mod.trackId} />
          </LoadBoundary>

          <div className="mt-10 rounded-2xl border border-line bg-surface p-4">
            {isRead ? (
              <p className="text-emerald-700">✓ Lección completada</p>
            ) : (
              <button
                type="button"
                onClick={() => lessonRead(mod.ref, lesson.id)}
                className="rounded-full bg-primary px-5 py-2.5 font-medium text-white hover:bg-primary-hover"
              >
                He terminado esta lección
              </button>
            )}
          </div>

          <nav className="mt-6 flex justify-between gap-4 border-t border-line pt-4 text-sm">
            {prev ? (
              <Link to={`${base}/leccion/${prev.id}`} className="text-primary hover:underline">
                ← {prev.frontmatter.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link to={`${base}/leccion/${next.id}`} className="text-right text-primary hover:underline">
                {next.frontmatter.title} →
              </Link>
            ) : mod.exercises[0] ? (
              <Link to={`${base}/ejercicio/${mod.exercises[0].id}`} className="text-right text-primary hover:underline">
                Ir a la práctica →
              </Link>
            ) : (
              <Link to={base} className="text-primary hover:underline">
                Volver al módulo →
              </Link>
            )}
          </nav>
        </>
      )}
    </article>
  )
}

// El cuerpo se descarga al abrir la lección (loadLessonBody cachea la promesa).
function LessonBody({ lesson, glossary, trackId }: { lesson: Lesson; glossary: GlossaryEntry[]; trackId: string }) {
  const body = use(loadLessonBody(lesson))
  const terms = useMemo(() => glossaryForTrack(glossary, trackId), [glossary, trackId])
  return <MarkdownView source={body} glossary={terms} />
}
