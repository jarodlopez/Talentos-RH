"use client";

/**
 * Formulario de autenticación — SOLO Google.
 * Nuevos usuarios eligen su rol en /complete-profile.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase/client";

type Mode = "login" | "register";

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    "auth/popup-blocked": "El navegador bloqueó la ventana. Permite pop-ups e intenta de nuevo.",
    "auth/network-request-failed": "Problema de red. Revisa tu conexión.",
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase.",
  };
  return map[code] ?? "Ocurrió un error. Intenta de nuevo.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleGoogle() {
    setError(null);
    if (!isFirebaseConfigured) {
      setError("Firebase aún no está configurado.");
      return;
    }
    setLoading(true);
    try {
      const { needsRole } = await loginWithGoogle();
      router.push(needsRole ? "/complete-profile" : "/redirect");
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: string }).code)
          : "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request") {
        setError(friendlyError(code));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto w-full max-w-md p-8">
      <h1 className="mb-1 text-2xl font-bold text-white">
        {isRegister ? "Crear cuenta" : "Iniciar sesión"}
      </h1>
      <p className="mb-8 text-sm text-slate-400">
        {isRegister
          ? "Regístrate en segundos con tu cuenta de Google."
          : "Accede con tu cuenta de Google."}
      </p>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3.5 font-semibold text-slate-800 transition hover:bg-slate-100 disabled:opacity-60"
      >
        <GoogleIcon />
        {loading ? "Conectando…" : "Continuar con Google"}
      </button>

      {error && (
        <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <p className="mt-8 text-center text-sm text-slate-400">
        {isRegister ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-[#c8f04a] hover:underline">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-[#c8f04a] hover:underline">
              Regístrate
            </Link>
          </>
        )}
      </p>

      <p className="mt-6 text-center text-xs text-slate-500">
        Al continuar aceptas usar Talentos-RH de forma responsable.
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
