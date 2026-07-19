"use client";

/**
 * Selector de país (Centroamérica). Estilo oscuro.
 */
import { CENTRAL_AMERICA } from "@/lib/countries";

export function CountrySelect({
  value,
  onChange,
  includeAll = false,
  allLabel = "Todos los países",
  className = "",
}: {
  value: string;
  onChange: (code: string) => void;
  includeAll?: boolean;
  allLabel?: string;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#c8f04a] ${className}`}
    >
      {includeAll && <option value="">{allLabel}</option>}
      {CENTRAL_AMERICA.map((c) => (
        <option key={c.code} value={c.code}>
          {c.flag} {c.name}
        </option>
      ))}
    </select>
  );
}
