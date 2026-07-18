"use client";

/**
 * Cliente HTTP autenticado para API Routes.
 * Adjunta el ID token del usuario actual como Bearer; el servidor lo
 * verifica. Úsalo para cualquier ruta que requiera sesión.
 */
import { getFirebaseAuth } from "@/lib/firebase/client";

async function authHeaders(): Promise<Record<string, string>> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("Debes iniciar sesión.");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: await authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Error en la petición.");
  return data as T;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Error en la petición.");
  return data as T;
}
