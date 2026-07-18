import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export default function EmployerDashboardPage() {
  return (
    <AuthGuard role="employer">
      <DashboardHeader area="Panel del empleador" />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Bienvenido a tu panel</h1>
        <p className="mt-2 text-gray-600">
          Aquí publicarás vacantes y revisarás candidatos con su score de IA.
          (Próximo bloque)
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card title="Mis vacantes" desc="Crea y administra tus publicaciones." />
          <Card title="Candidatos" desc="Revisa aplicaciones evaluadas por IA." />
        </div>
      </main>
    </AuthGuard>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
