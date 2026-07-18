import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { CandidateApplicationsList } from "@/components/candidate/CandidateApplicationsList";

export default function CandidateApplicationsPage() {
  return (
    <AuthGuard role="candidate">
      <DashboardHeader area="Panel del candidato" />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-6 text-2xl font-bold">Mis aplicaciones</h1>
        <CandidateApplicationsList />
      </main>
    </AuthGuard>
  );
}
