/**
 * Verificación de administrador en el servidor.
 *
 * Flujo de seguridad de toda acción de admin:
 *   1. Extraer el ID token del header Authorization (Bearer).
 *   2. Verificarlo criptográficamente con el Admin SDK.
 *   3. Confirmar que el email está en la allowlist (o tiene el claim admin).
 *
 * Nunca confiamos en el cliente: el rol de admin no se lee de cookies ni
 * del body, solo del token verificado en el servidor.
 */
import type { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { getAdminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { isAdminEmail } from "./adminAllowlist";

export class AdminError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AdminError";
    this.status = status;
  }
}

/** Verifica que el llamante esté autenticado; devuelve su token decodificado. */
export async function verifyCaller(request: NextRequest): Promise<DecodedIdToken> {
  if (!isAdminConfigured) {
    throw new AdminError(
      503,
      "El Admin SDK no está configurado en el servidor (faltan variables de entorno)."
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    throw new AdminError(401, "Falta el token de autenticación.");
  }

  try {
    return await getAdminAuth().verifyIdToken(token);
  } catch {
    throw new AdminError(401, "Token inválido o expirado.");
  }
}

/** ¿El token decodificado corresponde a un admin? */
export function isCallerAdmin(decoded: DecodedIdToken): boolean {
  return isAdminEmail(decoded.email) || decoded.admin === true;
}

/** Verifica autenticación + rol admin. Lanza AdminError si no procede. */
export async function requireAdmin(request: NextRequest): Promise<DecodedIdToken> {
  const decoded = await verifyCaller(request);
  if (!isCallerAdmin(decoded)) {
    throw new AdminError(403, "No tienes permisos de administrador.");
  }
  return decoded;
}
