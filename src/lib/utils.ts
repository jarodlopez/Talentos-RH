/**
 * Helpers generales reutilizables en cliente y servidor.
 */

/** Une clases condicionales ignorando valores falsy. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Selecciona una pregunta situacional al azar del pool de una vacante. */
export function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

/** Calcula el porcentaje de completitud de un Master Profile (0-100). */
export function calcProfileCompleteness(fields: Record<string, unknown>): number {
  const keys = Object.keys(fields);
  if (!keys.length) return 0;
  const filled = keys.filter((k) => {
    const v = fields[k];
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined && v !== "";
  }).length;
  return Math.round((filled / keys.length) * 100);
}
