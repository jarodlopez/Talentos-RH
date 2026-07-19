import { JobsExplorer } from "@/components/jobs/JobsExplorer";
import { PublicNav } from "@/components/shared/PublicNav";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <PublicNav />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Find Jobs
        </h1>
        <p className="mb-6 mt-1 text-slate-400">
          Encuentra tu próxima oportunidad y aplica en un clic.
        </p>
        <JobsExplorer />
      </main>
    </div>
  );
}
