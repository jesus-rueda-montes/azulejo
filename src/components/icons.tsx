// Iconos de trazo (decorativos: el texto de al lado da el significado).
const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

type P = { className?: string }

export const HomeIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
  </svg>
)

export const MapIcon = (p: P) => (
  <svg {...base} {...p}>
    <path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
)

export const CardsIcon = (p: P) => (
  <svg {...base} {...p}>
    <rect x="3" y="6" width="14" height="14" rx="2" />
    <path d="M7 2h12a2 2 0 0 1 2 2v12" />
  </svg>
)

export const SettingsIcon = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1" />
  </svg>
)

export const LockIcon = (p: P) => (
  <svg {...base} width={20} height={20} {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
)

export const CheckCircleIcon = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12.5l2.7 2.7L16 10" />
  </svg>
)

export const PlayCircleIcon = (p: P) => (
  <svg {...base} stroke="none" fill="currentColor" {...p}>
    <circle cx="12" cy="12" r="11" />
    <path d="M10 8l6 4-6 4z" fill="#fff" />
  </svg>
)

/** Logotipo: mosaico de tres azulejos colocados y el cuarto girado (aprender es completar el mosaico). */
export const Logo = (p: P) => (
  <svg width={32} height={32} viewBox="0 0 96 96" aria-hidden {...p}>
    <rect x="8" y="8" width="38" height="38" rx="9" fill="#0f7c86" />
    <rect x="50" y="8" width="38" height="38" rx="9" fill="#1d6fb8" />
    <rect x="8" y="50" width="38" height="38" rx="9" fill="#0b4f6c" />
    <rect x="55" y="55" width="28" height="28" rx="7" fill="#5fd3df" transform="rotate(45 69 69)" />
  </svg>
)
