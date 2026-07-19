"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";
import { AdminDemoTools } from "@/components/admin/AdminDemoTools";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminPage() {
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <AdminGuard>
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-[#c8f04a]">
            Super Admin
          </span>
          <p className="text-sm text-slate-300">Gestión de usuarios y permisos</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-slate-400 hover:underline">
            Ir al sitio
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-6">
        <AdminDemoTools />
        <h1 className="mb-6 text-2xl font-bold">Usuarios</h1>
        <AdminUsersTable />
      </main>
    </AdminGuard>
  );
}
