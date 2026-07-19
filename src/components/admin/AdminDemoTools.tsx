"use client";

/**
 * Herramientas de demo para el admin: generar o eliminar ofertas de
 * ejemplo para poblar la bolsa mientras se prueba la plataforma.
 */
import { useState } from "react";
import { adminPost } from "@/lib/adminClient";

export function AdminDemoTools() {
  const [busy, setBusy] = useState<"seed" | "clear" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "seed" | "clear") {
    setBusy(action);
    setMessage(null);
    setError(null);
    try {
      const res = await adminPost<{ created?: number; deleted?: number }>(
        "/api/admin/seed-demo",
        { action }
      );
      setMessage(
        action === "seed"
          ? `Se generaron ${res.created} ofertas demo.`
          : `Se eliminaron ${res.deleted} ofertas demo.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="mr-auto">
        <p className="font-semibold text-white">Ofertas de demostración</p>
        <p className="text-sm text-slate-400">
          Genera vacantes de ejemplo para poblar la bolsa mientras pruebas.
        </p>
      </div>
      <button
        onClick={() => run("seed")}
        disabled={busy !== null}
        className="btn-primary"
      >
        {busy === "seed" ? "Generando…" : "Generar ofertas demo"}
      </button>
      <button
        onClick={() => run("clear")}
        disabled={busy !== null}
        className="btn-secondary"
      >
        {busy === "clear" ? "Eliminando…" : "Eliminar demos"}
      </button>
      {message && <p className="w-full text-sm text-emerald-600">{message}</p>}
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </div>
  );
}
