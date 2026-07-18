/**
 * ============================================================
 *  Talentos-RH — Tipos compartidos (Firestore <-> Frontend)
 *  Reflejan el esquema de la base de datos aprobado en Bloque 1.
 * ============================================================
 */

// Firestore Timestamp se serializa distinto en cliente/servidor.
// Usamos un alias flexible para no acoplarnos a una sola forma.
export type FirestoreDate = Date | { seconds: number; nanoseconds: number } | string;

// ---------------------------------------------------------------
//  ROLES
// ---------------------------------------------------------------
export type UserRole = "candidate" | "employer" | "admin";

// ---------------------------------------------------------------
//  USERS  (colección: users/{uid})  — el "login" común a todos
// ---------------------------------------------------------------
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL: string | null;
  createdAt: FirestoreDate;
  lastLoginAt: FirestoreDate;
}

// ---------------------------------------------------------------
//  CANDIDATES  (colección: candidates/{uid}) — el "Master Profile"
// ---------------------------------------------------------------
export interface Experience {
  company: string;
  role: string;
  startDate: FirestoreDate;
  endDate: FirestoreDate | null;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: number;
}

export interface IntegrityTest {
  completedAt: FirestoreDate;
  score: number; // 0-100 (visible solo internamente)
  answers: Record<string, unknown>; // respuestas crudas (protegidas)
}

export interface Candidate {
  uid: string;
  fullName: string;
  headline: string;
  location: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  integrityTest: IntegrityTest | null;
  profileCompleteness: number; // 0-100
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

// ---------------------------------------------------------------
//  EMPLOYERS  (colección: employers/{uid})
// ---------------------------------------------------------------
export interface Employer {
  uid: string;
  companyName: string;
  companyLogo: string | null;
  industry: string;
  website: string;
  description: string;
  contactEmail: string;
  verified: boolean;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

// ---------------------------------------------------------------
//  JOB POSTS  (colección: jobPosts/{jobId})
// ---------------------------------------------------------------
export type WorkMode = "remote" | "hybrid" | "onsite";
export type EmploymentType = "full-time" | "part-time" | "contract";
export type JobStatus = "open" | "closed" | "draft";

export interface SalaryRange {
  min: number;
  max: number;
  currency: string;
}

export interface SituationalQuestion {
  id: string;
  question: string;
}

export interface JobPost {
  jobId: string;
  employerId: string;
  companyName: string; // desnormalizado
  companyLogo: string | null; // desnormalizado
  title: string;
  description: string;
  location: string;
  workMode: WorkMode;
  employmentType: EmploymentType;
  salaryRange: SalaryRange | null;
  requiredSkills: string[];
  situationalQuestions: SituationalQuestion[]; // pool anti-trampa
  status: JobStatus;
  applicationsCount: number; // contador desnormalizado
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
}

// ---------------------------------------------------------------
//  APPLICATIONS  (colección: applications/{jobId}_{candidateId})
// ---------------------------------------------------------------
export type MatchLevel = "low" | "medium" | "high";
export type ApplicationStatus =
  | "pending"
  | "evaluated"
  | "reviewed"
  | "shortlisted"
  | "rejected";

export interface AiEvaluation {
  score: number; // 0-100 (para el empleador)
  matchLevel: MatchLevel;
  employerSummary: string; // análisis para el empleador
  candidateFeedback: string; // feedback instantáneo para el candidato
  evaluatedAt: FirestoreDate;
}

export interface Application {
  applicationId: string; // = `${jobId}_${candidateId}`
  jobId: string;
  candidateId: string;
  employerId: string;

  // Snapshot desnormalizado
  jobTitle: string;
  candidateName: string;
  candidateHeadline: string;

  // Respuesta situacional
  situationalQuestionId: string;
  situationalQuestion: string;
  situationalAnswer: string;

  // Resultado de la IA
  aiEvaluation: AiEvaluation | null;

  status: ApplicationStatus;
  appliedAt: FirestoreDate;
  updatedAt: FirestoreDate;
}
