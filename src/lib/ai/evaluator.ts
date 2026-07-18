/**
 * Evaluador de aplicaciones con IA.
 *
 * ⚠️ Este módulo se ejecuta SOLO en el servidor (API Routes / Server Actions).
 * Recibe el Master Profile del candidato + la respuesta situacional y devuelve
 * un score para el empleador y feedback para el candidato.
 *
 * La implementación real (llamada al proveedor de IA) llegará en un bloque
 * posterior. Por ahora dejamos la firma y el contrato de tipos.
 */
import type { AiEvaluation, Candidate, JobPost } from "@/types";

export interface EvaluationInput {
  candidate: Candidate;
  job: JobPost;
  situationalQuestion: string;
  situationalAnswer: string;
}

/**
 * Placeholder — se implementará en el bloque de integración de IA.
 * La clave de API se leerá de process.env.AI_API_KEY (nunca del cliente).
 */
export async function evaluateApplication(
  _input: EvaluationInput
): Promise<AiEvaluation> {
  throw new Error(
    "evaluateApplication() aún no está implementado. Se completará en el bloque de integración de IA."
  );
}
