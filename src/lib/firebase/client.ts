/**
 * Firebase Client SDK (inicialización perezosa / lazy).
 *
 * Se usa en el navegador (componentes cliente) para autenticación y
 * lecturas permitidas por las Security Rules.
 *
 * ¿Por qué lazy? Si inicializáramos Auth/Firestore al importar el módulo,
 * getAuth() se ejecutaría también en el servidor durante el `next build`
 * y fallaría si aún no hay variables de entorno. Con getters perezosos,
 * la conexión solo ocurre cuando el navegador realmente la necesita.
 *
 * IMPORTANTE: nunca hagas escrituras de datos sensibles (scores,
 * evaluaciones) desde aquí. Eso vive en el servidor con Admin SDK.
 */
import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * True solo si las variables mínimas de Firebase están presentes.
 * Útil para mostrar mensajes amigables cuando aún no se han configurado
 * las variables de entorno en Vercel.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;

function getFirebaseApp(): FirebaseApp {
  if (cachedApp) return cachedApp;
  cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return cachedApp;
}

/** Devuelve la instancia de Auth, inicializándola en el primer uso. */
export function getFirebaseAuth(): Auth {
  if (cachedAuth) return cachedAuth;
  cachedAuth = getAuth(getFirebaseApp());
  return cachedAuth;
}

/** Devuelve la instancia de Firestore, inicializándola en el primer uso. */
export function getDb(): Firestore {
  if (cachedDb) return cachedDb;
  cachedDb = getFirestore(getFirebaseApp());
  return cachedDb;
}
