import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { ExercisePage } from '../pages/ExercisePage'
import { initialProgress } from '../engine/progress'
import { exportProgress } from '../engine/progressFile'
import { ReviewPage } from '../pages/ReviewPage'
import { SettingsPage } from '../pages/SettingsPage'
import { getCatalog, loadExercises } from '../content/loader'
import { useProgress } from '../store/progressStore'
import { BadgeToaster } from './BadgeToaster'
import { MarkdownView } from './MarkdownView'
afterEach(cleanup)

const MOD = 'az104/a1-cli-arm'

// a1-cli-arm exige un módulo de AZ-900: se aprueba ese itinerario para desbloquearlo.
function resetAndUnlock() {
  useProgress.getState().reset()
  for (const m of getCatalog().modules.filter((x) => x.trackId === 'az900')) useProgress.getState().exam(m, 1)
}

describe('glosario', () => {
  const glossary = [
    { term: 'Pod', definition: 'unidad mínima', introducedIn: 'k/m' },
    { term: 'Node', definition: 'una máquina', introducedIn: 'k/m' },
  ]

  test('marca solo la primera aparición, admite plural y no toca código ni títulos', () => {
    const { container } = render(
      <MarkdownView
        glossary={glossary}
        source={'## Pod\n\nUsa `Pod` aquí. Los Pods viven en un Node. Otro Pod y otro Node.'}
      />,
    )
    const marked = [...container.querySelectorAll('[role="button"]')].map((e) => e.textContent)
    expect(marked).toEqual(['Pods', 'Node'])
  })

  test('muestra la definición al pasar el ratón', () => {
    render(<MarkdownView glossary={glossary} source="Un Pod." />)
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Pod' }))
    expect(screen.getByRole('tooltip').textContent).toBe('unidad mínima')
  })
})

describe('insignias y copia de progreso', () => {
  beforeEach(() => useProgress.getState().reset())

  test('ganar una insignia muestra un aviso; importar o borrar no', () => {
    render(<BadgeToaster />)
    act(() => {
      useProgress.getState().lessonRead(MOD, '01-azure-cli')
    })
    expect(screen.getByText('¡Nueva insignia!')).toBeTruthy()
    expect(screen.getByText('Primeros pasos')).toBeTruthy()
    cleanup()

    render(<BadgeToaster />)
    act(() => {
      useProgress.getState().reset()
    })
    act(() => {
      useProgress.getState().replace({ ...useProgress.getState(), xp: 5000 })
    })
    expect(screen.queryByText('¡Nueva insignia!')).toBeNull()
  })

  test('importar una copia pide confirmación y reemplaza el progreso', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<SettingsPage />)
    const copy = exportProgress({ ...initialProgress(), xp: 321 }, new Date('2026-09-01T00:00:00Z'))
    const file = new File([copy], 'copia.json', { type: 'application/json' })
    fireEvent.change(screen.getByLabelText('Archivo de copia de progreso'), { target: { files: [file] } })
    expect(await screen.findByText('Progreso importado correctamente.')).toBeTruthy()
    expect(confirm).toHaveBeenCalledOnce()
    expect(useProgress.getState().xp).toBe(321)

    const bad = new File(['{"foo":1}'], 'otra.json')
    fireEvent.change(screen.getByLabelText('Archivo de copia de progreso'), { target: { files: [bad] } })
    expect(await screen.findByText(/no es una copia de progreso de Azulejo/)).toBeTruthy()
    confirm.mockRestore()
  })
})

describe('repaso con flashcards (contenido piloto)', () => {
  beforeEach(resetAndUnlock)

  const renderReview = () =>
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>,
    )

  test('sin lecciones terminadas no hay tarjetas y explica cómo conseguirlas', () => {
    renderReview()
    expect(screen.getByText(/No tienes tarjetas pendientes/)).toBeTruthy()
    expect(screen.getByText(/cuando terminas todas sus lecciones/)).toBeTruthy()
  })

  test('mostrar respuesta, valorar; "Otra vez" la repite en la sesión y "Bien" la saca', () => {
    const n = getCatalog().modules.find((m) => m.ref === MOD)!.flashcards.length
    useProgress.getState().lessonRead(MOD, '01-azure-cli')
    useProgress.getState().lessonRead(MOD, '02-plantillas-arm-y-bicep')
    renderReview()
    expect(screen.getByText(`0 hechas · ${n} pendientes`)).toBeTruthy()

    fireEvent.click(screen.getByText(/Mostrar respuesta/))
    fireEvent.click(screen.getByText('Otra vez'))
    expect(screen.getByText(`1 hechas · ${n} pendientes`)).toBeTruthy() // vuelve al final de la cola

    for (let i = 0; i < n; i++) {
      fireEvent.keyDown(window, { key: ' ' })
      fireEvent.keyDown(window, { key: '4' }) // Fácil
    }
    expect(screen.getByText(new RegExp(`Sesión terminada! Has repasado ${n + 1} tarjetas`))).toBeTruthy()
    expect(Object.keys(useProgress.getState().cards)).toHaveLength(n)
  })
})

