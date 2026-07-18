"use client";

import { use } from "react";
import Link from "next/link";
import { JobDetail } from "@/components/jobs/JobDetail";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);

  return (
    <div>
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <Link href="/" className="font-bold text-gray-900">
          Talentos-RH
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Iniciar sesión
        </Link>
      </header>
      <main className="mx-auto max-w-3xl p-6">
        <JobDetail jobId={jobId} />
      </main>
    </div>
  );
}
