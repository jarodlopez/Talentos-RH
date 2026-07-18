import Link from "next/link";
import { JobBoard } from "@/components/jobs/JobBoard";

export default function JobsPage() {
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
        <h1 className="mb-1 text-2xl font-bold">Vacantes disponibles</h1>
        <p className="mb-6 text-gray-600">
          Encuentra tu próxima oportunidad y aplica en un clic.
        </p>
        <JobBoard />
      </main>
    </div>
  );
}
