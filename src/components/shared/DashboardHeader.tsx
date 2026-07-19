"use client";

/**
 * Barra de navegación (tema oscuro, acento lima).
 * Links según el rol, ruta activa resaltada, acceso admin y logout.
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
  { href: "/candidate/dashboard", label: "Vacantes" },
  { href: "/candidate/profile", label: "Mi perfil" },
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
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8f04a] text-sm text-slate-900">
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
                    ? "bg-[#c8f04a] text-slate-900"
                    : "text-slate-300 hover:bg-slate-800"
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
              className="hidden rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800 sm:inline-block"
            >
              Admin
            </Link>
          )}
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8f04a] text-xs font-bold text-slate-900">
            {initial}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
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
