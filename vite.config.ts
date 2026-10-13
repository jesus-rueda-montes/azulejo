/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { readFile } from 'node:fs/promises'
import { defineConfig, type Plugin } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// `leccion.md?lesson-meta` devuelve solo el bloque de frontmatter de la lección.
// Así el catálogo (títulos y minutos) va en el bundle inicial y el cuerpo de cada
// lección se descarga al abrirla.
function lessonMeta(): Plugin {
  const suffix = '?lesson-meta'
  return {
    name: 'azulejo:lesson-meta',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith(suffix)) return
      const source = await readFile(id.slice(0, -suffix.length), 'utf8')
      const frontmatter = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(source)?.[0] ?? ''
      return `export default ${JSON.stringify(frontmatter)}`
    },
  }
}

// `exercises.json?exercise-meta` devuelve solo el id y el tipo de cada ejercicio:
// basta para listarlos y contar; el archivo completo se descarga al practicar.
function exerciseMeta(): Plugin {
  const suffix = '?exercise-meta'
  return {
    name: 'azulejo:exercise-meta',
    enforce: 'pre',
    async load(id) {
      if (!id.endsWith(suffix)) return
      const data = JSON.parse(await readFile(id.slice(0, -suffix.length), 'utf8')) as { exercises?: { id?: unknown; type?: unknown }[] }
      const exercises = (data.exercises ?? []).map(({ id, type }) => ({ id, type }))
      return `export default ${JSON.stringify({ exercises })}`
    },
  }
}

// BASE_PATH lo fija el workflow de GitHub Pages (/<nombre-del-repo>/).
// En local se sirve desde la raíz.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    lessonMeta(),
    exerciseMeta(),
    react(),
    tailwindcss(),
    // PWA instalable y sin conexión (decisión 74). Se precachea todo el build,
    // también las lecciones y ejercicios bajo demanda y el SDK de Firebase,
    // para que cualquier módulo se abra sin red. Las rutas de manifest y
    // service worker toman `base`, así que funcionan en /azulejo/.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Azulejo: aprende Azure',
        short_name: 'Azulejo',
        description: 'Aprende Azure: fundamentos de AZ-900 y administración de AZ-104 con la Azure CLI.',
        lang: 'es',
        theme_color: '#0f7c86',
        background_color: '#effafc',
        display: 'standalone',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // El chunk más grande (Firebase) ronda 0,6 MB; margen para que crezca.
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  // PORT lo asigna el panel de vista previa si 5173 está ocupado.
  server: { port: Number(process.env.PORT) || 5173 },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
