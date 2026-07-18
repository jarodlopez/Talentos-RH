/**
 * Nombres centralizados de las colecciones de Firestore.
 * Evita "magic strings" repartidos por el código.
 */
export const COLLECTIONS = {
  USERS: "users",
  CANDIDATES: "candidates",
  EMPLOYERS: "employers",
  JOB_POSTS: "jobPosts",
  APPLICATIONS: "applications",
} as const;

/**
 * Genera el ID determinístico de una aplicación.
 * Garantiza que un candidato no pueda aplicar dos veces a la misma vacante.
 */
export function buildApplicationId(jobId: string, candidateId: string): string {
  return `${jobId}_${candidateId}`;
}
