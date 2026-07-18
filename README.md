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
- [ ] **Bloque 3** — Autenticación y selección de rol
- [ ] Bloques siguientes — Master Profile, vacantes, aplicaciones y evaluación IA
