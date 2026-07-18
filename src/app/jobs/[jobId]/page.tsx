"use client";

import { use } from "react";
import { JobDetail } from "@/components/jobs/JobDetail";
import { PublicNav } from "@/components/shared/PublicNav";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);

  return (
    <div>
      <PublicNav />
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <JobDetail jobId={jobId} />
      </main>
    </div>
  );
}
