import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { EmployerDashboardBody } from "@/components/employer/EmployerDashboardBody";

export default function EmployerDashboardPage() {
  return (
    <AuthGuard role="employer">
      <DashboardHeader area="Panel del empleador" />
      <EmployerDashboardBody />
    </AuthGuard>
  );
}
