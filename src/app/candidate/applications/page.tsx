import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";

export default function CandidateApplicationsPage() {
  return (
    <AuthGuard role="candidate">
      <DashboardHeader area="Panel del candidato" />
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Mis aplicaciones</h1>
        <p className="mt-2 text-gray-600">
          Aquí verás el estado de tus postulaciones y el feedback de la IA.
          (Próximo bloque)
        </p>
      </main>
    </AuthGuard>
  );
}
