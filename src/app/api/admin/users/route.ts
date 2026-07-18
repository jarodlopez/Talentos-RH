import { NextResponse, type NextRequest } from "next/server";
import { AdminError, requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

function toIso(value: unknown): string | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return null;
}

/**
 * Lista todos los usuarios con su estado administrativo:
 * rol, verificación (empleadores) y si están dados de baja (Auth).
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);

    const db = getAdminDb();
    const [usersSnap, employersSnap, authList] = await Promise.all([
      db.collection(COLLECTIONS.USERS).get(),
      db.collection(COLLECTIONS.EMPLOYERS).get(),
      getAdminAuth().listUsers(1000),
    ]);

    const verifiedByUid = new Map(
      employersSnap.docs.map((d) => [d.id, Boolean(d.data().verified)])
    );
    const disabledByUid = new Map(
      authList.users.map((u) => [u.uid, u.disabled])
    );

    const users = usersSnap.docs.map((d) => {
      const data = d.data();
      return {
        uid: d.id,
        email: data.email ?? "",
        displayName: data.displayName ?? "",
        role: data.role ?? "candidate",
        verified: verifiedByUid.has(d.id) ? verifiedByUid.get(d.id) : null,
        disabled: disabledByUid.get(d.id) ?? false,
        createdAt: toIso(data.createdAt),
      };
    });

    // Más recientes primero (los sin fecha, al final).
    users.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    return NextResponse.json({ users });
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status });
  }
}
