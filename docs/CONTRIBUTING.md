# Contributing to SpeechifyClone

Thanks for your interest in the project. This guide helps you get oriented and contribute effectively.

---

## Understanding the Project

Before changing code, read:

1. **[DESIGN.md](./DESIGN.md)** — Purpose, architecture, data flow, and where things live (backend vs frontend, services vs routes, components).
2. **[API.md](./API.md)** — Backend API contract (endpoints, request/response, errors).
3. **Root [README.md](../README.md)** — Setup, env vars, and how to run the app.

---

## Development Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Set OPENAI_API_KEY in .env
   npm start
   ```
2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`. The Vite dev server proxies `/api` to the backend.

---

## Code Conventions

- **Backend**: CommonJS, no TypeScript. Keep routes thin; put logic in `src/services`. Use `config/env.js` for environment values. Throw domain errors (e.g. `TtsError`, `ExtractError`) from services; routes map them to HTTP status and JSON.
- **Frontend**: TypeScript, React functional components. Keep API calls in `src/api/*`. Use the existing types in `src/types/*`. Prefer small, reusable components and the existing hooks (e.g. `useAudioPlayer`) where they fit.
- **Style**: Tailwind for layout and theming; follow existing patterns (e.g. `dark:` for dark mode).

---

## Where to Change What

| Goal | Where to look |
|------|----------------|
| Add/modify TTS provider | `backend/src/services/ttsService.js`, `backend/src/config/env.js` |
| Support new document type | `backend/src/services/extractService.js` |
| New API endpoint | New file under `backend/src/routes/`, then mount in `backend/src/app.js` |
| New UI section or flow | New or existing components under `frontend/src/components/`, wire in `App.tsx` |
| New frontend API call | `frontend/src/api/*.ts`, optionally new types in `frontend/src/types/` |
| Env / port / keys | `backend/src/config/env.js`, root `.env` |

---

## Testing Your Changes

- Run backend and frontend locally; run through: upload a document, generate TTS, play/pause/seek, download MP3, toggle theme.
- If you add or change an API, update [API.md](./API.md) and, if the architecture changes, [DESIGN.md](./DESIGN.md).
