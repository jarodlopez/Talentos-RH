"use client";

/**
 * Tarjeta de vacante colorida (referencia "Find Jobs"):
 * bloque de color con logo, título, chips y descripción, más un pie
 * blanco con fecha de publicación y salario. El color rota por índice.
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

const CARD_COLORS = [
  { bg: "bg-[#c8f04a]", dark: true }, // lima
  { bg: "bg-[#ef4444]", dark: false }, // rojo
  { bg: "bg-[#f5a623]", dark: true }, // ámbar
  { bg: "bg-[#3b82f6]", dark: false }, // azul
  { bg: "bg-[#a855f7]", dark: false }, // violeta
];

function toMs(v: unknown): number | null {
  if (!v) return null;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return isNaN(t) ? null : t;
  }
  if (typeof v === "object" && v !== null && "seconds" in v) {
    return (v as { seconds: number }).seconds * 1000;
  }
  return null;
}

function postedAgo(v: unknown): string | null {
  const ms = toMs(v);
  if (!ms) return null;
  const days = Math.floor((Date.now() - ms) / 86_400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "hace 1 día";
  if (days < 30) return `hace ${days} días`;
  const m = Math.floor(days / 30);
  return `hace ${m} ${m === 1 ? "mes" : "meses"}`;
}

function shortSalary(job: JobPost): string | null {
  if (!job.salaryRange) return null;
  const k = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`);
  const { currency, min, max } = job.salaryRange;
  return `${currency} ${k(min)}–${k(max)}`;
}

export function JobColorCard({ job, index = 0 }: { job: JobPost; index?: number }) {
  const c = CARD_COLORS[index % CARD_COLORS.length];
  const textMain = c.dark ? "text-slate-900" : "text-white";
  const textSub = c.dark ? "text-slate-800/80" : "text-white/80";
  const chip = c.dark
    ? "border-slate-900/25 text-slate-900"
    : "border-white/40 text-white";
  const posted = postedAgo(job.createdAt);
  const salary = shortSalary(job);

  return (
    <Link
      href={`/jobs/${job.jobId}`}
      className={`block overflow-hidden rounded-3xl ${c.bg} p-1.5 shadow-card transition hover:-translate-y-0.5`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
              {(job.companyName || "?").charAt(0).toUpperCase()}
            </span>
            <div>
              <h3 className={`font-bold leading-tight ${textMain}`}>{job.title}</h3>
              <p className={`text-sm ${textSub}`}>{job.companyName}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">
            Ver ↗
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Chip className={chip}>📍 {job.location || "N/D"}</Chip>
          <Chip className={chip}>{WORK_MODE_LABEL[job.workMode] ?? job.workMode}</Chip>
          <Chip className={chip}>{TYPE_LABEL[job.employmentType] ?? job.employmentType}</Chip>
        </div>

        <p className={`mt-3 line-clamp-2 text-sm ${textSub}`}>{job.description}</p>
      </div>

      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
        <span className="text-xs text-slate-500">
          🕐 {posted ? `Publicado ${posted}` : "Reciente"}
        </span>
        {salary && <span className="text-sm font-bold text-slate-900">{salary}</span>}
      </div>
    </Link>
  );
}

function Chip({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}
