"use client";

/**
 * Guard para las páginas de administración.
 * Verifica contra el servidor (/api/admin/me) que el usuario sea admin.
 * La comprobación real es server-side; esto solo controla la navegación.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { checkIsAdmin } from "@/lib/adminClient";

type Status = "checking" | "ok" | "denied";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { loading, firebaseUser } = useAuth();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.replace("/login");
      return;
    }
    let active = true;
    (async () => {
      const isAdmin = await checkIsAdmin();
      if (!active) return;
      setStatus(isAdmin ? "ok" : "denied");
      if (!isAdmin) router.replace("/");
    })();
    return () => {
      active = false;
    };
  }, [loading, firebaseUser, router]);

  if (status !== "ok") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-400">
          {status === "denied" ? "Acceso denegado." : "Verificando permisos…"}
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
