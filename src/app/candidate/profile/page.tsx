import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { MasterProfileForm } from "@/components/candidate/MasterProfileForm";

export default function CandidateProfilePage() {
  return (
    <AuthGuard role="candidate">
      <DashboardHeader area="Panel del candidato" />
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="mb-1 text-2xl font-bold">Mi Master Profile</h1>
        <p className="mb-6 text-gray-600">
          Complétalo una sola vez. Lo usaremos automáticamente cada vez que
          apliques a una vacante.
        </p>
        <MasterProfileForm />
      </main>
    </AuthGuard>
  );
}
