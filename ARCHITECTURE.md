# Arquitectura de Azulejo

Azulejo deriva de **Kubernetete** (app para Cloud, Kubernetes, Terraform y Ansible): se copió el motor y se adaptó a Azure (decisión 59). Lo que sigue describe el estado actual; la historia de las fases del motor está en DECISIONS.md.

## Estado actual
- **Contenido completo**: 16 módulos en dos itinerarios (estado en [TEMARIO.md](TEMARIO.md)).
  - `az900` (Fundamentos de Azure, AZ-900): 8 módulos, niveles 1-3.
  - `az104` (Administración de Azure, AZ-104): 8 módulos, niveles 1-4. `a1-cli-arm` exige `az900/c1-arquitectura`.
- **Especificación de CLI**: solo `content/cli-specs/az.json` (182 nodos de comandos), generada desde la documentación oficial (decisión 62).
- **Glosario**: 63 términos (`content/glossary.json`).
- **Tests**: Vitest (motor, contenido, componentes; 90 tests) y Playwright (`e2e/progreso.spec.ts`, sobre `az900/c1-conceptos-cloud` → `c1-arquitectura`).
- **Sincronización opcional** con Firebase Spark (Auth con Google + Firestore), decisiones 70-73. Desactivada mientras `src/sync/firebaseConfig.ts` sea `null`.
- **PWA instalable** (decisión 74): manifest, iconos en `public/` (`pwa-192.png`, `pwa-512.png`, `maskable-512.png`, `apple-touch-icon.png`, generados con `node scripts/generate-icons.mjs`) y service worker de Workbox que precachea todo el build. Solo existe en el build de producción (`npm run build` + `npm run preview`), no en `npm run dev`.
- **Repositorio en GitHub**: `github.com/jesus-rueda-montes/azulejo` (público, decisión 68). El workflow `.github/workflows/deploy.yml` publica en GitHub Pages en cada push a `main`: `https://jesus-rueda-montes.github.io/azulejo/`.

## Estructura
```
firestore.rules                 # reglas de Firestore (se publican a mano en la consola)
content/
  tracks.json                   # itinerarios (az900, az104)
  glossary.json                 # término -> definición, módulo donde se introduce
  cli-specs/az.json             # comandos, flags, alias, descripción y URL de origen
  <itinerario>/<módulo>/
    module.json                 # título, resumen, nivel, orden, xp, prereqs
    lessons/NN-slug.md          # frontmatter + 7 secciones obligatorias
    exercises.json              # quiz | command | fill | editor (con hints[] y solution)
    flashcards.json
src/
  content/                      # schema.ts (zod), loader.ts, lesson.ts, glossaryPlugin.ts
  engine/                       # lógica pura: grade, cli, yamlAssert, srs, progress, merge, exam, badges, progressFile
    __fixtures__/               # specs kubectl, terraform y ansible heredadas, solo para tests del motor
  lib/gradeExercise.ts          # corrección (síncrona; ya no hay HCL)
  store/                        # Zustand + persist (IndexedDB), clave `azulejo-progress`
  sync/                         # firebaseConfig.ts, cloud.ts (Firebase bajo demanda), syncStore.ts (cuándo y cómo sincronizar)
  pages/                        # Dashboard, TrackMap, Lesson, Exercise, Exam, Review, Settings
  components/                   # Layout, MarkdownView, Terminal, CodeEditor, QuizCard, HintPanel…
```

## Principios
- **La lógica vive en `src/engine/`** como funciones puras sin React, testeadas con Vitest.
- **El contenido es datos**: añadir un módulo no requiere tocar código.
- **Todo el contenido se valida** en los tests (`src/content/content.test.ts`).

## Rutas
| Ruta | Página |
|---|---|
| `/#/` | Dashboard: XP, racha, repaso de hoy, "Continúa por aquí" e insignias |
| `/#/itinerarios` | Mapa de itinerarios por nivel |
| `/#/modulo/:trackId/:slug` | Módulo: lecciones, ejercicios y flashcards |
| `/#/modulo/:trackId/:slug/leccion/:lessonId` | Lección con glosario |
| `/#/modulo/:trackId/:slug/ejercicio/:exerciseId` | Práctica con pistas y solución explicada |
| `/#/modulo/:trackId/:slug/examen` | Examen del módulo |
| `/#/repaso` | Repaso de flashcards (FSRS) |
| `/#/ajustes` | Sincronización (Google), exportar, importar y borrar progreso |

## Plantilla de lección (obligatoria, en este orden)
1. Qué problema resuelve
2. Analogía
3. Concepto
4. Ejemplo
5. Errores comunes
6. Lo que debes saber (antes «En la entrevista»; decisión 65)
7. Resumen

`src/content/lesson.ts` (`REQUIRED_SECTIONS`) comprueba que estén todas y en orden.

