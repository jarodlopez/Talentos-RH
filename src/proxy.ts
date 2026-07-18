/**
 * Proxy (antes "middleware") de protección de rutas (gate rápido).
 *
 * Verifica la PRESENCIA de la cookie de sesión y el rol antes de dejar
 * pasar a las áreas privadas. No verifica criptográficamente el token
 * (eso ocurriría en el servidor con el Admin SDK); su objetivo es evitar
 * que un usuario sin sesión aterrice en un dashboard y mejorar la UX.
 *
 * La seguridad REAL de los datos la imponen las Firestore Security Rules.
 */
import { NextResponse, type NextRequest } from "next/server";

const CANDIDATE_PREFIX = "/candidate";
const EMPLOYER_PREFIX = "/employer";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("tp_session")?.value;
  const role = request.cookies.get("tp_role")?.value;

  const isCandidateArea = pathname.startsWith(CANDIDATE_PREFIX);
  const isEmployerArea = pathname.startsWith(EMPLOYER_PREFIX);

  if (!isCandidateArea && !isEmployerArea) {
    return NextResponse.next();
  }

  // Sin sesión -> a login (guardando el destino).
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Con sesión pero rol equivocado -> a su propia área.
  if (isCandidateArea && role === "employer") {
    return NextResponse.redirect(new URL("/employer/dashboard", request.url));
  }
  if (isEmployerArea && role === "candidate") {
    return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/candidate/:path*", "/employer/:path*"],
};
