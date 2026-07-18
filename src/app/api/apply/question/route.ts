import { NextResponse, type NextRequest } from "next/server";
import { AdminError, verifyCaller } from "@/lib/auth/requireAdmin";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

/**
 * Devuelve UNA pregunta situacional elegida al azar por el servidor para
 * una vacante. El candidato no puede escoger; recibe la que le toca.
 */
export async function GET(request: NextRequest) {
  try {
    await verifyCaller(request);

    const jobId = request.nextUrl.searchParams.get("jobId");
    if (!jobId) {
      return NextResponse.json({ error: "Falta jobId." }, { status: 400 });
    }

    const jobSnap = await getAdminDb()
      .collection(COLLECTIONS.JOB_POSTS)
      .doc(jobId)
      .get();

    if (!jobSnap.exists || jobSnap.data()?.status !== "open") {
      return NextResponse.json(
        { error: "La vacante no está disponible." },
        { status: 404 }
      );
    }

    const questions = (jobSnap.data()?.situationalQuestions ?? []) as {
      id: string;
      question: string;
    }[];
    if (questions.length === 0) {
      return NextResponse.json(
        { error: "La vacante no tiene preguntas configuradas." },
        { status: 400 }
      );
    }

    const picked = questions[Math.floor(Math.random() * questions.length)];
    return NextResponse.json({
      questionId: picked.id,
      question: picked.question,
    });
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status });
  }
}
