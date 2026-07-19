import Link from "next/link";
import { CompanyLogo, Chip } from "@/components/jobs/JobCard";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden">
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
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-block rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
            Reclutamiento potenciado por IA
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            No pierdas tu <span className="text-brand-600">próxima</span> oportunidad
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-600">
            Crea tu Master Profile una vez, responde una pregunta situacional por
            vacante y recibe feedback instantáneo. La IA evalúa tu encaje real.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-primary px-7 py-3.5 text-base">
              Empezar gratis
            </Link>
            <Link href="/jobs" className="btn-secondary px-7 py-3.5 text-base">
              Explorar vacantes
            </Link>
          </div>
          <div className="mt-10 flex gap-8">
            <Stat value="1 clic" label="para aplicar" />
            <Stat value="IA" label="evalúa tu perfil" />
            <Stat value="0" label="formularios repetidos" />
          </div>
        </div>

        {/* Preview de tarjetas */}
        <div className="relative hidden lg:block">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
          <div className="absolute -bottom-10 left-0 h-64 w-64 rounded-full bg-sky-200/50 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <PreviewCard
              company="Nova Studio"
              title="Diseñador UI/UX"
              chips={["Remoto", "Tiempo completo"]}
              meta="12 aplicantes"
              salary="MXN 45,000–60,000"
              className="rotate-[-2deg]"
            />
            <PreviewCard
              company="ByteWorks"
              title="Desarrollador Frontend"
              chips={["Híbrido", "Contrato"]}
              meta="8 aplicantes"
              salary="MXN 50,000–70,000"
              className="ml-10 rotate-[1.5deg]"
            />
            <PreviewCard
              company="Marca Global"
              title="Especialista en Marketing"
              chips={["Presencial", "Medio tiempo"]}
              meta="21 aplicantes"
              className="rotate-[-1deg]"
            />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold">Cómo funciona</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <Step n="1" title="Crea tu Master Profile" desc="Tus datos, experiencia y habilidades una sola vez." />
            <Step n="2" title="Aplica con una pregunta" desc="Respondes una pregunta situacional específica de la vacante." />
            <Step n="3" title="Recibe tu evaluación" desc="La IA te da feedback y a la empresa un score objetivo." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">
            Únete como candidato o publica vacantes como empresa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="btn bg-white px-7 py-3.5 text-base text-brand-700 hover:bg-brand-50">
              Crear cuenta
            </Link>
            <Link href="/jobs" className="btn border border-white/40 px-7 py-3.5 text-base text-white hover:bg-white/10">
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

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-lg font-bold text-white">
        {n}
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{desc}</p>
    </div>
  );
}

function PreviewCard({
  company,
  title,
  chips,
  meta,
  salary,
  className = "",
}: {
  company: string;
  title: string;
  chips: string[];
  meta: string;
  salary?: string;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-soft ${className}`}>
      <div className="flex items-start gap-3">
        <CompanyLogo name={company} />
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-500">{company}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">{meta}</span>
        {salary && <span className="font-semibold text-brand-700">{salary}</span>}
      </div>
    </div>
  );
}
