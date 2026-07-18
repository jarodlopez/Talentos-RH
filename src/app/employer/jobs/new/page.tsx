import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { JobForm } from "@/components/employer/JobForm";

export default function NewJobPage() {
  return (
    <AuthGuard role="employer">
      <DashboardHeader area="Panel del empleador" />
      <main className="mx-auto max-w-3xl p-6">
        <Link href="/employer/jobs" className="text-sm text-brand-600 hover:underline">
          ← Volver a mis vacantes
        </Link>
        <h1 className="mb-6 mt-2 text-2xl font-bold">Nueva vacante</h1>
        <JobForm />
      </main>
    </AuthGuard>
  );
}
