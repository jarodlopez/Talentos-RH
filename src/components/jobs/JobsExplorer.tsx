"use client";

/**
 * Explorador de vacantes (tema oscuro estilo "Find Jobs"):
 * tabs de filtro con acento lima, buscador y tarjetas de colores.
 * Reutilizado por la bolsa pública y la home del candidato.
 */
import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { JobColorCard } from "@/components/jobs/JobColorCard";
import { DEMO_JOBS } from "@/lib/demoJobs"; // TEMP DEMO
import type { JobPost, WorkMode } from "@/types";

type ModeFilter = "all" | WorkMode;

const TABS: { key: ModeFilter; label: string }[] = [
  { key: "all", label: "Descubrir" },
  { key: "remote", label: "Remoto" },
  { key: "hybrid", label: "Híbrido" },
  { key: "onsite", label: "Presencial" },
];

export function JobsExplorer() {
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
        // TEMP DEMO: fallback cuando no hay vacantes reales.
        setJobs(list.length ? list : DEMO_JOBS);
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
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition ${
              filter === t.key
                ? "bg-[#c8f04a] text-slate-900"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Buscador */}
      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Busca empresa o puesto…"
            className="w-full rounded-2xl border border-slate-700 bg-slate-900 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#c8f04a]"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
          No hay vacantes que coincidan.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.map((job, i) => (
            <JobColorCard key={job.jobId} job={job} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