describe('práctica de un ejercicio (contenido piloto)', () => {
  // La primera descarga de los ejercicios y las specs es lenta en Vitest: se hace antes.
  beforeAll(async () => {
    await loadExercises(getCatalog().modules.find((m) => m.ref === MOD)!)
  }, 30_000)
  beforeEach(resetAndUnlock)

  // Los ejercicios se descargan bajo demanda: se espera a que termine la carga.
  const renderExercise = async (id: string) => {
    render(
      <MemoryRouter initialEntries={[`/modulo/${MOD}/ejercicio/${id}`]}>
        <Routes>
          <Route path="modulo/:trackId/:slug/ejercicio/:exerciseId" element={<ExercisePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.queryByText(/Cargando el ejercicio/)).toBeNull())
  }

  test('fallar, pedir pistas y ver la solución no penaliza; acertar da XP', async () => {
    const xpBefore = useProgress.getState().xp
    await renderExercise('modo-complete')

    fireEvent.click(screen.getByText('Ver pista 1 de 1'))
    expect(screen.getByText('No hay más pistas')).toBeTruthy()

    fireEvent.click(screen.getByLabelText(/Se queda igual/))
    fireEvent.click(screen.getByText('Comprobar'))
    expect(await screen.findByText(/No es correcto todavía/)).toBeTruthy()
    fireEvent.click(screen.getByText('Ver solución explicada'))
    expect(screen.getByText('Solución explicada')).toBeTruthy()

    fireEvent.click(screen.getByText('Intentar de nuevo'))
    fireEvent.click(screen.getByLabelText(/Se borra/))
    fireEvent.click(screen.getByText('Comprobar'))
    expect(await screen.findByText('¡Correcto!')).toBeTruthy()

    const s = useProgress.getState()
    expect(s.xp - xpBefore).toBe(10)
    expect(s.exercises[`${MOD}#modo-complete`]).toEqual({ solved: true, attempts: 2, hintsUsed: 1 })
  })

  test('comando: Tab autocompleta, un error explica el motivo y el acierto muestra la salida', async () => {
    await renderExercise('cmd-list-table')
    const input = screen.getByLabelText('Terminal') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'az gro' } })
    fireEvent.keyDown(input, { key: 'Tab' })
    expect(input.value).toBe('az group ')
    fireEvent.change(input, { target: { value: 'az group ex' } })
    fireEvent.keyDown(input, { key: 'Tab' })
    expect(input.value).toBe('az group export ')

    // Al escribir "--" aparece la lista de flags con descripción
    fireEvent.change(input, { target: { value: 'az group create --lo' } })
    expect(screen.getByRole('option', { name: /--location/ })).toBeTruthy()

    fireEvent.change(input, { target: { value: 'az resource list --imagen' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(await screen.findByText(/flag desconocido: --imagen/)).toBeTruthy()

    fireEvent.click(screen.getByText('Intentar de nuevo'))
    fireEvent.change(screen.getByLabelText('Terminal'), { target: { value: 'az resource list -g rg-tienda -o table' } })
    fireEvent.keyDown(screen.getByLabelText('Terminal'), { key: 'Enter' })
    expect(await screen.findByText('¡Correcto!')).toBeTruthy()
  })

  test('rellenar huecos: Tab completa usando el contexto del comando', async () => {
    await renderExercise('fill-export')
    const verbo = screen.getByLabelText('hueco verbo') as HTMLInputElement
    fireEvent.change(verbo, { target: { value: 'ex' } })
    fireEvent.keyDown(verbo, { key: 'Tab' })
    expect(verbo.value).toBe('export')
    const flag = screen.getByLabelText('hueco flag') as HTMLInputElement
    fireEvent.change(flag, { target: { value: 'exp' } })
    fireEvent.keyDown(flag, { key: 'Tab' })
    expect(flag.value).toBe('export-format')
  })

  test('rellenar huecos marca cada hueco', async () => {
    await renderExercise('fill-export')
    fireEvent.change(screen.getByLabelText('hueco verbo'), { target: { value: 'export' } })
    fireEvent.change(screen.getByLabelText('hueco flag'), { target: { value: 'format' } })
    fireEvent.click(screen.getByText('Comprobar'))
    await screen.findByText(/No es correcto todavía/)
    expect(screen.getByLabelText('hueco verbo').className).toMatch(/emerald/)
    expect(screen.getByLabelText('hueco flag').className).toMatch(/red/)
  })
})
