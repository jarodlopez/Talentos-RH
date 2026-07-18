"use client";

/**
 * Lista de aplicaciones del candidato actual, con su estado y (cuando
 * exista) el feedback de la IA.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Application } from "@/types";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: "Pendiente de evaluación", className: "bg-amber-100 text-amber-700" },
  evaluated: { label: "Evaluada", className: "bg-blue-100 text-blue-700" },
  reviewed: { label: "Revisada", className: "bg-indigo-100 text-indigo-700" },
  shortlisted: { label: "Preseleccionado", className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "No seleccionado", className: "bg-gray-100 text-gray-600" },
};

export function CandidateApplicationsList() {
  const { firebaseUser } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    (async () => {
      try {
        const q = query(
          collection(getDb(), COLLECTIONS.APPLICATIONS),
          where("candidateId", "==", firebaseUser.uid)
        );
        const snap = await getDocs(q);
        if (!active) return;
        setApps(snap.docs.map((d) => d.data() as Application));
      } catch {
        if (active) setError("No se pudieron cargar tus aplicaciones.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  if (loading) return <p className="text-gray-500">Cargando…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  if (apps.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-gray-600">Aún no has aplicado a ninguna vacante.</p>
        <Link
          href="/jobs"
          className="mt-3 inline-block rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white hover:bg-brand-700"
        >
          Ver vacantes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {apps.map((app) => {
        const status = STATUS_LABEL[app.status] ?? STATUS_LABEL.pending;
        return (
          <div
            key={app.applicationId}
            className="rounded-xl border border-gray-200 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-semibold text-gray-900">{app.jobTitle}</h2>
              <span
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            {app.aiEvaluation?.candidateFeedback && (
              <div className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-800">
                <span className="font-medium">Feedback: </span>
                {app.aiEvaluation.candidateFeedback}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
