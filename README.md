# Talentos-RH

Plataforma de Talent Pool y reclutamiento automatizado. Los candidatos crean un
**Master Profile** una sola vez y, al aplicar a una vacante, responden **una**
pregunta situacional. Una IA evalúa el perfil + la respuesta, entrega un *score*
al empleador y *feedback* instantáneo al candidato.

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **TailwindCSS** para la UI
- **Firebase** — Authentication + Firestore (client SDK) y Admin SDK (servidor)
- **Vercel** para el deploy

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # rellena con tus credenciales de Firebase
npm run dev
```

Abre http://localhost:3000

## Estructura

```
src/
├── app/            Rutas (App Router) + API Routes
├── components/     Componentes React por rol y compartidos
├── lib/            Firebase (client/admin), IA y utilidades
├── hooks/          Custom hooks
└── types/          Tipos TypeScript (reflejan el esquema Firestore)
```

## Modelo de datos (Firestore)

Colecciones raíz: `users`, `candidates`, `employers`, `jobPosts`, `applications`.
Ver definiciones completas en [`src/types/index.ts`](src/types/index.ts).

## Progreso por bloques

- [x] **Bloque 1** — Feedback técnico, estructura y esquema de datos
- [x] **Bloque 2** — Inicialización del proyecto (Next.js + Firebase + tipos)
- [x] **Bloque 3** — Autenticación (email/password + Google) y selección de rol
- [x] **Bloque 4** — Super Admin (gestión de usuarios) + Security Rules
- [ ] Bloques siguientes — Master Profile, vacantes, aplicaciones y evaluación IA

## Seguridad

- Las acciones de administración pasan por API Routes server-side con el
  Admin SDK; el rol de admin se valida contra una allowlist tras verificar
  el token (`src/lib/auth/`).
- Las reglas de Firestore están en [`firestore.rules`](firestore.rules) y
  deben publicarse en Firebase Console (Firestore → Rules).
