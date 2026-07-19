"use client";

/**
 * Detalle de una vacante (tema oscuro) + sección para aplicar.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { ApplySection } from "@/components/jobs/ApplySection";
import { findDemoJob } from "@/lib/demoJobs"; // TEMP DEMO
import type { JobPost } from "@/types";

const WORK_MODE_LABEL: Record<string, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
};
const TYPE_LABEL: Record<string, string> = {
  "full-time": "Tiempo completo",
  "part-time": "Medio tiempo",
  contract: "Por contrato",
};

export function JobDetail({ jobId }: { jobId: string }) {
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), COLLECTIONS.JOB_POSTS, jobId));
        if (!active) return;
        if (snap.exists() && snap.data().status === "open") {
          setJob(snap.data() as JobPost);
        } else {
          const demo = findDemoJob(jobId); // TEMP DEMO
          if (demo) setJob(demo);
          else setNotFound(true);
        }
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [jobId]);

  if (loading) return <p className="text-slate-400">Cargando…</p>;

  if (notFound || !job) {
    return (
      <div>
        <p className="text-slate-300">Esta vacante no está disponible.</p>
        <Link href="/jobs" className="mt-2 inline-block text-[#c8f04a] hover:underline">
          ← Ver todas las vacantes
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/jobs" className="text-sm text-[#c8f04a] hover:underline">
          ← Todas las vacantes
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c8f04a] text-xl font-bold text-slate-900">
            {(job.companyName || "?").charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{job.title}</h1>
            <p className="text-lg text-slate-400">{job.companyName}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Tag>{WORK_MODE_LABEL[job.workMode] ?? job.workMode}</Tag>
          <Tag>{TYPE_LABEL[job.employmentType] ?? job.employmentType}</Tag>
          {job.location && <Tag>📍 {job.location}</Tag>}
          {job.salaryRange && (
            <Tag>
              {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} –{" "}
              {job.salaryRange.max.toLocaleString()}
            </Tag>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="mb-2 font-semibold text-white">Descripción</h2>
        <p className="whitespace-pre-wrap text-slate-300">{job.description}</p>
      </section>

      {(job.requiredSkills ?? []).length > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="mb-3 font-semibold text-white">Habilidades requeridas</h2>
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-[#c8f04a]/15 px-3 py-1 text-sm text-[#c8f04a]"
              >
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      <ApplySection jobId={jobId} />
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-slate-700 px-3 py-1 text-slate-300">
      {children}
    </span>
  );
}
