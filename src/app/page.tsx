import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Nav pública */}
      <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="flex items-center gap-2 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c8f04a] text-sm text-slate-900">
            T
          </span>
          Talentos-RH
        </span>
        <div className="flex items-center gap-2">
          <Link href="/jobs" className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800">
            Ver vacantes
          </Link>
          <Link href="/login" className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800">
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-block rounded-full bg-[#c8f04a]/15 px-4 py-1.5 text-sm font-semibold text-[#c8f04a]">
            Reclutamiento potenciado por IA
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            No pierdas tu <span className="text-[#c8f04a]">próxima</span> oportunidad
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-400">
            Crea tu Master Profile una vez, responde una pregunta situacional por
            vacante y recibe feedback instantáneo. La IA evalúa tu encaje real.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="rounded-xl bg-[#c8f04a] px-7 py-3.5 text-base font-semibold text-slate-900 transition hover:brightness-95">
              Empezar gratis
            </Link>
            <Link href="/jobs" className="rounded-xl border border-slate-700 px-7 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-800">
              Explorar vacantes
            </Link>
          </div>
          <div className="mt-10 flex gap-8">
            <Stat value="1 clic" label="para aplicar" />
            <Stat value="IA" label="evalúa tu perfil" />
            <Stat value="0" label="formularios repetidos" />
          </div>
        </div>

        {/* Preview de tarjetas de colores */}
        <div className="relative hidden lg:block">
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-[#c8f04a]/20 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <PreviewCard color="bg-[#c8f04a]" dark company="Nova Studio" title="Diseñador UI/UX" chips={["Remoto", "Tiempo completo"]} salary="MXN 45–65K" />
            <PreviewCard color="bg-[#ef4444]" company="ByteWorks" title="Desarrollador Frontend" chips={["Híbrido", "Contrato"]} salary="MXN 50–75K" className="ml-10" />
            <PreviewCard color="bg-[#f5a623]" dark company="Marca Global" title="Marketing Digital" chips={["Presencial", "Medio tiempo"]} salary="MXN 30–45K" />
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-y border-slate-800 bg-slate-900 py-20">
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
        <div className="rounded-3xl bg-[#c8f04a] px-8 py-14 text-center text-slate-900">
          <h2 className="text-3xl font-bold">¿Listo para empezar?</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-800/80">
            Únete como candidato o publica vacantes como empresa.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="rounded-xl bg-slate-900 px-7 py-3.5 text-base font-semibold text-white hover:bg-slate-800">
              Crear cuenta
            </Link>
            <Link href="/jobs" className="rounded-xl border border-slate-900/30 px-7 py-3.5 text-base font-semibold text-slate-900 hover:bg-slate-900/10">
              Ver vacantes
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Talentos-RH
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Step({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-slate-950 p-6 ring-1 ring-slate-800">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8f04a] text-lg font-bold text-slate-900">
        {n}
      </span>
      <h3 className="mt-4 font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{desc}</p>
    </div>
  );
}

function PreviewCard({
  color,
  dark,
  company,
  title,
  chips,
  salary,
  className = "",
}: {
  color: string;
  dark?: boolean;
  company: string;
  title: string;
  chips: string[];
  salary: string;
  className?: string;
}) {
  const textMain = dark ? "text-slate-900" : "text-white";
  const textSub = dark ? "text-slate-800/80" : "text-white/80";
  const chipCls = dark ? "border-slate-900/25 text-slate-900" : "border-white/40 text-white";
  return (
    <div className={`overflow-hidden rounded-3xl ${color} p-1.5 shadow-soft ${className}`}>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            {company.charAt(0)}
          </span>
          <div>
            <h3 className={`font-bold ${textMain}`}>{title}</h3>
            <p className={`text-sm ${textSub}`}>{company}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c} className={`rounded-full border px-3 py-1 text-xs font-medium ${chipCls}`}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-[20px] bg-white px-4 py-3">
        <span className="text-xs text-slate-500">🕐 Reciente</span>
        <span className="text-sm font-bold text-slate-900">{salary}</span>
      </div>
    </div>
  );
}
