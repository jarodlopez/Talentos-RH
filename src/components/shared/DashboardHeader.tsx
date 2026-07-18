"use client";

/**
 * Encabezado común de los dashboards: muestra el nombre del usuario y
 * un botón para cerrar sesión.
 */
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export function DashboardHeader({ area }: { area: string }) {
  const router = useRouter();
  const { appUser, firebaseUser, logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const name = appUser?.displayName ?? firebaseUser?.email ?? "Usuario";

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-brand-600">
          {area}
        </span>
        <p className="text-sm text-gray-700">Hola, {name}</p>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      >
        Cerrar sesión
      </button>
    </header>
  );
}
