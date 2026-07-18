"use client";

/**
 * Lista de vacantes del empleador actual, con su estado y accesos a editar.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEmployerProfile } from "@/hooks/useEmployerProfile";
import type { JobPost } from "@/types";

export function EmployerJobsList() {
  const { firebaseUser } = useAuth();
  const { employer, loading: employerLoading } = useEmployerProfile();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    (async () => {
      try {
        const q = query(
          collection(getDb(), COLLECTIONS.JOB_POSTS),
          where("employerId", "==", firebaseUser.uid)
        );
        const snap = await getDocs(q);
        if (!active) return;
        const list = snap.docs.map((d) => d.data() as JobPost);
        list.sort((a, b) => (b.jobId ?? "").localeCompare(a.jobId ?? ""));
        setJobs(list);
      } catch {
        if (active) setError("No se pudieron cargar tus vacantes.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  const verified = employer?.verified === true;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mis vacantes</h1>
        {verified && (
          <Link
            href="/employer/jobs/new"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Nueva vacante
          </Link>
        )}
      </div>

      {!employerLoading && !verified && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Tu cuenta está en revisión. Podrás crear vacantes cuando sea verificada.
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando…</p>
      ) : jobs.length === 0 ? (
        <p className="text-gray-500">Aún no has creado vacantes.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {jobs.map((job) => (
            <Link
              key={job.jobId}
              href={`/employer/jobs/${job.jobId}`}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-400 hover:shadow-sm"
            >
              <div>
                <h2 className="font-semibold text-gray-900">{job.title}</h2>
                <p className="text-sm text-gray-500">
                  {job.location || "Sin ubicación"} ·{" "}
                  {job.applicationsCount ?? 0} aplicaciones
                </p>
              </div>
              <StatusBadge status={job.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: JobPost["status"] }) {
  const map: Record<string, { label: string; className: string }> = {
    open: { label: "Publicada", className: "bg-emerald-100 text-emerald-700" },
    draft: { label: "Borrador", className: "bg-gray-100 text-gray-600" },
    closed: { label: "Cerrada", className: "bg-red-100 text-red-700" },
  };
  const s = map[status] ?? map.draft;
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>
      {s.label}
    </span>
  );
}
