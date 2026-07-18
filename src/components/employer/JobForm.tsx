"use client";

/**
 * Formulario para crear y editar vacantes.
 * Incluye el pool de preguntas situacionales (se elegirá una al azar al
 * aplicar). Solo empleadores verificados pueden publicar; la UI lo refleja
 * y las Security Rules lo imponen del lado servidor.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import { useEmployerProfile } from "@/hooks/useEmployerProfile";
import type {
  EmploymentType,
  JobStatus,
  SituationalQuestion,
  WorkMode,
} from "@/types";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `q_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

export function JobForm({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const { firebaseUser } = useAuth();
  const { employer, loading: employerLoading } = useEmployerProfile();
  const isEdit = Boolean(jobId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState<WorkMode>("remote");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("full-time");
  const [includeSalary, setIncludeSalary] = useState(false);
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [currency, setCurrency] = useState("MXN");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [questions, setQuestions] = useState<SituationalQuestion[]>([]);
  const [status, setStatus] = useState<JobStatus>("draft");

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga la vacante en modo edición.
  useEffect(() => {
    if (!isEdit || !jobId) return;
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(doc(getDb(), COLLECTIONS.JOB_POSTS, jobId));
        if (!active) return;
        if (snap.exists()) {
          const d = snap.data();
          setTitle(d.title ?? "");
          setDescription(d.description ?? "");
          setLocation(d.location ?? "");
          setWorkMode(d.workMode ?? "remote");
          setEmploymentType(d.employmentType ?? "full-time");
          setRequiredSkills(Array.isArray(d.requiredSkills) ? d.requiredSkills : []);
          setQuestions(Array.isArray(d.situationalQuestions) ? d.situationalQuestions : []);
          setStatus(d.status ?? "draft");
          if (d.salaryRange) {
            setIncludeSalary(true);
            setSalaryMin(String(d.salaryRange.min ?? ""));
            setSalaryMax(String(d.salaryRange.max ?? ""));
            setCurrency(d.salaryRange.currency ?? "MXN");
          }
        } else {
          setError("Vacante no encontrada.");
        }
      } catch {
        if (active) setError("No se pudo cargar la vacante.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit, jobId]);

  function addSkill() {
    const s = skillInput.trim();
    if (s && !requiredSkills.includes(s)) setRequiredSkills([...requiredSkills, s]);
    setSkillInput("");
  }

  async function handleSave(nextStatus: JobStatus) {
    if (!firebaseUser || !employer) return;

    if (!title.trim() || !description.trim()) {
      setError("El título y la descripción son obligatorios.");
      return;
    }
    const validQuestions = questions.filter((q) => q.question.trim() !== "");
    if (nextStatus === "open" && validQuestions.length === 0) {
      setError("Para publicar necesitas al menos una pregunta situacional.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const db = getDb();
      const ref =
        isEdit && jobId
          ? doc(db, COLLECTIONS.JOB_POSTS, jobId)
          : doc(collection(db, COLLECTIONS.JOB_POSTS));

      const payload: Record<string, unknown> = {
        jobId: ref.id,
        employerId: firebaseUser.uid,
        companyName: employer.companyName ?? "",
        companyLogo: employer.companyLogo ?? null,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        workMode,
        employmentType,
        salaryRange:
          includeSalary && salaryMin && salaryMax
            ? { min: Number(salaryMin), max: Number(salaryMax), currency }
            : null,
        requiredSkills,
        situationalQuestions: validQuestions,
        status: nextStatus,
        updatedAt: serverTimestamp(),
      };

      if (!isEdit) {
        payload.createdAt = serverTimestamp();
        payload.applicationsCount = 0;
      }

      await setDoc(ref, payload, { merge: isEdit });
      router.push("/employer/jobs");
    } catch {
      setError("No se pudo guardar la vacante. Revisa que tu cuenta esté verificada.");
      setSaving(false);
    }
  }

  if (employerLoading || loading) {
    return <p className="text-gray-500">Cargando…</p>;
  }

  // Candado de UI: solo verificados pueden crear/editar.
  if (!employer?.verified) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
        <p className="font-semibold text-amber-800">Cuenta en revisión</p>
        <p className="mt-1 text-sm text-amber-700">
          Necesitas que tu cuenta de empleador sea verificada antes de publicar
          vacantes. Te avisaremos cuando esté lista.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
      <Card title="Detalles de la vacante">
        <Field label="Título" value={title} onChange={setTitle} placeholder="Ej. Desarrollador Frontend" />
        <TextArea
          label="Descripción"
          value={description}
          onChange={setDescription}
          placeholder="Responsabilidades, requisitos, sobre el equipo…"
        />
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Ubicación" value={location} onChange={setLocation} />
          <Select
            label="Modalidad"
            value={workMode}
            onChange={(v) => setWorkMode(v as WorkMode)}
            options={[
              { value: "remote", label: "Remoto" },
              { value: "hybrid", label: "Híbrido" },
              { value: "onsite", label: "Presencial" },
            ]}
          />
          <Select
            label="Tipo"
            value={employmentType}
            onChange={(v) => setEmploymentType(v as EmploymentType)}
            options={[
              { value: "full-time", label: "Tiempo completo" },
              { value: "part-time", label: "Medio tiempo" },
              { value: "contract", label: "Por contrato" },
            ]}
          />
        </div>
      </Card>

      <Card title="Rango salarial (opcional)">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={includeSalary}
            onChange={(e) => setIncludeSalary(e.target.checked)}
          />
          Incluir rango salarial
        </label>
        {includeSalary && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="Mínimo" type="number" value={salaryMin} onChange={setSalaryMin} />
            <Field label="Máximo" type="number" value={salaryMax} onChange={setSalaryMax} />
            <Field label="Moneda" value={currency} onChange={setCurrency} />
          </div>
        )}
      </Card>

      <Card title="Habilidades requeridas">
        <div className="flex gap-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Agrega una habilidad y presiona Enter"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Agregar
          </button>
        </div>
        {requiredSkills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {requiredSkills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700"
              >
                {s}
                <button
                  type="button"
                  onClick={() => setRequiredSkills(requiredSkills.filter((x) => x !== s))}
                  className="text-brand-400 hover:text-brand-700"
                  aria-label={`Quitar ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      <Card title="Preguntas situacionales">
        <p className="mb-3 text-sm text-gray-500">
          Al aplicar, se le mostrará al candidato <strong>una</strong> de estas
          preguntas elegida al azar. Añade varias para evitar respuestas copiadas.
        </p>
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => (
            <div key={q.id} className="flex gap-2">
              <textarea
                value={q.question}
                onChange={(e) =>
                  setQuestions(
                    questions.map((x, idx) =>
                      idx === i ? { ...x, question: e.target.value } : x
                    )
                  )
                }
                rows={2}
                placeholder={`Pregunta ${i + 1}`}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={() => setQuestions(questions.filter((_, idx) => idx !== i))}
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setQuestions([...questions, { id: newId(), question: "" }])}
            className="rounded-lg border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-brand-400 hover:text-brand-600"
          >
            + Añadir pregunta
          </button>
        </div>
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <span className="mr-auto text-sm text-gray-500">
          Estado actual: <strong className="capitalize">{status}</strong>
        </span>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave("draft")}
          className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Guardar borrador
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => handleSave("open")}
          className="rounded-lg bg-brand-600 px-6 py-2.5 font-medium text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Publicar vacante"}
        </button>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-gray-700">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-brand-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
