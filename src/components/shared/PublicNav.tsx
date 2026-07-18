import Link from "next/link";

/** Barra de navegación para páginas públicas (bolsa de trabajo). */
export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            T
          </span>
          Talentos-RH
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/jobs" className="btn-ghost">
            Vacantes
          </Link>
          <Link href="/login" className="btn-secondary">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
