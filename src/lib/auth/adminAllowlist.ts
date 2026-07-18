/**
 * Allowlist de super administradores (bootstrap).
 *
 * El primer admin se define aquí para poder arrancar sin depender de la
 * consola. Se pueden añadir más vía la variable de entorno
 * SUPER_ADMIN_EMAILS (separados por comas) sin tocar el código.
 *
 * Esta lista vive SOLO en el servidor. La verificación real ocurre en las
 * API Routes tras validar criptográficamente el token del usuario.
 */
const DEFAULT_ADMIN_EMAILS = ["jarod.lopezsanchez@gmail.com"];

export function getAdminEmails(): string[] {
  const fromEnv = (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(
    new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...fromEnv])
  );
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
