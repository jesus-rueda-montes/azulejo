import type { FirebaseOptions } from 'firebase/app'
import { exportProgress, importProgress } from '../engine/progressFile'
import type { ProgressState } from '../engine/progress'

// Acceso a Firebase (Auth con Google + Firestore). El SDK se carga bajo demanda:
// solo se descarga si la sincronización está configurada.
//
// Cada usuario tiene un documento `users/{uid}` con el progreso en el mismo
// formato que la copia JSON (`exportProgress`), así se valida y migra igual al leerlo.

export interface CloudUser {
  uid: string
  name: string | null
  email: string | null
}

type Services = Awaited<ReturnType<typeof load>>
let services: Promise<Services> | null = null

async function load(config: FirebaseOptions) {
  const [{ initializeApp }, auth, fs] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
  const app = initializeApp(config)
  return { auth, fs, authInstance: auth.getAuth(app), db: fs.getFirestore(app) }
}

export function initCloud(config: FirebaseOptions) {
  services ??= load(config)
}

function get(): Promise<Services> {
  if (!services) throw new Error('Firebase no está configurado')
  return services
}

export async function watchUser(cb: (user: CloudUser | null) => void): Promise<() => void> {
  const { auth, authInstance } = await get()
  return auth.onAuthStateChanged(authInstance, (u) => cb(u ? { uid: u.uid, name: u.displayName, email: u.email } : null))
}

// Ventana emergente en lugar de redirección: la app (GitHub Pages) y el dominio
// de autenticación de Firebase son distintos, y la redirección falla en
// navegadores que bloquean el almacenamiento de terceros.
export async function signInWithGoogle(): Promise<void> {
  const { auth, authInstance } = await get()
  await auth.signInWithPopup(authInstance, new auth.GoogleAuthProvider())
}

export async function signOutCloud(): Promise<void> {
  const { auth, authInstance } = await get()
  await auth.signOut(authInstance)
}

export async function readRemote(uid: string): Promise<ProgressState | null> {
  const { fs, db } = await get()
  const snap = await fs.getDoc(fs.doc(db, 'users', uid))
  const data = snap.data()?.data
  if (typeof data !== 'string') return null
  const r = importProgress(data)
  if (!r.ok) throw new Error(`La copia en la nube no es válida: ${r.error}`)
  return r.progress
}

export async function writeRemote(uid: string, progress: ProgressState): Promise<void> {
  const { fs, db } = await get()
  await fs.setDoc(fs.doc(db, 'users', uid), { data: exportProgress(progress, new Date()), updatedAt: fs.serverTimestamp() })
}
