import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { yaml } from '@codemirror/lang-yaml'
import { bracketMatching, indentOnInput, indentUnit, syntaxHighlighting } from '@codemirror/language'
import { Compartment, EditorState } from '@codemirror/state'
import { drawSelection, EditorView, highlightActiveLine, highlightActiveLineGutter, keymap, lineNumbers } from '@codemirror/view'
import { classHighlighter } from '@lezer/highlight'
import { useEffect, useRef, useState } from 'react'

// Editor de código (CodeMirror 6). Se carga de forma diferida: solo se descarga
// al abrir un ejercicio de editor.

interface Props {
  language: 'yaml' | 'json'
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  ariaLabel?: string
}

const theme = EditorView.theme(
  {
    '&': { backgroundColor: '#061a2a', color: '#e6f6fb', fontSize: '14px' },
    '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', caretColor: '#2dd4bf' },
    '.cm-gutters': { backgroundColor: '#0a2236', color: '#6f93a8', border: 'none' },
    '.cm-activeLine': { backgroundColor: '#0a223680' },
    '.cm-activeLineGutter': { backgroundColor: '#12364f' },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: '#124a66 !important' },
    '&.cm-focused': { outline: 'none' },
    '.cm-cursor': { borderLeftColor: '#2dd4bf' },
  },
  { dark: true },
)

export default function CodeEditor({ language, value, onChange, readOnly = false, ariaLabel = 'Editor de código' }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const view = useRef<EditorView | null>(null)
  const readOnlyConf = useRef(new Compartment())
  const onChangeRef = useRef(onChange)
  // Props iniciales: el editor se crea una sola vez; los cambios posteriores
  // se aplican con los efectos de más abajo.
  const [initial] = useState(() => ({ language, value, readOnly, ariaLabel }))

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Crear el editor una sola vez.
  useEffect(() => {
    const v = new EditorView({
      parent: host.current!,
      state: EditorState.create({
        doc: initial.value,
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          drawSelection(),
          history(),
          indentOnInput(),
          bracketMatching(),
          // YAML no admite tabuladores y en JSON se usan 2 espacios por convención.
          indentUnit.of('  '),
          EditorState.tabSize.of(2),
          keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
          initial.language === 'yaml' ? yaml() : json(),
          syntaxHighlighting(classHighlighter),
          theme,
          readOnlyConf.current.of(EditorState.readOnly.of(initial.readOnly)),
          EditorView.contentAttributes.of({ 'aria-label': initial.ariaLabel, autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false' }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) onChangeRef.current(u.state.doc.toString())
          }),
        ],
      }),
    })
    view.current = v
    return () => v.destroy()
  }, [initial])

  // Sincronizar cambios externos (p. ej. "reiniciar").
  useEffect(() => {
    const v = view.current
    if (v && v.state.doc.toString() !== value) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } })
  }, [value])

  useEffect(() => {
    view.current?.dispatch({ effects: readOnlyConf.current.reconfigure(EditorState.readOnly.of(readOnly)) })
  }, [readOnly])

  return <div ref={host} className="overflow-hidden rounded-2xl border border-term-line" />
}
