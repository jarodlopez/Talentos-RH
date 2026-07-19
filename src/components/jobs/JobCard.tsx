"use client";

/**
 * Tarjeta de vacante estilo app moderna: logo de empresa en color,
 * título, empresa, chips de atributos y footer con aplicantes/salario.
 */
import Link from "next/link";
import type { JobPost } from "@/types";

const WORK_MODE_LABEL: Record<string, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
};
const TYPE_LABEL: Record<string, string> = {
  "full-time": "Tiempo completo",
  "part-time": "Medio tiempo",
  contract: "Contrato",
};

const LOGO_COLORS = [
  "bg-indigo-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-teal-500",
];

function logoColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length];
}

export function CompanyLogo({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  const dim = size === "lg" ? "h-14 w-14 text-xl rounded-2xl" : "h-11 w-11 text-base rounded-xl";
  return (
    <span
      className={`flex shrink-0 items-center justify-center font-bold text-white ${dim} ${logoColor(
        name
      )}`}
    >
      {initial}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
      {children}
    </span>
  );
}

export function JobCard({ job }: { job: JobPost }) {
  const salary = job.salaryRange
    ? `${job.salaryRange.currency} ${job.salaryRange.min.toLocaleString()}–${job.salaryRange.max.toLocaleString()}`
    : null;

  return (
    <Link
      href={`/jobs/${job.jobId}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"
    >
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.companyName} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900 group-hover:text-brand-700">
            {job.title}
          </h3>
          <p className="truncate text-sm text-slate-500">{job.companyName}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip>{WORK_MODE_LABEL[job.workMode] ?? job.workMode}</Chip>
        <Chip>{TYPE_LABEL[job.employmentType] ?? job.employmentType}</Chip>
        {job.location && <Chip>📍 {job.location}</Chip>}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">
          {job.applicationsCount ?? 0}{" "}
          {(job.applicationsCount ?? 0) === 1 ? "aplicante" : "aplicantes"}
        </span>
        {salary && <span className="font-semibold text-brand-700">{salary}</span>}
      </div>
    </Link>
  );
}
