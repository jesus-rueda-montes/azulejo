import { MarkdownView } from '../MarkdownView'

interface Props {
  hints: string[]
  revealed: number
  onReveal: () => void
}

export function HintPanel({ hints, revealed, onReveal }: Props) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-bold text-sky-900">Pistas</span>
        {revealed < hints.length ? (
          <button
            type="button"
            onClick={onReveal}
            className="inline-flex min-h-11 items-center rounded-full border border-sky-300 bg-surface px-4 text-sm font-semibold text-sky-800 hover:bg-sky-100"
          >
            Ver pista {revealed + 1} de {hints.length}
          </button>
        ) : (
          <span className="text-xs text-sky-800">No hay más pistas</span>
        )}
      </div>
      <p className="mt-1 text-xs text-sky-800">Usar pistas no resta puntos ni afecta a tu progreso.</p>
      {revealed > 0 && (
        <ol className="mt-3 space-y-2">
          {hints.slice(0, revealed).map((h, i) => (
            <li key={i} className="flex gap-2 text-sm [&_p]:my-0">
              <span className="font-semibold text-sky-700">{i + 1}.</span>
              <MarkdownView source={h} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
