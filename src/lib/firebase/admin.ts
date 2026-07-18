/**
 * Firebase Admin SDK (inicialización perezosa / lazy).
 *
 * Se usa SOLO en el servidor (API Routes, Server Actions). Tiene
 * privilegios totales y BYPASSEA las Security Rules: úsalo para acciones
 * administrativas y para verificar tokens de sesión.
 *
 * NUNCA importes este archivo en un componente cliente.
 *
 * La inicialización es perezosa para no romper el `next build` cuando aún
 * no se han configurado las variables de entorno del servicio.
 */
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/** True solo si las 3 credenciales del Admin SDK están presentes. */
export const isAdminConfigured = Boolean(
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
);

let cachedApp: App | null = null;

function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  if (getApps().length) {
    cachedApp = getApps()[0];
    return cachedApp;
  }

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  cachedApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey,
    }),
  });
  return cachedApp;
}

/** Instancia de Auth del Admin SDK. */
export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

/** Instancia de Firestore del Admin SDK. */
export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
