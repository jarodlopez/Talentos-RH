"use client";

/**
 * Pantalla para completar el registro cuando un usuario entró con Google
 * pero aún no tiene rol asignado. Le pedimos elegir candidato/empleador
 * y creamos su perfil.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UserRole } from "@/types";

type PublicRole = Exclude<UserRole, "admin">;

export default function CompleteProfilePage() {
  const router = useRouter();
  const { loading, firebaseUser, role, assignRole } = useAuth();
  const [selected, setSelected] = useState<PublicRole>("candidate");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    // Si no hay sesión, fuera.
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    // Si ya tiene rol, no tiene nada que completar.
    if (role) {
      router.replace(role === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
    }
  }, [loading, firebaseUser, role, router]);

  async function handleContinue() {
    setError(null);
    setSubmitting(true);
    try {
      const created = await assignRole(selected);
      router.replace(
        created.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard"
      );
    } catch {
      setError("No se pudo completar el registro. Intenta de nuevo.");
      setSubmitting(false);
    }
  }

  if (loading || !firebaseUser || role) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando…</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">Un último paso</h1>
        <p className="mb-6 text-sm text-gray-500">
          ¿Cómo vas a usar Talentos-RH?
        </p>

        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            active={selected === "candidate"}
            title="Candidato"
            subtitle="Busco empleo"
            onClick={() => setSelected("candidate")}
          />
          <RoleCard
            active={selected === "employer"}
            title="Empleador"
            subtitle="Publico vacantes"
            onClick={() => setSelected("employer")}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={handleContinue}
          disabled={submitting}
          className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting ? "Creando perfil…" : "Continuar"}
        </button>
      </div>
    </main>
  );
}

function RoleCard({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-3 text-left transition ${
        active ? "border-brand-600 bg-brand-50" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="block font-semibold text-gray-900">{title}</span>
      <span className="block text-xs text-gray-500">{subtitle}</span>
    </button>
  );
}
