"use client";

/**
 * Home del candidato (tema oscuro estilo "Find Jobs"):
 * saludo, título grande, nudge de perfil y explorador de vacantes.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import { JobsExplorer } from "@/components/jobs/JobsExplorer";

export function CandidateHome() {
  const { firebaseUser, appUser } = useAuth();
  const [completeness, setCompleteness] = useState<number | null>(null);
  const [country, setCountry] = useState("");

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
          if (snap.exists() && snap.data().country) setCountry(snap.data().country);
        }
      } catch {
        if (active) setCompleteness(0);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  const name = (appUser?.displayName ?? "").split(" ")[0] || "candidato";

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Saludo */}
        <p className="text-slate-400">Hola, {name} 👋</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-white">
          Encuentra tu empleo
        </h1>

        {/* Nudge de completitud */}
        {completeness !== null && completeness < 100 && (
          <Link
            href="/candidate/profile"
            className="mt-4 flex items-center justify-between rounded-2xl border border-[#c8f04a]/30 bg-[#c8f04a]/10 px-4 py-3 text-sm"
          >
            <span className="font-medium text-[#c8f04a]">
              Completa tu perfil ({completeness}%) para mejorar tus matches
            </span>
            <span className="font-semibold text-[#c8f04a]">Completar →</span>
          </Link>
        )}

        <div className="mt-6">
          <JobsExplorer defaultCountry={country} />
        </div>
      </div>
    </div>
  );
}
