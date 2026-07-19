"use client";

/**
 * Tarjeta de empleo estilo "match" (referencia Matching Jobs):
 * logo, salario arriba a la derecha, empresa/puesto y aplicantes.
 * Variante `featured` con fondo oscuro para destacar.
 */
import Link from "next/link";
import { CompanyLogo } from "@/components/jobs/JobCard";
import type { JobPost } from "@/types";

function shortSalary(job: JobPost): string | null {
  if (!job.salaryRange) return null;
  const k = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}K` : `${n}`);
  const { currency, min, max } = job.salaryRange;
  return `${currency} ${k(min)}–${k(max)}`;
}

function AvatarStack({ count, dark }: { count: number; dark?: boolean }) {
  const shown = Math.min(3, Math.max(0, count));
  const ring = dark ? "ring-slate-900" : "ring-white";
  const colors = ["bg-indigo-400", "bg-rose-400", "bg-amber-400"];
  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {Array.from({ length: shown }).map((_, i) => (
          <span
            key={i}
            className={`h-6 w-6 rounded-full ring-2 ${ring} ${colors[i % colors.length]}`}
          />
        ))}
        {shown === 0 && (
          <span className={`h-6 w-6 rounded-full ring-2 ${ring} bg-slate-300`} />
        )}
      </div>
      <span className={`text-xs ${dark ? "text-slate-300" : "text-slate-500"}`}>
        {count} {count === 1 ? "aplicó" : "aplicaron"}
      </span>
    </div>
  );
}

export function JobMatchCard({
  job,
  featured = false,
}: {
  job: JobPost;
  featured?: boolean;
}) {
  const salary = shortSalary(job);

  return (
    <Link
      href={`/jobs/${job.jobId}`}
      className={`flex w-64 shrink-0 flex-col justify-between rounded-3xl p-5 shadow-card transition hover:-translate-y-0.5 ${
        featured
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-slate-50 text-slate-900"
      }`}
    >
      <div className="flex items-start justify-between">
        <CompanyLogo name={job.companyName} />
        {salary && (
          <div className="text-right">
            <p className={`text-sm font-bold ${featured ? "text-white" : "text-slate-900"}`}>
              {salary}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-bold">{job.companyName}</h3>
        <p className={`text-sm ${featured ? "text-slate-300" : "text-slate-500"}`}>
          {job.title}
        </p>
      </div>

      <div className="mt-6">
        <AvatarStack count={job.applicationsCount ?? 0} dark={featured} />
      </div>
    </Link>
  );
}
