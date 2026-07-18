import { JobBoard } from "@/components/jobs/JobBoard";
import { PublicNav } from "@/components/shared/PublicNav";

export default function JobsPage() {
  return (
    <div>
      <PublicNav />
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <h1 className="mb-1 text-3xl font-bold text-slate-900">
          Vacantes disponibles
        </h1>
        <p className="mb-6 text-slate-600">
          Encuentra tu próxima oportunidad y aplica en un clic.
        </p>
        <JobBoard />
      </main>
    </div>
  );
}
