import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { AdminError, requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminDb } from "@/lib/firebase/admin";
import { COLLECTIONS } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

const DEMO_EMPLOYER_ID = "demo-employer";

const DEMO_JOBS = [
  {
    title: "Diseñador UI/UX Senior",
    companyName: "Nova Studio",
    location: "Ciudad de México",
    workMode: "remote",
    employmentType: "full-time",
    salaryRange: { min: 45000, max: 65000, currency: "MXN" },
    requiredSkills: ["Figma", "UI", "UX Research", "Prototipado"],
    applicationsCount: 24,
    description:
      "Buscamos un diseñador UI/UX con ojo para el detalle y pasión por resolver problemas reales de usuarios. Trabajarás junto a producto e ingeniería para crear experiencias claras y accesibles.",
    questions: [
      "Cuéntanos de una vez que rediseñaste un flujo confuso. ¿Cómo lo abordaste y qué resultado obtuviste?",
      "Un stakeholder rechaza tu propuesta sin datos que la respalden. ¿Cómo manejas la situación?",
    ],
  },
  {
    title: "Desarrollador Frontend",
    companyName: "ByteWorks",
    location: "Guadalajara",
    workMode: "hybrid",
    employmentType: "full-time",
    salaryRange: { min: 50000, max: 75000, currency: "MXN" },
    requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind"],
    applicationsCount: 12,
    description:
      "Únete a nuestro equipo para construir productos web rápidos y mantenibles. Valoramos el código limpio, las pruebas y la colaboración cercana con diseño.",
    questions: [
      "Describe un bug difícil que hayas resuelto. ¿Cómo lo diagnosticaste?",
      "Tienes que entregar una feature con una fecha ajustada y detectas deuda técnica. ¿Qué priorizas?",
    ],
  },
  {
    title: "Especialista en Marketing Digital",
    companyName: "Marca Global",
    location: "Monterrey",
    workMode: "onsite",
    employmentType: "full-time",
    salaryRange: { min: 30000, max: 45000, currency: "MXN" },
    requiredSkills: ["SEO", "Google Ads", "Contenido", "Analítica"],
    applicationsCount: 31,
    description:
      "Lidera campañas digitales de principio a fin: estrategia, ejecución y medición. Buscamos a alguien creativo pero guiado por datos.",
    questions: [
      "Una campaña no está dando los resultados esperados a mitad de mes. ¿Qué haces?",
      "¿Cómo decides en qué canal invertir un presupuesto limitado?",
    ],
  },
  {
    title: "Contador Senior",
    companyName: "Finzas MX",
    location: "Remoto",
    workMode: "remote",
    employmentType: "contract",
    salaryRange: { min: 35000, max: 50000, currency: "MXN" },
    requiredSkills: ["Contabilidad", "SAT", "Excel", "Conciliaciones"],
    applicationsCount: 8,
    description:
      "Responsable de la contabilidad general, cumplimiento fiscal y cierres mensuales. Experiencia con normativa mexicana indispensable.",
    questions: [
      "Detectas una inconsistencia en un cierre a punto de entregarse. ¿Cómo procedes?",
      "¿Cómo te mantienes al día con los cambios fiscales del SAT?",
    ],
  },
  {
    title: "Product Manager",
    companyName: "Lumen Labs",
    location: "Ciudad de México",
    workMode: "hybrid",
    employmentType: "full-time",
    salaryRange: { min: 60000, max: 90000, currency: "MXN" },
    requiredSkills: ["Roadmap", "Discovery", "Datos", "Agile"],
    applicationsCount: 19,
    description:
      "Definirás la estrategia de producto, priorizarás el roadmap y trabajarás con equipos multidisciplinarios para lanzar valor de forma continua.",
    questions: [
      "Cuéntanos de una decisión de producto que tomaste con datos incompletos.",
      "Dos áreas piden prioridades opuestas para el próximo sprint. ¿Cómo lo resuelves?",
    ],
  },
  {
    title: "Analista de Soporte TI",
    companyName: "HelpDesk Pro",
    location: "Puebla",
    workMode: "onsite",
    employmentType: "part-time",
    salaryRange: { min: 15000, max: 22000, currency: "MXN" },
    requiredSkills: ["Redes", "Windows", "Atención al cliente"],
    applicationsCount: 5,
    description:
      "Brinda soporte técnico de primer y segundo nivel a usuarios internos. Buscamos paciencia, claridad y ganas de aprender.",
    questions: [
      "Un usuario frustrado no logra explicar su problema. ¿Cómo lo ayudas?",
      "¿Cómo priorizas cuando tienes varios tickets urgentes a la vez?",
    ],
  },
] as const;

/**
 * Genera o elimina ofertas de demostración (solo admin).
 * Body: { action: "seed" | "clear" }.
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);

    const body = (await request.json().catch(() => ({}))) as { action?: string };
    const action = body.action ?? "seed";
    const db = getAdminDb();

    if (action === "clear") {
      const snap = await db
        .collection(COLLECTIONS.JOB_POSTS)
        .where("employerId", "==", DEMO_EMPLOYER_ID)
        .get();
      const batch = db.batch();
      snap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
      return NextResponse.json({ ok: true, deleted: snap.size });
    }

    // action === "seed"
    const batch = db.batch();
    DEMO_JOBS.forEach((job, i) => {
      const jobId = `demo-${i + 1}`;
      const ref = db.collection(COLLECTIONS.JOB_POSTS).doc(jobId);
      batch.set(ref, {
        jobId,
        employerId: DEMO_EMPLOYER_ID,
        companyName: job.companyName,
        companyLogo: null,
        title: job.title,
        description: job.description,
        location: job.location,
        workMode: job.workMode,
        employmentType: job.employmentType,
        salaryRange: job.salaryRange,
        requiredSkills: [...job.requiredSkills],
        situationalQuestions: job.questions.map((q, n) => ({
          id: `${jobId}-q${n + 1}`,
          question: q,
        })),
        status: "open",
        applicationsCount: job.applicationsCount,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });
    await batch.commit();

    return NextResponse.json({ ok: true, created: DEMO_JOBS.length });
  } catch (err) {
    const status = err instanceof AdminError ? err.status : 500;
    const message = err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: message }, { status });
  }
}
