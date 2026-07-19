"use client";

import { use } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardHeader } from "@/components/shared/DashboardHeader";
import { JobForm } from "@/components/employer/JobForm";

export default function EditJobPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);

  return (
    <AuthGuard role="employer">
      <DashboardHeader area="Panel del empleador" />
      <main className="mx-auto max-w-3xl p-6">
        <Link href="/employer/jobs" className="text-sm text-[#c8f04a] hover:underline">
          ← Volver a mis vacantes
        </Link>
        <h1 className="mb-6 mt-2 text-2xl font-bold">Editar vacante</h1>
        <JobForm jobId={jobId} />
      </main>
    </AuthGuard>
  );
}
