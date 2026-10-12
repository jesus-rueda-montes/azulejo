import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { expect, test } from 'vitest'
import App from './App'

test('renderiza la portada dentro del layout', async () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
  )
  expect(await screen.findByRole('heading', { name: /Bienvenido a Azulejo/ })).toBeTruthy()
  // Dos barras de navegación: escritorio y pestañas de móvil (jsdom no aplica el CSS que oculta una).
  expect(screen.getAllByRole('link', { name: 'Itinerarios' })).toHaveLength(2)
})
