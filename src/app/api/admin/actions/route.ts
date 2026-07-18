import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { AdminError, requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

type Action = "setVerified" | "setDisabled" | "setRole";

/**
 * Ejecuta acciones administrativas sobre un usuario. Todas pasan por
 * requireAdmin (token verificado + email en allowlist) y usan el Admin SDK.
 */
export async function POST(request: NextRequest) {
  try {
    const caller = await requireAdmin(request);

    const body = (await request.json()) as {
      action?: Action;
      uid?: string;
      value?: unknown;
    };
    const { action, uid, value } = body;

    if (!action || !uid) {
      return NextResponse.json(
        { error: "Faltan parámetros (action, uid)." },
        { status: 400 }
      );
    }

    // Un admin no puede darse de baja ni cambiarse el rol a sí mismo
    // (evita quedar bloqueado fuera del sistema).
    if (uid === caller.uid && (action === "setDisabled" || action === "setRole")) {
      return NextResponse.json(
        { error: "No puedes aplicar esta acción sobre tu propia cuenta." },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    switch (action) {
      case "setVerified": {
        if (typeof value !== "boolean") {
          return NextResponse.json({ error: "value debe ser boolean." }, { status: 400 });
        }
        await db.collection(COLLECTIONS.EMPLOYERS).doc(uid).set(
          { verified: value, updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );
        return NextResponse.json({ ok: true });
      }

      case "setDisabled": {
        if (typeof value !== "boolean") {
          return NextResponse.json({ error: "value debe ser boolean." }, { status: 400 });
        }
        await getAdminAuth().updateUser(uid, { disabled: value });
        return NextResponse.json({ ok: true });
      }

      case "setRole": {
        if (value !== "candidate" && value !== "employer") {
          return NextResponse.json(
            { error: "value debe ser 'candidate' o 'employer'." },
            { status: 400 }
          );
        }
        await db.collection(COLLECTIONS.USERS).doc(uid).set(
          { role: value, updatedAt: FieldValue.serverTimestamp() },
          { merge: true }
        );

        // Aseguramos que exista el documento de perfil del nuevo rol.
        const profileCollection =
          value === "employer" ? COLLECTIONS.EMPLOYERS : COLLECTIONS.CANDIDATES;
        const profileRef = db.collection(profileCollection).doc(uid);
        const profileSnap = await profileRef.get();
        if (!profileSnap.exists) {
          const userSnap = await db.collection(COLLECTIONS.USERS).doc(uid).get();
          const displayName = userSnap.data()?.displayName ?? "";
          const email = userSnap.data()?.email ?? "";
          if (value === "employer") {
            await profileRef.set({
              uid,
              companyName: displayName,
              companyLogo: null,
              industry: "",
              website: "",
              description: "",
              contactEmail: email,
              verified: false,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
          } else {
            await profileRef.set({
              uid,
              fullName: displayName,
              headline: "",
              location: "",
              phone: "",
              summary: "",
              skills: [],
              experience: [],
              education: [],
              integrityTest: null,
              profileCompleteness: 0,
              createdAt: FieldValue.serverTimestamp(),
              updatedAt: FieldValue.serverTimestamp(),
            });
          }
        }
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: "Acción no soportada." }, { status: 400 });
    }
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status });
  }
}
