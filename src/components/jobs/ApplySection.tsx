"use client";

/**
 * Sección de aplicación en el detalle de una vacante.
 * Maneja los estados según el usuario y el flujo:
 *   1. Pide al servidor una pregunta situacional al azar.
 *   2. El candidato la responde.
 *   3. Envía la aplicación al servidor.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS, buildApplicationId } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiGet, apiPost } from "@/lib/apiClient";

type Stage = "idle" | "questioning" | "submitting" | "done";

export function ApplySection({ jobId }: { jobId: string }) {
  const { loading, firebaseUser, role } = useAuth();
  const [alreadyApplied, setAlreadyApplied] = useState<boolean | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [question, setQuestion] = useState<{ id: string; text: string } | null>(null);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ¿Ya aplicó este candidato?
  useEffect(() => {
    if (loading) return;
    if (!firebaseUser || role !== "candidate") {
      setAlreadyApplied(false);
      return;
    }
    let active = true;
    (async () => {
      try {
        const appId = buildApplicationId(jobId, firebaseUser.uid);
        const snap = await getDoc(doc(getDb(), COLLECTIONS.APPLICATIONS, appId));
        if (active) setAlreadyApplied(snap.exists());
      } catch {
        if (active) setAlreadyApplied(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loading, firebaseUser, role, jobId]);

  async function startApply() {
    setError(null);
    setStage("questioning");
    try {
      const res = await apiGet<{ questionId: string; question: string }>(
        `/api/apply/question?jobId=${encodeURIComponent(jobId)}`
      );
      setQuestion({ id: res.questionId, text: res.question });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la pregunta.");
      setStage("idle");
    }
  }

  async function submit() {
    if (!question || answer.trim() === "") {
      setError("Escribe tu respuesta antes de enviar.");
      return;
    }
    setStage("submitting");
    setError(null);
    try {
      await apiPost("/api/apply", {
        jobId,
        questionId: question.id,
        answer: answer.trim(),
      });
      setStage("done");
      setAlreadyApplied(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la aplicación.");
      setStage("questioning");
    }
  }

  if (loading) return null;

  // No autenticado.
  if (!firebaseUser) {
    return (
      <Box>
        <p className="mb-3 text-sm text-gray-600">Inicia sesión como candidato para aplicar.</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          Iniciar sesión
        </Link>
      </Box>
    );
  }

  // Empleador u otro rol.
  if (role !== "candidate") {
    return (
      <Box>
        <p className="text-sm text-gray-600">
          Solo las cuentas de candidato pueden aplicar a vacantes.
        </p>
      </Box>
    );
  }

  if (stage === "done" || alreadyApplied) {
    return (
      <Box>
        <p className="font-medium text-emerald-700">¡Aplicación enviada! ✓</p>
        <p className="mt-1 text-sm text-gray-600">
          Puedes ver su estado en{" "}
          <Link href="/candidate/applications" className="text-brand-600 hover:underline">
            Mis aplicaciones
          </Link>
          .
        </p>
      </Box>
    );
  }

  return (
    <Box>
      {stage === "idle" && (
        <button
          onClick={startApply}
          className="rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition hover:bg-brand-700"
        >
          Aplicar a esta vacante
        </button>
      )}

      {(stage === "questioning" || stage === "submitting") && question && (
        <div>
          <p className="mb-1 text-sm font-medium text-gray-700">Pregunta situacional</p>
          <p className="mb-3 rounded-lg bg-gray-50 p-3 text-gray-800">{question.text}</p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={6}
            placeholder="Escribe tu respuesta…"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <button
            onClick={submit}
            disabled={stage === "submitting"}
            className="mt-3 rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {stage === "submitting" ? "Enviando…" : "Enviar aplicación"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </Box>
  );
}

function Box({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5">{children}</div>;
}
