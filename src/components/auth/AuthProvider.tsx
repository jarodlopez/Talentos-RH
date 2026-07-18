"use client";

/**
 * AuthProvider — estado de sesión global.
 *
 * Escucha los cambios de autenticación de Firebase, carga el documento
 * users/{uid} para conocer el rol, y expone helpers para registrar,
 * iniciar y cerrar sesión.
 *
 * Además sincroniza dos cookies ligeras (tp_session, tp_role) que el
 * middleware usa para hacer un "gating" rápido de rutas. La seguridad
 * REAL de los datos vive en las Firestore Security Rules, no en estas
 * cookies (que son solo para UX de navegación).
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AppUser, UserRole } from "@/types";

interface AuthContextValue {
  firebaseUser: User | null;
  appUser: AppUser | null;
  role: UserRole | null;
  loading: boolean;
  register: (params: RegisterParams) => Promise<AppUser>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterParams {
  email: string;
  password: string;
  displayName: string;
  role: Exclude<UserRole, "admin">; // el registro público solo crea candidate/employer
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ---- helpers de cookies (solo navegación / UX) ----
function setCookie(name: string, value: string, maxAgeSeconds = 60 * 60) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}
function clearCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    const db = getDb();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setAppUser(null);
        clearCookie("tp_session");
        clearCookie("tp_role");
        setLoading(false);
        return;
      }

      setFirebaseUser(user);

      try {
        const snap = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
        const data = snap.exists() ? (snap.data() as AppUser) : null;
        setAppUser(data);

        const token = await user.getIdToken();
        setCookie("tp_session", token);
        if (data?.role) setCookie("tp_role", data.role);
      } catch {
        setAppUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function register({
    email,
    password,
    displayName,
    role,
  }: RegisterParams): Promise<AppUser> {
    const auth = getFirebaseAuth();
    const db = getDb();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = cred;

    await updateProfile(user, { displayName });

    // 1) Documento users/{uid} — el "login" común a todos.
    const newUser: Omit<AppUser, "createdAt" | "lastLoginAt"> = {
      uid: user.uid,
      email,
      displayName,
      role,
      photoURL: null,
    };
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });

    // 2) Documento de perfil segun el rol (stub inicial vacio).
    if (role === "candidate") {
      await setDoc(doc(db, COLLECTIONS.CANDIDATES, user.uid), {
        uid: user.uid,
        fullName: displayName,
        headline: "",
        location: "",
        phone: "",
        summary: "",
        skills: [],
        experience: [],
        education: [],
        integrityTest: null,
        profileCompleteness: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, COLLECTIONS.EMPLOYERS, user.uid), {
        uid: user.uid,
        companyName: displayName,
        companyLogo: null,
        industry: "",
        website: "",
        description: "",
        contactEmail: email,
        verified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const token = await user.getIdToken();
    setCookie("tp_session", token);
    setCookie("tp_role", role);

    const created = { ...newUser } as AppUser;
    setAppUser(created);
    return created;
  }

  async function login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    // onAuthStateChanged se encarga de cargar el appUser y las cookies.
  }

  async function logout(): Promise<void> {
    await signOut(getFirebaseAuth());
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      appUser,
      role: appUser?.role ?? null,
      loading,
      register,
      login,
      logout,
    }),
    [firebaseUser, appUser, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return ctx;
}
