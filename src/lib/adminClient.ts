"use client";

/**
 * Cliente para consumir las API Routes de administración.
 * Adjunta el ID token del usuario actual como Bearer en cada petición;
 * el servidor lo verifica y comprueba los permisos de admin.
 */
import { getFirebaseAuth } from "@/lib/firebase/client";

async function authHeaders(): Promise<Record<string, string>> {
  const user = getFirebaseAuth().currentUser;
  if (!user) throw new Error("No autenticado.");
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function adminGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: await authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Error en la petición.");
  return data as T;
}

export async function adminPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { ...(await authHeaders()), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? "Error en la petición.");
  return data as T;
}

/** ¿El usuario actual es admin? Nunca lanza; devuelve false ante cualquier fallo. */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const res = await adminGet<{ isAdmin: boolean }>("/api/admin/me");
    return res.isAdmin;
  } catch {
    return false;
  }
}
