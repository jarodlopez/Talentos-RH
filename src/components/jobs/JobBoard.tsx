"use client";

/**
 * Bolsa de trabajo pública: lista las vacantes con estado "open".
 * Lectura pública permitida por las Security Rules.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { JobPost } from "@/types";

const WORK_MODE_LABEL: Record<string, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
};

export function JobBoard() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const q = query(
          collection(getDb(), COLLECTIONS.JOB_POSTS),
          where("status", "==", "open")
        );
        const snap = await getDocs(q);
        if (!active) return;
        const list = snap.docs.map((d) => d.data() as JobPost);
        list.sort((a, b) => (b.jobId ?? "").localeCompare(a.jobId ?? ""));
        setJobs(list);
      } catch {
        if (active) setError("No se pudieron cargar las vacantes.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = jobs.filter(
    (j) =>
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.companyName.toLowerCase().includes(q) ||
      (j.requiredSkills ?? []).some((s) => s.toLowerCase().includes(q))
  );

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por puesto, empresa o habilidad…"
        className="mb-6 w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-brand-500"
      />

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <p className="text-gray-500">Cargando vacantes…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No hay vacantes disponibles por ahora.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((job) => (
            <Link
              key={job.jobId}
              href={`/jobs/${job.jobId}`}
              className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-900">{job.title}</h2>
                  <p className="text-sm text-gray-500">{job.companyName}</p>
                </div>
                <span className="whitespace-nowrap rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  {WORK_MODE_LABEL[job.workMode] ?? job.workMode}
                </span>
              </div>
              {job.location && (
                <p className="mt-2 text-sm text-gray-500">📍 {job.location}</p>
              )}
              {(job.requiredSkills ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.requiredSkills.slice(0, 6).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
