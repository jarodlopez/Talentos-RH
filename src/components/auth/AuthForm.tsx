"use client";

/**
 * Formulario compartido para login y registro.
 * En modo "register" muestra el selector de rol (candidato/empleador)
 * y el campo de nombre.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { isFirebaseConfigured } from "@/lib/firebase/client";
import type { UserRole } from "@/types";

type Mode = "login" | "register";
type PublicRole = Exclude<UserRole, "admin">;

function friendlyError(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-email": "El correo no es válido.",
    "auth/email-already-in-use": "Ya existe una cuenta con este correo.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/invalid-credential": "Correo o contraseña incorrectos.",
    "auth/user-not-found": "No existe una cuenta con este correo.",
    "auth/wrong-password": "Correo o contraseña incorrectos.",
    "auth/too-many-requests": "Demasiados intentos. Intenta más tarde.",
  };
  return map[code] ?? "Ocurrió un error. Intenta de nuevo.";
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { login, register, loginWithGoogle, assignRole } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<PublicRole>("candidate");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleGoogle() {
    setError(null);
    if (!isFirebaseConfigured) {
      setError(
        "Firebase aún no está configurado. Añade las variables de entorno en Vercel."
      );
      return;
    }

    setGoogleLoading(true);
    try {
      const { needsRole } = await loginWithGoogle();

      if (!needsRole) {
        // Usuario existente: enrutamos según su rol ya guardado.
        router.push("/redirect");
        return;
      }

      // Usuario de Google nuevo:
      if (isRegister) {
        // En "Crear cuenta" ya eligió rol arriba -> lo asignamos.
        const created = await assignRole(role);
        router.push(
          created.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard"
        );
      } else {
        // En "Iniciar sesión" no eligió rol -> pantalla para completarlo.
        router.push("/complete-profile");
      }
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: string }).code)
          : "";
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
        // El usuario cerró el popup; no mostramos error.
      } else {
        setError(friendlyError(code));
      }
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isFirebaseConfigured) {
      setError(
        "Firebase aún no está configurado. Añade las variables de entorno en Vercel."
      );
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        const created = await register({ email, password, displayName, role });
        router.push(
          created.role === "employer" ? "/employer/dashboard" : "/candidate/dashboard"
        );
      } else {
        await login(email, password);
        // El rol se resuelve tras cargar el perfil; enviamos a un ruteo neutral.
        router.push("/redirect");
      }
    } catch (err: unknown) {
      const code =
        typeof err === "object" && err !== null && "code" in err
          ? String((err as { code: string }).code)
          : "";
      setError(friendlyError(code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-bold">
        {isRegister ? "Crear cuenta" : "Iniciar sesión"}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        {isRegister
          ? "Regístrate como candidato o empleador."
          : "Bienvenido de nuevo a Talentos-RH."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {isRegister && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <RoleCard
                active={role === "candidate"}
                title="Candidato"
                subtitle="Busco empleo"
                onClick={() => setRole("candidate")}
              />
              <RoleCard
                active={role === "employer"}
                title="Empleador"
                subtitle="Contrato talento"
                onClick={() => setRole("employer")}
              />
            </div>

            {role === "employer" && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                Las cuentas de empleador pasan por una verificación antes de poder
                publicar vacantes. Podrás preparar el perfil de tu empresa de
                inmediato.
              </p>
            )}

            <Field
              label={role === "employer" ? "Nombre de la empresa" : "Nombre completo"}
              type="text"
              value={displayName}
              onChange={setDisplayName}
              required
            />
          </>
        )}

        <Field
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={setEmail}
          required
        />
        <Field
          label="Contraseña"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 rounded-lg bg-brand-600 px-4 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {submitting
            ? "Procesando…"
            : isRegister
              ? "Crear cuenta"
              : "Entrar"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs text-gray-400">o</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Conectando…" : "Continuar con Google"}
      </button>

      <p className="mt-6 text-center text-sm text-gray-500">
        {isRegister ? (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              Inicia sesión
            </Link>
          </>
        ) : (
          <>
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="font-medium text-brand-600 hover:underline">
              Regístrate
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  required,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function RoleCard({
  active,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 p-3 text-left transition ${
        active
          ? "border-brand-600 bg-brand-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <span className="block font-semibold text-gray-900">{title}</span>
      <span className="block text-xs text-gray-500">{subtitle}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
