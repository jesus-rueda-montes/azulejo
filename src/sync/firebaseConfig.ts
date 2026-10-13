import type { FirebaseOptions } from 'firebase/app'

// Configuración web del proyecto de Firebase (consola de Firebase → Configuración
// del proyecto → Tus apps → SDK). No es secreta: el acceso lo limitan las reglas
// de Firestore (`firestore.rules`). Con `null`, la sincronización está desactivada
// y la app no carga Firebase.
export const firebaseConfig: FirebaseOptions | null = {
  apiKey: 'AIzaSyAwIZjoyDOXXsDACXUWS70ic69dpWDA6TM',
  authDomain: 'dualidad-5101e.firebaseapp.com',
  projectId: 'dualidad-5101e',
  storageBucket: 'dualidad-5101e.firebasestorage.app',
  messagingSenderId: '1004931104560',
  appId: '1:1004931104560:web:baef69224168268a44d2f5',
}
