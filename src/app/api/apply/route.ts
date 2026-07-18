import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { AdminError, verifyCaller } from "@/lib/auth/requireAdmin";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS, buildApplicationId } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

/**
 * Crea una aplicación a una vacante.
 * - Verifica al candidato autenticado.
 * - Toma un snapshot del perfil y de la pregunta mostrada.
 * - Impide duplicados (ID determinístico + create()).
 * - Incrementa el contador de la vacante.
 * La evaluación con IA se añadirá en el siguiente bloque (status: pending).
 */
export async function POST(request: NextRequest) {
  try {
    const caller = await verifyCaller(request);

    const body = (await request.json()) as {
      jobId?: string;
      questionId?: string;
      answer?: string;
    };
    const { jobId, questionId, answer } = body;

    if (!jobId || !questionId || !answer || answer.trim() === "") {
      return NextResponse.json(
        { error: "Faltan datos (jobId, questionId, answer)." },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    // Candidato debe tener perfil.
    const candidateSnap = await db
      .collection(COLLECTIONS.CANDIDATES)
      .doc(caller.uid)
      .get();
    if (!candidateSnap.exists) {
      return NextResponse.json(
        { error: "Necesitas completar tu Master Profile antes de aplicar." },
        { status: 400 }
      );
    }
    const candidate = candidateSnap.data()!;

    // Vacante debe estar abierta.
    const jobRef = db.collection(COLLECTIONS.JOB_POSTS).doc(jobId);
    const jobSnap = await jobRef.get();
    if (!jobSnap.exists || jobSnap.data()?.status !== "open") {
      return NextResponse.json(
        { error: "La vacante no está disponible." },
        { status: 404 }
      );
    }
    const job = jobSnap.data()!;

    // La pregunta debe pertenecer al pool de la vacante.
    const questions = (job.situationalQuestions ?? []) as {
      id: string;
      question: string;
    }[];
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Pregunta inválida para esta vacante." },
        { status: 400 }
      );
    }

    const applicationId = buildApplicationId(jobId, caller.uid);
    const appRef = db.collection(COLLECTIONS.APPLICATIONS).doc(applicationId);

    const application = {
      applicationId,
      jobId,
      candidateId: caller.uid,
      employerId: job.employerId,
      jobTitle: job.title ?? "",
      candidateName: candidate.fullName ?? "",
      candidateHeadline: candidate.headline ?? "",
      situationalQuestionId: questionId,
      situationalQuestion: question.question,
      situationalAnswer: answer.trim(),
      aiEvaluation: null,
      status: "pending",
      appliedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    try {
      // create() falla si ya existe -> impide duplicados.
      await appRef.create(application);
    } catch {
      return NextResponse.json(
        { error: "Ya aplicaste a esta vacante." },
        { status: 409 }
      );
    }

    await jobRef.update({ applicationsCount: FieldValue.increment(1) });

    return NextResponse.json({ ok: true, applicationId });
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status });
  }
}
