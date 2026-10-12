# Azulejo

App web para aprender cloud con Microsoft Azure: los fundamentos de **AZ-900** y la administración práctica de **AZ-104** con la Azure CLI. Lecciones concisas, ejercicios (quiz, terminal simulada con autocompletado, rellenar huecos y editor JSON/YAML), exámenes por módulo y flashcards con repetición espaciada.

```bash
npm install
npm run dev
```

- Tests: `npm test` · e2e: `npm run test:e2e` (la primera vez: `npx playwright install chromium`)
- Build: `npm run build`
- Arquitectura: [ARCHITECTURE.md](ARCHITECTURE.md) · Decisiones: [DECISIONS.md](DECISIONS.md) · Temario: [TEMARIO.md](TEMARIO.md)

Aún no tiene repositorio en GitHub. Cuando lo tenga, el workflow `.github/workflows/deploy.yml` lo publica en GitHub Pages al hacer push a `main` (hay que activar *Settings → Pages → Source: GitHub Actions*).