## Validación del contenido (loader)
- Esquemas zod de cada archivo; los errores se acumulan con la ruta del archivo (`ContentError`).
- Cada comando aceptado de un ejercicio `command` se parsea con su spec: un flag que no existe, un valor que falta o un subcomando inventado hacen fallar el test.
- Los ejercicios `editor` deben tener `solution.answer` y este debe pasar todas sus aserciones.
- Glosario: `introducedIn` es el primer módulo **de su itinerario** que usa el término, y ningún módulo anterior del mismo itinerario lo usa (tests en el describe "glosario").

## Especificación de la CLI `az`
- Generada con los scripts de `scratchpad/azdocs` de la sesión de creación (no forman parte del repo): se descargan las páginas de referencia de learn.microsoft.com, se extraen los parámetros de cada comando (sin las extensiones ni los Global Parameters) y una lista curada elige comandos y flags con su descripción en español. El generador falla si un flag no aparece en la documentación.
- Reglas de conversión:
  - Forma corta y alias (`--os-type`/`--os`, `-n`…) tal como aparecen en la doc (`short`, `aliases`).
  - Flags con valores booleanos aceptados (`false, true`, o `0/1/f/n/no/t/y/yes…`): `optionalValue` (decisión 61).
  - Flags con valor por defecto `False`/`True` y sin valores aceptados: switch (`takesValue: false`).
  - El resto: con valor; si la doc da valores aceptados, se guardan en `values`.
- Flags globales escritos a mano según la doc: `--output/-o` (valores estrictos), `--query`, `--subscription`, `--debug`, `--only-show-errors`.
- Se quitaron flags cuya forma en la doc era ambigua (por ejemplo `deployment group create --what-if`, `bicep build --stdout`, `storage blob generate-sas --https-only`); los ejercicios usan los subcomandos equivalentes (`az deployment group what-if`).

## Motor de comandos (`src/engine/cli.ts`)
- `tokenize`, `parseCommand` (normaliza alias y formas de flags, errores en español), `sameCommand` (corrección semántica), `complete`/`applyCompletion` (Tab).
- `isLong`/`isShort`: los alias de una letra cuentan como forma corta.
- `optionalValue`: `--flag`, `--flag true|false|yes|0…` y `--flag=x` se normalizan al mismo booleano.

## Ejercicios de editor
- Lenguajes `yaml` y `json`. JSON es un subconjunto de YAML, así que las plantillas ARM y las políticas de lifecycle se corrigen con `gradeYaml` y las mismas rutas (`resources[0].sku.name`) (decisión 60).
- CodeMirror usa `@codemirror/lang-json` para `json`.
- `assertions[].message` dice qué se comprueba y dónde. `equals` es estricto con tipos.

## Reglas de progreso
- XP: lección +5, ejercicio resuelto por primera vez +10, examen aprobado por primera vez + `xp` del módulo.
- Pistas y "ver solución" nunca cambian XP, nota, racha ni desbloqueo (hay test).
- Desbloqueo: examen aprobado (≥ 80 %) del módulo anterior del itinerario + prereqs explícitos.
- Flashcards: entran en el repaso cuando el módulo está desbloqueado y se han leído todas sus lecciones.
- Sincronización (`src/sync/syncStore.ts`): al entrar con Google, al volver a la app, al recuperar la conexión y 3 s después de cada cambio. Lee la nube, fusiona con `mergeProgress` (`src/engine/merge.ts`), aplica el resultado en local (sin anunciar insignias) y solo escribe si algo cambió. El documento `users/{uid}` guarda el progreso en el formato de la copia JSON (`data`) y `updatedAt`, así se valida y migra como una importación.
- Copia de progreso: JSON `{ app: 'azulejo', exportedAt, progress }`, archivo `azulejo-progreso-AAAA-MM-DD.json`.

## Convenciones de redacción del contenido
- Comandos y flags: solo los de `az.json`. Los datos de producto (límites, tiers, fechas de retirada…) se comprueban en learn.microsoft.com antes de escribirlos.
- IDs de ejemplo: suscripción `11111111-2222-3333-4444-555555555555`; grupos `rg-web`, `rg-red`, `rg-tienda`…
- Los bloques ```bicep se muestran sin resaltado (no hay modo Bicep).

## Notas para tests
- Los tests de interfaz usan `az104/a1-cli-arm`: aprueban antes el itinerario az900 (`resetAndUnlock`) por su prerequisito.
- Las acciones del store devuelven una Promise (por `persist`): dentro de `act`, usar cuerpo con llaves.
- La corrección es asíncrona en la interfaz: tras "Comprobar", `await screen.findBy...`.
- `src/sync/syncStore.test.ts` simula la nube con `vi.mock('./cloud')`; ningún test usa Firebase de verdad.
- `App.test.tsx`: hay dos barras de navegación (escritorio y móvil), y jsdom no aplica el CSS que oculta una.
