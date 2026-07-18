import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Nav pública */}
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="flex items-center gap-2 font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-sm text-white">
            T
          </span>
          Talentos-RH
        </span>
        <div className="flex items-center gap-2">
          <Link href="/jobs" className="btn-ghost">
            Ver vacantes
          </Link>
          <Link href="/login" className="btn-secondary">
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <span className="inline-block rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 animate-fade-in-up">
            Reclutamiento sin fricción, potenciado por IA
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl animate-fade-in-up">
            Crea tu perfil una vez.{" "}
            <span className="text-brand-600">Aplica en un clic.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 animate-fade-in-up">
            Construye tu Master Profile, responde una sola pregunta situacional
            por vacante y recibe feedback instantáneo. La IA evalúa tu encaje y
            le da a la empresa un score objetivo.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-in-up">
            <Link href="/register" className="btn-primary px-7 py-3 text-base">
              Crear mi cuenta
            </Link>
            <Link href="/jobs" className="btn-secondary px-7 py-3 text-base">
              Explorar vacantes
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-brand-50 to-transparent" />
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">
          Cómo funciona
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Step
            n="1"
            title="Crea tu Master Profile"
            desc="Tus datos, experiencia y habilidades una sola vez. Sin repetir formularios."
          />
          <Step
            n="2"
            title="Aplica con una pregunta"
            desc="Al postularte, respondes una pregunta situacional específica de la vacante."
          />
          <Step
            n="3"
            title="Recibe tu evaluación"
            desc="La IA analiza tu perfil y respuesta: feedback para ti, score para la empresa."
          />
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl bg-brand-600 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Únete como candidato o publica vacantes como empresa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="btn bg-white px-7 py-3 text-base text-brand-700 hover:bg-brand-50"
            >
              Crear cuenta
            </Link>
            <Link
              href="/jobs"
              className="btn border border-white/40 px-7 py-3 text-base text-white hover:bg-white/10"
            >
              Ver vacantes
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Talentos-RH
      </footer>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-lg font-bold text-white">
        {n}
      </span>
      <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
