"use client";

/**
 * Cuerpo del dashboard del empleador.
 * Lee el documento employers/{uid} para conocer el estado de verificación
 * y bloquea la publicación de vacantes mientras la cuenta no esté aprobada.
 */
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";

export function EmployerDashboardBody() {
  const { firebaseUser } = useAuth();
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(
          doc(getDb(), COLLECTIONS.EMPLOYERS, firebaseUser.uid)
        );
        if (active) {
          setVerified(snap.exists() ? Boolean(snap.data().verified) : false);
        }
      } catch {
        if (active) setVerified(false);
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
        Aquí publicarás vacantes y revisarás candidatos con su score de IA.
      </p>

      {verified === false && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800">Cuenta en revisión</p>
          <p className="mt-1 text-sm text-amber-700">
            Estamos verificando tu empresa. Podrás publicar vacantes en cuanto
            tu cuenta sea aprobada. Mientras tanto, puedes preparar el perfil de
            tu empresa.
          </p>
        </div>
      )}

      {verified === true && (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-800">Cuenta verificada ✓</p>
          <p className="mt-1 text-sm text-emerald-700">
            Ya puedes publicar vacantes y recibir candidatos.
          </p>
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card
          title="Mis vacantes"
          desc={
            verified
              ? "Crea y administra tus publicaciones."
              : "Disponible cuando tu cuenta sea verificada."
          }
          disabled={!verified}
        />
        <Card
          title="Candidatos"
          desc="Revisa aplicaciones evaluadas por IA."
          disabled={!verified}
        />
      </div>
    </main>
  );
}

function Card({
  title,
  desc,
  disabled,
}: {
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-5 ${
        disabled ? "opacity-50" : ""
      }`}
    >
      <h2 className="font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{desc}</p>
    </div>
  );
}
