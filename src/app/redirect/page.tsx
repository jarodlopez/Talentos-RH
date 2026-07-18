"use client";

/**
 * Página puente tras el login: espera a que el rol se resuelva y
 * envía al usuario a su dashboard correspondiente.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RedirectPage() {
  const router = useRouter();
  const { loading, firebaseUser, role } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!firebaseUser) {
      router.replace("/login");
      return;
    }

    if (role === "employer") {
      router.replace("/employer/dashboard");
    } else if (role === "candidate") {
      router.replace("/candidate/dashboard");
    } else {
      // Hay usuario pero sin rol (p. ej. login con Google nuevo).
      router.replace("/complete-profile");
    }
  }, [loading, firebaseUser, role, router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Redirigiendo…</p>
    </main>
  );
}
