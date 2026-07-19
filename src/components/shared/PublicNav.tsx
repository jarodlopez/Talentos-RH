import Link from "next/link";

/** Barra de navegación para páginas públicas (tema oscuro). */
export function PublicNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8f04a] text-sm text-slate-900">
            T
          </span>
          Talentos-RH
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Iniciar sesión
          </Link>
        </div>
      </div>
    </header>
  );
}
