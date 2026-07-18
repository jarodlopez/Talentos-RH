import { NextResponse, type NextRequest } from "next/server";
import {
  AdminError,
  isCallerAdmin,
  verifyCaller,
} from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

/**
 * Indica si el usuario autenticado es administrador.
 * Devuelve 200 con { isAdmin } incluso para usuarios no-admin (el cliente
 * lo usa para decidir si muestra el panel), y 401 si no hay sesión válida.
 */
export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyCaller(request);
    return NextResponse.json({ isAdmin: isCallerAdmin(decoded) });
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ isAdmin: false, error: message }, { status });
  }
}
