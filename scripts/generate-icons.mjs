// Genera los iconos PNG de la PWA a partir del logotipo (public/favicon.svg)
// renderizándolo con el Chromium de Playwright. Uso: node scripts/generate-icons.mjs
import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/favicon.svg', import.meta.url), 'utf8')
const BG = '#effafc' // fondo de la paleta Laguna

// `padding`: margen alrededor del logo en proporción al lado. Los iconos
// "maskable" necesitan el logo dentro del 80 % central (zona segura de Android).
const icons = [
  { file: 'pwa-192.png', size: 192, padding: 0.04, background: 'transparent' },
  { file: 'pwa-512.png', size: 512, padding: 0.04, background: 'transparent' },
  { file: 'maskable-512.png', size: 512, padding: 0.2, background: BG },
  { file: 'apple-touch-icon.png', size: 180, padding: 0.1, background: BG },
]

const browser = await chromium.launch()
const page = await browser.newPage()
for (const { file, size, padding, background } of icons) {
  await page.setViewportSize({ width: size, height: size })
  const inner = Math.round(size * (1 - 2 * padding))
  await page.setContent(
    `<html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${background}">` +
      `<div style="width:${inner}px;height:${inner}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`,
  )
  await page.screenshot({ path: new URL(`../public/${file}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1'), omitBackground: background === 'transparent' })
  console.log(`public/${file} (${size}×${size})`)
}
await browser.close()
