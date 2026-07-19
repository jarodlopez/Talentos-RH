/**
 * ⚠️ TEMPORAL — datos demo solo para visualizar la UI.
 * Estas vacantes NO están en Firestore; se usan como fallback cuando no
 * hay vacantes reales, para poder ver el diseño poblado.
 *
 * PARA ELIMINAR: borra este archivo y quita los fallbacks marcados con
 * "TEMP DEMO" en JobBoard, CandidateHome y JobDetail.
 */
import type { JobPost } from "@/types";

export const DEMO_JOBS: JobPost[] = [
  {
    jobId: "demo-1",
    employerId: "demo-employer",
    companyName: "Nova Studio",
    companyLogo: null,
    title: "Diseñador UI/UX Senior",
    description:
      "Buscamos un diseñador UI/UX con ojo para el detalle y pasión por resolver problemas reales de usuarios. Trabajarás junto a producto e ingeniería para crear experiencias claras y accesibles.",
    location: "Ciudad de México",
    workMode: "remote",
    employmentType: "full-time",
    salaryRange: { min: 45000, max: 65000, currency: "MXN" },
    requiredSkills: ["Figma", "UI", "UX Research", "Prototipado"],
    situationalQuestions: [
      { id: "demo-1-q1", question: "Cuéntanos de una vez que rediseñaste un flujo confuso." },
    ],
    status: "open",
    applicationsCount: 24,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  },
  {
    jobId: "demo-2",
    employerId: "demo-employer",
    companyName: "ByteWorks",
    companyLogo: null,
    title: "Desarrollador Frontend",
    description:
      "Únete a nuestro equipo para construir productos web rápidos y mantenibles. Valoramos el código limpio, las pruebas y la colaboración cercana con diseño.",
    location: "Guadalajara",
    workMode: "hybrid",
    employmentType: "full-time",
    salaryRange: { min: 50000, max: 75000, currency: "MXN" },
    requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind"],
    situationalQuestions: [
      { id: "demo-2-q1", question: "Describe un bug difícil que hayas resuelto." },
    ],
    status: "open",
    applicationsCount: 12,
    createdAt: "2026-07-02T00:00:00.000Z",
    updatedAt: "2026-07-02T00:00:00.000Z",
  },
  {
    jobId: "demo-3",
    employerId: "demo-employer",
    companyName: "Marca Global",
    companyLogo: null,
    title: "Especialista en Marketing Digital",
    description:
      "Lidera campañas digitales de principio a fin: estrategia, ejecución y medición. Buscamos a alguien creativo pero guiado por datos.",
    location: "Monterrey",
    workMode: "onsite",
    employmentType: "full-time",
    salaryRange: { min: 30000, max: 45000, currency: "MXN" },
    requiredSkills: ["SEO", "Google Ads", "Contenido", "Analítica"],
    situationalQuestions: [
      { id: "demo-3-q1", question: "Una campaña no da resultados a mitad de mes. ¿Qué haces?" },
    ],
    status: "open",
    applicationsCount: 31,
    createdAt: "2026-07-03T00:00:00.000Z",
    updatedAt: "2026-07-03T00:00:00.000Z",
  },
  {
    jobId: "demo-4",
    employerId: "demo-employer",
    companyName: "Finzas MX",
    companyLogo: null,
    title: "Contador Senior",
    description:
      "Responsable de la contabilidad general, cumplimiento fiscal y cierres mensuales. Experiencia con normativa mexicana indispensable.",
    location: "Remoto",
    workMode: "remote",
    employmentType: "contract",
    salaryRange: { min: 35000, max: 50000, currency: "MXN" },
    requiredSkills: ["Contabilidad", "SAT", "Excel", "Conciliaciones"],
    situationalQuestions: [
      { id: "demo-4-q1", question: "Detectas una inconsistencia en un cierre. ¿Cómo procedes?" },
    ],
    status: "open",
    applicationsCount: 8,
    createdAt: "2026-07-04T00:00:00.000Z",
    updatedAt: "2026-07-04T00:00:00.000Z",
  },
  {
    jobId: "demo-5",
    employerId: "demo-employer",
    companyName: "Lumen Labs",
    companyLogo: null,
    title: "Product Manager",
    description:
      "Definirás la estrategia de producto, priorizarás el roadmap y trabajarás con equipos multidisciplinarios para lanzar valor de forma continua.",
    location: "Ciudad de México",
    workMode: "hybrid",
    employmentType: "full-time",
    salaryRange: { min: 60000, max: 90000, currency: "MXN" },
    requiredSkills: ["Roadmap", "Discovery", "Datos", "Agile"],
    situationalQuestions: [
      { id: "demo-5-q1", question: "Cuéntanos de una decisión de producto con datos incompletos." },
    ],
    status: "open",
    applicationsCount: 19,
    createdAt: "2026-07-05T00:00:00.000Z",
    updatedAt: "2026-07-05T00:00:00.000Z",
  },
  {
    jobId: "demo-6",
    employerId: "demo-employer",
    companyName: "HelpDesk Pro",
    companyLogo: null,
    title: "Analista de Soporte TI",
    description:
      "Brinda soporte técnico de primer y segundo nivel a usuarios internos. Buscamos paciencia, claridad y ganas de aprender.",
    location: "Puebla",
    workMode: "onsite",
    employmentType: "part-time",
    salaryRange: { min: 15000, max: 22000, currency: "MXN" },
    requiredSkills: ["Redes", "Windows", "Atención al cliente"],
    situationalQuestions: [
      { id: "demo-6-q1", question: "Un usuario frustrado no logra explicar su problema. ¿Cómo lo ayudas?" },
    ],
    status: "open",
    applicationsCount: 5,
    createdAt: "2026-07-06T00:00:00.000Z",
    updatedAt: "2026-07-06T00:00:00.000Z",
  },
];

/** Busca una vacante demo por id (para el detalle). */
export function findDemoJob(jobId: string): JobPost | undefined {
  return DEMO_JOBS.find((j) => j.jobId === jobId);
}
