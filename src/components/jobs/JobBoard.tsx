"use client";

/**
 * Bolsa de trabajo pública: lista vacantes "open" con buscador y chips de
 * filtro por modalidad, al estilo de una app de empleo moderna.
 */
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { JobCard } from "@/components/jobs/JobCard";
import type { JobPost, WorkMode } from "@/types";

type ModeFilter = "all" | WorkMode;

const FILTERS: { key: ModeFilter; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "remote", label: "Remoto" },
  { key: "hybrid", label: "Híbrido" },
  { key: "onsite", label: "Presencial" },
];

export function JobBoard() {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ModeFilter>("all");

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesMode = filter === "all" || j.workMode === filter;
      const matchesSearch =
        !q ||
        j.title.toLowerCase().includes(q) ||
        j.companyName.toLowerCase().includes(q) ||
        (j.requiredSkills ?? []).some((s) => s.toLowerCase().includes(q));
      return matchesMode && matchesSearch;
    });
  }, [jobs, search, filter]);

  return (
    <div>
      {/* Buscador */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por puesto, empresa o habilidad…"
          className="input py-3 pl-11"
        />
      </div>

      {/* Chips de filtro */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === f.key
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {!loading && !error && (
        <p className="mb-4 text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}
        </p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          No hay vacantes que coincidan con tu búsqueda.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <JobCard key={job.jobId} job={job} />
          ))}
        </div>
      )}
    </div>
  );
}
