import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { CandidateHome } from "@/components/candidate/CandidateHome";

export default function CandidateDashboardPage() {
  return (
    <AuthGuard role="candidate">
      <DashboardHeader area="Panel del candidato" />
      <CandidateHome />
    </AuthGuard>
  );
}
