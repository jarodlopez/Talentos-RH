import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
        Bloque 3 · Autenticación lista
      </span>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        Talentos-RH
      </h1>
      <p className="max-w-xl text-lg text-gray-600">
        Crea tu <strong>Master Profile</strong> una vez y aplica a vacantes con
        una sola pregunta situacional. La IA evalúa tu perfil y te da feedback
        instantáneo.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white transition hover:bg-brand-700"
        >
          Iniciar sesión
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
