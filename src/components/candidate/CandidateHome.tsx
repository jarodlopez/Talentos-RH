"use client";

/**
 * Home del candidato estilo "Matching Jobs":
 * saludo + título, chips de habilidades, empleos recomendados en scroll
 * horizontal (uno destacado) y categorías por modalidad.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import { JobMatchCard } from "@/components/jobs/JobMatchCard";
import type { JobPost, WorkMode } from "@/types";

const CATEGORIES: { mode: WorkMode; label: string; emoji: string; className: string }[] = [
  { mode: "remote", label: "Remoto", emoji: "🏠", className: "bg-brand-500" },
  { mode: "hybrid", label: "Híbrido", emoji: "🔀", className: "bg-violet-500" },
  { mode: "onsite", label: "Presencial", emoji: "🏢", className: "bg-rose-500" },
];

export function CandidateHome() {
  const { firebaseUser, appUser } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [completeness, setCompleteness] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    (async () => {
      try {
        const db = getDb();
        const [jobsSnap, candSnap] = await Promise.all([
          getDocs(query(collection(db, COLLECTIONS.JOB_POSTS), where("status", "==", "open"))),
          getDoc(doc(db, COLLECTIONS.CANDIDATES, firebaseUser.uid)),
        ]);
        if (!active) return;
        const list = jobsSnap.docs.map((d) => d.data() as JobPost);
        list.sort((a, b) => (b.applicationsCount ?? 0) - (a.applicationsCount ?? 0));
        setJobs(list);
        if (candSnap.exists()) {
          setSkills(Array.isArray(candSnap.data().skills) ? candSnap.data().skills : []);
          setCompleteness(Number(candSnap.data().profileCompleteness ?? 0));
        } else {
          setCompleteness(0);
        }
      } catch {
        if (active) setCompleteness(0);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  const name = (appUser?.displayName ?? "").split(" ")[0] || "candidato";
  const initial = name.charAt(0).toUpperCase();

  const counts = useMemo(() => {
    const c: Record<string, number> = { remote: 0, hybrid: 0, onsite: 0 };
    jobs.forEach((j) => (c[j.workMode] = (c[j.workMode] ?? 0) + 1));
    return c;
  }, [jobs]);

  const chips = skills.length > 0 ? skills.slice(0, 3) : ["Remoto", "Tiempo completo"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      {/* Saludo */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
            {initial}
          </span>
          <div>
            <p className="text-sm text-slate-500">Hola,</p>
            <p className="font-semibold text-slate-900">{name}</p>
          </div>
        </div>
        <Link
          href="/jobs"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white transition hover:bg-slate-800"
          aria-label="Buscar vacantes"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </Link>
      </div>

      {/* Título */}
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900">
        Vacantes
        <br />
        para ti
      </h1>

      {/* Chips */}
      <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1">
        {chips.map((c) => (
          <span
            key={c}
            className="flex items-center gap-2 whitespace-nowrap rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700"
          >
            {c}
            <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
          </span>
        ))}
        <Link href="/jobs" className="ml-auto shrink-0 text-sm font-medium text-brand-600">
          Ver todas
        </Link>
      </div>

      {/* Nudge de completitud */}
      {completeness !== null && completeness < 100 && (
        <Link
          href="/candidate/profile"
          className="mt-5 flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm"
        >
          <span className="font-medium text-amber-800">
            Completa tu perfil ({completeness}%) para mejorar tus matches
          </span>
          <span className="font-semibold text-amber-800">Completar →</span>
        </Link>
      )}

      {/* Recomendadas */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Recomendadas</h2>
        <Link href="/jobs" className="text-sm font-medium text-slate-500">
          Ver todas
        </Link>
      </div>

      {loading ? (
        <div className="mt-4 flex gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-44 w-64 shrink-0 animate-pulse rounded-3xl bg-slate-100" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Aún no hay vacantes publicadas. Vuelve pronto.
        </div>
      ) : (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {jobs.slice(0, 8).map((job, i) => (
            <JobMatchCard key={job.jobId} job={job} featured={i === 0} />
          ))}
        </div>
      )}

      {/* Categorías */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Categorías</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.mode}
            href="/jobs"
            className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-lg ${cat.className}`}
              >
                {cat.emoji}
              </span>
              <div>
                <p className="text-sm text-slate-500">{cat.label}</p>
                <p className="font-bold text-slate-900">{counts[cat.mode] ?? 0} vacantes</p>
              </div>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              ↗
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
