import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { CandidateDashboardBody } from "@/components/candidate/CandidateDashboardBody";

export default function CandidateDashboardPage() {
  return (
    <AuthGuard role="candidate">
      <DashboardHeader area="Panel del candidato" />
      <CandidateDashboardBody />
    </AuthGuard>
  );
}
