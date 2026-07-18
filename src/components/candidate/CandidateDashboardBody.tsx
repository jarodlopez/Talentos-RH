"use client";

/**
 * Cuerpo del dashboard del candidato: muestra la completitud del Master
 * Profile y accesos a completar el perfil y ver aplicaciones.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";

export function CandidateDashboardBody() {
  const { firebaseUser } = useAuth();
  const [completeness, setCompleteness] = useState<number | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(
          doc(getDb(), COLLECTIONS.CANDIDATES, firebaseUser.uid)
        );
        if (active) {
          setCompleteness(
            snap.exists() ? Number(snap.data().profileCompleteness ?? 0) : 0
          );
        }
      } catch {
        if (active) setCompleteness(0);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Bienvenido a tu panel</h1>
      <p className="mt-2 text-gray-600">
        Completa tu Master Profile para poder aplicar a vacantes.
      </p>

      {completeness !== null && completeness < 100 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-amber-800">
              Tu perfil está al {completeness}%
            </span>
            <Link
              href="/candidate/profile"
              className="font-medium text-amber-800 underline"
            >
              Completar ahora
            </Link>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      )}

      {completeness === 100 && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          Tu Master Profile está completo ✓ Ya puedes aplicar a vacantes.
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <LinkCard
          href="/candidate/profile"
          title="Mi Master Profile"
          desc="Completa o edita tu perfil."
        />
        <LinkCard
          href="/candidate/applications"
          title="Mis aplicaciones"
          desc="Sigue el estado de tus postulaciones."
        />
      </div>
    </main>
  );
}

function LinkCard({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-brand-400 hover:shadow-sm"
    >
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </Link>
  );
}
