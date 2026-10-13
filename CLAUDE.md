## Reglas de Memoria y Contexto

1. **Gestión de Lógica y Memoria de Desarrollo:**
   - Mantén y actualiza una sección en este documento (o un archivo dedicado como `DECISIONS.md` / `ARCHITECTURE.md`) con la lógica clave del proyecto, la estructura de componentes, decisiones de diseño de software y el estado actual del desarrollo.
   - Antes de realizar cambios significativos, revisa y actualiza la documentación de arquitectura para asegurar continuidad entre ventanas de contexto.

2. **Cero Invención / Asunciones (Strict No-Hallucination Policy):**
   - Si no sabes cómo resolver un problema, falta información sobre una librería/API, o hay múltiples formas de implementar una funcionalidad con implicaciones de diseño: **NO te inventes la solución ni asumas intenciones**.
   - Haz una pausa y realiza preguntas claras y directas al usuario especificando las alternativas posibles con sus pros y contras.
## Proyecto: Azulejo

App web personal (SPA estática, sin servidor propio ni IA; sincronización opcional del progreso con Firebase, decisión 70) para aprender cloud con Microsoft Azure: los fundamentos de **AZ-900** y la administración práctica de **AZ-104** con la Azure CLI.

- Itinerarios (`content/tracks.json`): `az900` (8 módulos, niveles 1-3) y `az104` (8 módulos, niveles 1-4). Máximo 10 módulos por itinerario y módulos concisos (decisión 63).
- Especificación de CLI: `content/cli-specs/az.json`, generada desde learn.microsoft.com (decisión 62).
- Deriva de Kubernetete (decisión 59). Repositorio en GitHub: `github.com/jesus-rueda-montes/azulejo`, con Pages (decisión 68).
- Arquitectura y estado actual: [ARCHITECTURE.md](ARCHITECTURE.md)
- Decisiones de diseño y su motivo: [DECISIONS.md](DECISIONS.md)
- Temario (módulos y su estado): [TEMARIO.md](TEMARIO.md)

### Diseño visual
Bocetos: https://claude.ai/artifact/L8gotG1CgQrwtKzpJLDoHK. Dirección elegida (decisión 56):
- **Base: «Laguna»** (boceto B): tema claro de agua poco profunda. Fondo `#effafc`, superficies blancas con borde `#cdeef3`, texto `#0b2e45`, texto secundario `#4a6b80`, primario turquesa oscuro `#0f7c86`, azul de apoyo `#1d6fb8`, azul marino `#0b4f6c` en el bloque destacado con olas. Tipografías: Sora (títulos) y Source Sans 3 (texto). Botones y navegación en forma de píldora.
- **Mapa de itinerarios: metáfora «Profundidad»** (boceto C): cada nivel es una capa del océano, más oscura cuanto más profunda (Superficie `#cdf2f6` → Aguas medias `#0e6f86` → Abismo `#062a44`). Estados del módulo: aprobado, disponible y bloqueado.
- **Ejercicio de terminal en móvil: «Sonar»** (boceto D): progreso por segmentos, terminal con sugerencias de flags, teclas rápidas (Tab, -, ↑, ↓) y botones fijos abajo «Pista» / «Comprobar»; barra de pestañas inferior. Con los colores de Laguna: toda la app es clara y solo la terminal y el editor de código son oscuros.
- Contraste mínimo 4.5:1 en texto y objetivos táctiles de al menos 44 px.

### Comandos
- `npm run dev`: servidor de desarrollo
- `npm test`: tests (Vitest)
- `npm run test:e2e`: test e2e (Playwright; la primera vez: `npx playwright install chromium`)
- `npm run lint`: lint (oxlint)
- `npm run build`: typecheck + build de producción

### Reglas de contenido
- Idioma: español, con los términos técnicos en inglés.
- Cada lección sigue la plantilla fija (qué problema resuelve, analogía, concepto, ejemplo, errores comunes, lo que debes saber, resumen). Ver ARCHITECTURE.md.
- Los comandos y flags de `content/cli-specs/` se transcriben de la documentación oficial, con la URL de origen. Nunca se inventan.
- Las pistas nunca penalizan (ni XP, ni nota, ni racha, ni desbloqueo). En los exámenes no hay pistas, pero sí autocompletado.
