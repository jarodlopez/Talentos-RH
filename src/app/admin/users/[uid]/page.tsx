"use client";

/**
 * Vista de inspección (solo lectura) de un usuario: sus datos de cuenta,
 * su perfil (empresa o candidato) y su estado en Auth.
 */
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { adminGet } from "@/lib/adminClient";

interface UserDetail {
  user: Record<string, unknown>;
  profile: Record<string, unknown> | null;
  profileType: "employer" | "candidate";
  auth: { disabled: boolean; lastSignIn: string | null; creationTime: string | null };
}

export default function AdminUserDetailPage() {
  const params = useParams<{ uid: string }>();
  const uid = params?.uid;
  const [data, setData] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    let active = true;
    (async () => {
      try {
        const res = await adminGet<UserDetail>(`/api/admin/users/${uid}`);
        if (active) setData(res);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Error al cargar.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [uid]);

  return (
    <AdminGuard>
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/admin" className="text-sm text-brand-600 hover:underline">
          ← Volver a usuarios
        </Link>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        {loading ? (
          <p className="text-gray-500">Cargando…</p>
        ) : error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : data ? (
          <div className="flex flex-col gap-6">
            <Section title="Cuenta">
              <DataGrid data={data.user} />
            </Section>

            <Section title="Estado de acceso (Auth)">
              <DataGrid
                data={{
                  disabled: data.auth.disabled ? "Sí (dado de baja)" : "No",
                  lastSignIn: data.auth.lastSignIn ?? "—",
                  creationTime: data.auth.creationTime ?? "—",
                }}
              />
            </Section>

            <Section
              title={
                data.profileType === "employer" ? "Perfil de empresa" : "Perfil de candidato"
              }
            >
              {data.profile ? (
                <DataGrid data={data.profile} />
              ) : (
                <p className="text-sm text-gray-500">Sin perfil registrado.</p>
              )}
            </Section>
          </div>
        ) : null}
      </main>
    </AdminGuard>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function DataGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <dt className="text-xs uppercase tracking-wide text-gray-400">{key}</dt>
          <dd className="break-words text-sm text-gray-800">{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) return value.length ? JSON.stringify(value) : "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}
