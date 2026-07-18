export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-700">
        Bloque 2 · Esqueleto inicializado
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
        <span className="rounded-lg bg-brand-600 px-5 py-2.5 font-medium text-white opacity-60">
          Iniciar sesión (próximo bloque)
        </span>
        <span className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 opacity-60">
          Ver vacantes (próximo bloque)
        </span>
      </div>
    </main>
  );
}
