import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { EmployerJobsList } from "@/components/employer/EmployerJobsList";

export default function EmployerJobsPage() {
  return (
    <AuthGuard role="employer">
      <DashboardHeader area="Panel del empleador" />
      <main className="mx-auto max-w-4xl p-6">
        <EmployerJobsList />
      </main>
    </AuthGuard>
  );
}
