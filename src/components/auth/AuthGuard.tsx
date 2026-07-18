"use client";

/**
 * Guard de cliente para páginas protegidas.
 * Complementa al middleware (que hace el gate rápido por cookie) con una
 * verificación fina del estado real de Firebase y del rol requerido.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import type { UserRole } from "@/types";

export function AuthGuard({
  role,
  children,
}: {
  role?: UserRole;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading, firebaseUser, role: userRole } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    if (role && userRole && userRole !== role) {
      // Rol equivocado: lo mandamos a su propio espacio.
      router.replace(userRole === "employer" ? "/employer/dashboard" : "/candidate/dashboard");
    }
  }, [loading, firebaseUser, userRole, role, router]);

  if (loading || !firebaseUser || (role && userRole !== role)) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Cargando…</p>
      </main>
    );
  }

  return <>{children}</>;
}
