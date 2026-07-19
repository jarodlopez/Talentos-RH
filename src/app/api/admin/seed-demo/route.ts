import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { AdminError, requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { DEMO_JOBS } from "@/lib/demoJobs";

export const dynamic = "force-dynamic";

const DEMO_EMPLOYER_ID = "demo-employer";

/**
 * Genera o elimina ofertas de demostración (solo admin).
 * Body: { action: "seed" | "clear" }.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = (await request.json().catch(() => ({}))) as { action?: string };
    const action = body.action ?? "seed";
    const db = getAdminDb();

    if (action === "clear") {
      const snap = await db
        .collection(COLLECTIONS.JOB_POSTS)
        .where("employerId", "==", DEMO_EMPLOYER_ID)
        .get();
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return NextResponse.json({ ok: true, deleted: snap.size });
    }

    // action === "seed"
    const batch = db.batch();
    DEMO_JOBS.forEach((job) => {
      const ref = db.collection(COLLECTIONS.JOB_POSTS).doc(job.jobId);
      batch.set(ref, {
        ...job,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    return NextResponse.json({ ok: true, created: DEMO_JOBS.length });
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status });
  }
}
