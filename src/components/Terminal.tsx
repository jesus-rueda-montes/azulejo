import { useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { CliSpec } from '../content/schema'
import { acceptCandidate, applyCompletion, complete } from '../engine/cli'

export interface TermLine {
  kind: 'cmd' | 'out' | 'err'
  text: string
}

interface Props {
  spec?: CliSpec
  value: string
  onChange: (v: string) => void
  /** Enter. Si no se pasa, Enter no hace nada (p. ej. durante el examen). */
  onSubmit?: () => void
  /** Líneas ya ejecutadas que se muestran encima del prompt. */
  lines?: TermLine[]
  disabled?: boolean
}

/**
 * Terminal simulada: Tab autocompleta (subcomandos, recursos, flags y valores),
 * al escribir "-" aparece la lista de flags con su descripción, ↑/↓ recorre la
 * lista o el historial y Esc la cierra.
 */
export function Terminal({ spec, value, onChange, onSubmit, lines = [], disabled }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const history = useRef<string[]>([])
  const [historyIdx, setHistoryIdx] = useState<number | null>(null)
  const [listRequested, setListRequested] = useState(false)
  const [selected, setSelected] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const completion = useMemo(() => (spec && !disabled ? complete(spec, value) : null), [spec, value, disabled])
  const candidates = completion?.candidates ?? []
  const exactOnly = candidates.length === 1 && candidates[0].value === completion?.partial
  const listOpen =
    candidates.length > 0 && !exactOnly && !dismissed && (listRequested || !!completion?.partial.startsWith('-'))

  const change = (v: string) => {
    onChange(v)
    setListRequested(false)
    setDismissed(false)
    setSelected(0)
    setHistoryIdx(null)
  }

  const tab = () => {
    if (!completion) return
    // Como en bash: Tab completa lo que es inequívoco; si no avanza, muestra
    // la lista; con la lista abierta, Tab elige la opción resaltada.
    if (listOpen && candidates[selected] && (listRequested || selected > 0)) {
      change(acceptCandidate(value, completion, candidates[selected].value))
    } else {
      const r = applyCompletion(value, completion)
      if (r.changed) change(r.line)
      else {
        setListRequested(true)
        setDismissed(false)
      }
    }
    inputRef.current?.focus()
  }

  // ↑/↓: recorre la lista si está abierta; si no, el historial.
  const move = (dir: 1 | -1) => {
    if (listOpen) {
      setSelected((s) => (s + dir + candidates.length) % candidates.length)
    } else if (history.current.length) {
      const h = history.current
      const next = historyIdx === null ? (dir < 0 ? h.length - 1 : null) : historyIdx + dir
      if (next === null || next >= h.length) {
        onChange('')
        setHistoryIdx(null)
      } else if (next >= 0) {
        onChange(h[next])
        setHistoryIdx(next)
      }
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      tab()
    } else if (e.key === 'Escape') {
      setListRequested(false)
      setDismissed(true)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      move(e.key === 'ArrowDown' ? 1 : -1)
    } else if (e.key === 'Enter' && onSubmit && value.trim()) {
      e.preventDefault()
      history.current = [...history.current.filter((c) => c !== value.trim()), value.trim()]
      setHistoryIdx(null)
      setListRequested(false)
      onSubmit()
    }
  }

  // Teclas que no tienen los teclados de móvil.
  const keyBtn = 'min-h-11 min-w-12 rounded-lg border border-term-line bg-term-bar px-3 font-mono text-sm text-term-ink active:bg-term-select'

  return (
    <div className="overflow-hidden rounded-2xl border border-term-line bg-term font-mono text-sm text-term-ink">
      <div className="flex items-center gap-1.5 border-b border-term-line px-3.5 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-term-accent" />
        <span className="h-2.5 w-2.5 rounded-full bg-term-flag" />
        <span className="h-2.5 w-2.5 rounded-full bg-sea-blue" />
        <span className="ml-2 text-xs text-term-muted">terminal simulada</span>
      </div>

      <div className="space-y-0.5 p-3.5" onClick={() => inputRef.current?.focus()}>
        {lines.map((l, i) => (
          <pre
            key={i}
            className={`break-all whitespace-pre-wrap ${l.kind === 'err' ? 'text-red-300' : l.kind === 'out' ? 'text-[#c9e2ec]' : 'text-term-ink'}`}
          >
            {l.kind === 'cmd' ? <span className="text-term-accent">$ </span> : null}
            {l.text}
          </pre>
        ))}

        {!disabled && (
          <div className="flex items-center gap-2">
            <span className="text-term-accent">$</span>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => change(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal"
              aria-autocomplete="list"
              aria-expanded={listOpen}
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              className="min-w-0 flex-1 bg-transparent text-term-ink caret-term-accent outline-none"
            />
            {spec && (
              <button
                type="button"
                onClick={tab}
                className="hidden rounded-md border border-term-line px-2 py-0.5 text-xs text-term-muted hover:bg-term-bar sm:block"
                title="Autocompletar (tecla Tab)"
              >
                Tab ⇥
              </button>
            )}
          </div>
        )}
      </div>

      {listOpen && (
        <ul role="listbox" className="mx-2 mb-2 max-h-56 overflow-y-auto rounded-xl bg-term-bar p-1">
          {candidates.map((c, i) => (
            <li
              key={c.value}
              role="option"
              aria-selected={i === selected}
              onMouseDown={(e) => {
                e.preventDefault()
                change(acceptCandidate(value, completion!, c.value))
                inputRef.current?.focus()
              }}
              className={`flex cursor-pointer gap-3 rounded-lg px-3 py-1.5 ${i === selected ? 'bg-term-select' : 'hover:bg-term-line'}`}
            >
              <span className="shrink-0 text-term-flag">{c.value}</span>
              {c.description && <span className="truncate font-sans text-xs leading-5 text-term-muted">{c.description}</span>}
            </li>
          ))}
        </ul>
      )}

      {!disabled && (
        <>
          <div className="flex flex-wrap gap-2 border-t border-term-line p-2.5 sm:hidden">
            {spec && (
              <button type="button" onClick={tab} className={keyBtn}>
                Tab
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                change(value + '-')
                inputRef.current?.focus()
              }}
              className={keyBtn}
            >
              -
            </button>
            <button type="button" aria-label="Arriba" onClick={() => move(-1)} className={keyBtn}>
              ↑
            </button>
            <button type="button" aria-label="Abajo" onClick={() => move(1)} className={keyBtn}>
              ↓
            </button>
          </div>
          <p className="hidden border-t border-term-line px-3.5 py-1.5 font-sans text-xs text-term-muted sm:block">
            Tab: autocompletar · ↑↓: {listOpen ? 'elegir' : 'historial'} · Enter: ejecutar{listOpen ? ' · Esc: cerrar lista' : ''}
          </p>
        </>
      )}
    </div>
  )
}
