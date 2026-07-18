"use client";

/**
 * Barra de navegación de la app autenticada.
 * Muestra links según el rol, resalta la ruta activa e incluye acceso a
 * admin (si aplica) y menú de usuario con cierre de sesión.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { checkIsAdmin } from "@/lib/adminClient";

interface NavItem {
  href: string;
  label: string;
}

const CANDIDATE_NAV: NavItem[] = [
  { href: "/candidate/dashboard", label: "Panel" },
  { href: "/candidate/profile", label: "Mi perfil" },
  { href: "/jobs", label: "Vacantes" },
  { href: "/candidate/applications", label: "Mis aplicaciones" },
];

const EMPLOYER_NAV: NavItem[] = [
  { href: "/employer/dashboard", label: "Panel" },
  { href: "/employer/jobs", label: "Mis vacantes" },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DashboardHeader({ area }: { area?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { appUser, firebaseUser, role, logout } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    checkIsAdmin().then((ok) => active && setIsAdmin(ok));
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const nav = role === "employer" ? EMPLOYER_NAV : CANDIDATE_NAV;
  const name = appUser?.displayName ?? firebaseUser?.email ?? "Usuario";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            T
          </span>
          <span className="hidden sm:inline">Talentos-RH</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 sm:inline-block"
            >
              Admin
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-1 sm:pr-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
              {initial}
            </span>
            <span className="hidden max-w-[120px] truncate text-sm text-slate-700 sm:inline">
              {name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
