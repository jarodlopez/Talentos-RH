"use client";

/**
 * Editor del Master Profile del candidato.
 * Carga candidates/{uid}, permite editar datos base + skills + experiencia
 * + educación, calcula la completitud y guarda en Firestore.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { useAuth } from "@/components/auth/AuthProvider";
import { CountrySelect } from "@/components/shared/CountrySelect";

interface ExperienceForm {
  company: string;
  role: string;
  startDate: string; // "YYYY-MM"
  endDate: string; // "" = actual
  description: string;
}

interface EducationForm {
  institution: string;
  degree: string;
  year: string;
}

function computeCompleteness(fields: {
  headline: string;
  location: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: ExperienceForm[];
  education: EducationForm[];
}): number {
  const checks = [
    fields.headline.trim() !== "",
    fields.location.trim() !== "",
    fields.phone.trim() !== "",
    fields.summary.trim() !== "",
    fields.skills.length > 0,
    fields.experience.length > 0,
    fields.education.length > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

export function MasterProfileForm() {
  const { firebaseUser, appUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [experience, setExperience] = useState<ExperienceForm[]>([]);
  const [education, setEducation] = useState<EducationForm[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    let active = true;
    (async () => {
      try {
        const snap = await getDoc(
          doc(getDb(), COLLECTIONS.CANDIDATES, firebaseUser.uid)
        );
        if (!active) return;
        if (snap.exists()) {
          const d = snap.data();
          setFullName(d.fullName ?? appUser?.displayName ?? "");
          setHeadline(d.headline ?? "");
          setLocation(d.location ?? "");
          setCountry(d.country ?? "");
          setPhone(d.phone ?? "");
          setSummary(d.summary ?? "");
          setSkills(Array.isArray(d.skills) ? d.skills : []);
          setExperience(
            Array.isArray(d.experience)
              ? d.experience.map((e: Record<string, unknown>) => ({
                  company: String(e.company ?? ""),
                  role: String(e.role ?? ""),
                  startDate: String(e.startDate ?? ""),
                  endDate: e.endDate ? String(e.endDate) : "",
                  description: String(e.description ?? ""),
                }))
              : []
          );
          setEducation(
            Array.isArray(d.education)
              ? d.education.map((e: Record<string, unknown>) => ({
                  institution: String(e.institution ?? ""),
                  degree: String(e.degree ?? ""),
                  year: e.year ? String(e.year) : "",
                }))
              : []
          );
        } else {
          setFullName(appUser?.displayName ?? "");
        }
      } catch {
        if (active) setError("No se pudo cargar tu perfil.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [firebaseUser, appUser]);

  const completeness = useMemo(
    () =>
      computeCompleteness({
        headline,
        location,
        phone,
        summary,
        skills,
        experience,
        education,
      }),
    [headline, location, phone, summary, skills, experience, education]
  );

  function addSkill() {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput("");
  }

  const save = useCallback(async () => {
    if (!firebaseUser) return;
    setSaving(true);
    setError(null);
    try {
      await setDoc(
        doc(getDb(), COLLECTIONS.CANDIDATES, firebaseUser.uid),
        {
          uid: firebaseUser.uid,
          fullName: fullName.trim(),
          headline: headline.trim(),
          location: location.trim(),
          country: country || null,
          phone: phone.trim(),
          summary: summary.trim(),
          skills,
          experience: experience.map((e) => ({
            company: e.company.trim(),
            role: e.role.trim(),
            startDate: e.startDate,
            endDate: e.endDate === "" ? null : e.endDate,
            description: e.description.trim(),
          })),
          education: education.map((e) => ({
            institution: e.institution.trim(),
            degree: e.degree.trim(),
            year: e.year ? Number(e.year) : null,
          })),
          profileCompleteness: completeness,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setSavedAt(Date.now());
    } catch {
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  }, [
    firebaseUser,
    fullName,
    headline,
    location,
    country,
    phone,
    summary,
    skills,
    experience,
    education,
    completeness,
  ]);

  if (loading) {
    return <p className="text-slate-400">Cargando tu perfil…</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="flex flex-col gap-6"
    >
      {/* Banner de éxito con siguientes pasos */}
      {savedAt && !error && (
        <div className="animate-fade-in-up rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="font-semibold text-emerald-800">¡Perfil guardado! ✓</p>
          <p className="mt-1 text-sm text-emerald-700">
            {completeness === 100
              ? "Tu perfil está completo. Ya puedes aplicar a vacantes."
              : `Tu perfil está al ${completeness}%. Puedes seguir editando o empezar a aplicar.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/jobs" className="btn-primary">
              Explorar vacantes
            </Link>
            <Link href="/candidate/dashboard" className="btn-secondary">
              Ir a mi panel
            </Link>
          </div>
        </div>
      )}

      {/* Barra de completitud */}
      <div className="card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-300">Completitud del perfil</span>
          <span className="font-semibold text-[#c8f04a]">{completeness}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-[#c8f04a] transition-all"
            style={{ width: `${completeness}%` }}
          />
        </div>
      </div>

      {/* Datos base */}
      <Card title="Datos básicos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombre completo" value={fullName} onChange={setFullName} />
          <Field
            label="Titular profesional"
            placeholder="Ej. Desarrollador Full-Stack"
            value={headline}
            onChange={setHeadline}
          />
          <Field label="Ubicación" value={location} onChange={setLocation} />
          <Field label="Teléfono" value={phone} onChange={setPhone} />
          <label className="flex flex-col gap-1.5">
            <span className="label">País</span>
            <CountrySelect
              value={country}
              onChange={setCountry}
              includeAll
              allLabel="Selecciona tu país…"
              className="w-full"
            />
          </label>
        </div>
        <TextArea
          label="Resumen / bio"
          placeholder="Cuéntanos brevemente sobre ti…"
          value={summary}
          onChange={setSummary}
        />
      </Card>

      {/* Skills */}
      <Card title="Habilidades">
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
            className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-sm outline-none focus:border-[#c8f04a]"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
          >
            Agregar
          </button>
        </div>
        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span
                key={s}
                className="flex items-center gap-1 rounded-full bg-[#c8f04a]/15 px-3 py-1 text-sm text-[#c8f04a]"
              >
                {s}
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((x) => x !== s))}
                  className="text-[#c8f04a] hover:text-[#c8f04a]"
                  aria-label={`Quitar ${s}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Experiencia */}
      <Card title="Experiencia">
        <div className="flex flex-col gap-4">
          {experience.map((exp, i) => (
            <div key={i} className="rounded-lg border border-slate-800 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Empresa"
                  value={exp.company}
                  onChange={(v) => updateItem(setExperience, experience, i, { company: v })}
                />
                <Field
                  label="Puesto"
                  value={exp.role}
                  onChange={(v) => updateItem(setExperience, experience, i, { role: v })}
                />
                <Field
                  label="Desde"
                  type="month"
                  value={exp.startDate}
                  onChange={(v) => updateItem(setExperience, experience, i, { startDate: v })}
                />
                <Field
                  label="Hasta (vacío = actual)"
                  type="month"
                  value={exp.endDate}
                  onChange={(v) => updateItem(setExperience, experience, i, { endDate: v })}
                />
              </div>
              <TextArea
                label="Descripción"
                value={exp.description}
                onChange={(v) => updateItem(setExperience, experience, i, { description: v })}
              />
              <RemoveButton
                onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}
              />
            </div>
          ))}
          <AddButton
            label="Añadir experiencia"
            onClick={() =>
              setExperience([
                ...experience,
                { company: "", role: "", startDate: "", endDate: "", description: "" },
              ])
            }
          />
        </div>
      </Card>

      {/* Educación */}
      <Card title="Educación">
        <div className="flex flex-col gap-4">
          {education.map((edu, i) => (
            <div key={i} className="rounded-lg border border-slate-800 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label="Institución"
                  value={edu.institution}
                  onChange={(v) => updateItem(setEducation, education, i, { institution: v })}
                />
                <Field
                  label="Título / grado"
                  value={edu.degree}
                  onChange={(v) => updateItem(setEducation, education, i, { degree: v })}
                />
                <Field
                  label="Año"
                  type="number"
                  value={edu.year}
                  onChange={(v) => updateItem(setEducation, education, i, { year: v })}
                />
              </div>
              <RemoveButton
                onClick={() => setEducation(education.filter((_, idx) => idx !== i))}
              />
            </div>
          ))}
          <AddButton
            label="Añadir educación"
            onClick={() =>
              setEducation([...education, { institution: "", degree: "", year: "" }])
            }
          />
        </div>
      </Card>

      {/* Guardar */}
      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-soft backdrop-blur">
        <div className="text-sm">
          {error && <span className="text-red-600">{error}</span>}
          {!error && savedAt && (
            <span className="font-medium text-emerald-600">Cambios guardados ✓</span>
          )}
          {!error && !savedAt && (
            <span className="text-slate-400">Recuerda guardar tus cambios</span>
          )}
        </div>
        <button type="submit" disabled={saving} className="btn-primary px-6 py-3">
          {saving ? "Guardando…" : "Guardar perfil"}
        </button>
      </div>
    </form>
  );
}

// Actualiza un item de una lista de forma inmutable.
function updateItem<T>(
  setter: (items: T[]) => void,
  items: T[],
  index: number,
  patch: Partial<T>
) {
  setter(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-4 font-semibold text-white">{title}</h2>
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
    <label className="flex flex-col gap-1.5">
      <span className="label">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input"
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
    <label className="mt-4 flex flex-col gap-1.5">
      <span className="label">{label}</span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="input"
      />
    </label>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-dashed border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-400 hover:border-[#c8f04a]/50 hover:text-[#c8f04a]"
    >
      + {label}
    </button>
  );
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 text-sm font-medium text-red-600 hover:underline"
    >
      Eliminar
    </button>
  );
}
