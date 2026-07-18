import { NextResponse, type NextRequest } from "next/server";
import { AdminError, requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

/** Convierte Timestamps de Firestore a ISO de forma recursiva (superficial). */
function serialize(data: Record<string, unknown> | undefined) {
  if (!data) return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      typeof value === "object" &&
      "toDate" in value &&
      typeof (value as { toDate: unknown }).toDate === "function"
    ) {
      out[key] = (value as { toDate: () => Date }).toDate().toISOString();
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Detalle de inspección de un usuario: su documento users, su perfil
 * (candidate/employer) y su estado en Auth (baja, último acceso).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  try {
    await requireAdmin(request);
    const { uid } = await params;

    const db = getAdminDb();
    const userSnap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!userSnap.exists) {
      return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
    }

    const userData = userSnap.data();
    const role = userData?.role ?? "candidate";
    const profileCollection =
      role === "employer" ? COLLECTIONS.EMPLOYERS : COLLECTIONS.CANDIDATES;
    const profileSnap = await db.collection(profileCollection).doc(uid).get();

    let authInfo: { disabled: boolean; lastSignIn: string | null; creationTime: string | null } = {
      disabled: false,
      lastSignIn: null,
      creationTime: null,
    };
    try {
      const authUser = await getAdminAuth().getUser(uid);
      authInfo = {
        disabled: authUser.disabled,
        lastSignIn: authUser.metadata.lastSignInTime ?? null,
        creationTime: authUser.metadata.creationTime ?? null,
      };
    } catch {
      // El usuario podría existir en Firestore pero no en Auth; lo ignoramos.
    }

    return NextResponse.json({
      user: { uid, ...serialize(userData) },
      profile: profileSnap.exists ? serialize(profileSnap.data()) : null,
      profileType: role === "employer" ? "employer" : "candidate",
      auth: authInfo,
    });
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status });
  }
}
