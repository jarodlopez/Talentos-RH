"use client";

/**
 * Carga el documento employers/{uid} del usuario actual.
 * Se usa para conocer el estado de verificación y los datos de empresa
 * (nombre, logo) que se desnormalizan en las vacantes.
 */
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Employer } from "@/types";

export function useEmployerProfile() {
  const { firebaseUser } = useAuth();
  const [employer, setEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(
          doc(getDb(), COLLECTIONS.EMPLOYERS, firebaseUser.uid)
        );
        if (active) setEmployer(snap.exists() ? (snap.data() as Employer) : null);
      } catch {
        if (active) setEmployer(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseUser]);

  return { employer, loading };
}
