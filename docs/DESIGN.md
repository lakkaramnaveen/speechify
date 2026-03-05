# SpeechifyClone — Design Document

This document describes the purpose, architecture, and key design decisions of SpeechifyClone so that new contributors and stakeholders can understand the project.

---

## 1. Purpose & Goals

**SpeechifyClone** is a full-stack web application that converts text and documents into natural-sounding speech (text-to-speech, TTS). It is inspired by [Speechify](https://github.com/SpeechifyInc) and built as a modular, production-style codebase.

### Primary goals

- **Read content aloud**: Support pasted text and uploaded documents (PDF, DOCX, TXT) and generate high-quality spoken audio.
- **Good UX**: Playback controls (play, pause, stop, seek), word-level highlighting during playback, and MP3 download.
- **Modularity**: Clear separation between frontend (React), backend (Node/Express), and external services (TTS provider) so that features and providers can be added or swapped without rewriting the app.
- **Production-ready structure**: Config, services, routes, typed APIs, reusable components, and centralized error handling.

### Non-goals (for current version)

- User accounts, authentication, or persistence across sessions.
- Storing documents or audio in a database.
- Real-time streaming TTS (current flow is generate-then-play).

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Browser (React SPA)                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │   Sidebar   │  │ Reader /     │  │  API clients (documentApi,       │ │
│  │  Documents  │  │ Text editor  │  │  ttsApi) → fetch("/api/...")     │ │
│  │  Theme      │  │ Playback     │  └─────────────────────────────────┘ │
│  └─────────────┘  └──────────────┘                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                          Vite proxy /api → http://localhost:5000
                                        │
┌─────────────────────────────────────────────────────────────────────────┐
│                     Node.js Backend (Express)                           │
│  ┌─────────────────────────────────────────────────────────────────────┐│
│  │  Routes: /api/extract-text, /api/tts, /api/health                   ││
│  └─────────────────────────────────────────────────────────────────────┘│
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────────────┐ │
│  │ config/env   │  │ services/         │  │ External: OpenAI TTS API    ││
│  │ (port, keys) │  │ extractService    │  │ (audio/speech → MP3)        ││
│  │              │  │ ttsService        │  └────────────────────────────┘│
│  └──────────────┘  └──────────────────┘                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Frontend**: Single-page app (React + Vite + TypeScript + Tailwind). It talks to the backend via `fetch` to `/api/*`; in development, Vite proxies those requests to the Express server.
- **Backend**: Express app that exposes REST endpoints. Business logic lives in **services**; **routes** are thin and delegate to services. Configuration is centralized in **config**.
- **TTS**: Currently OpenAI’s TTS API (`/v1/audio/speech`). The TTS integration is isolated in `ttsService.js`, so swapping to another provider (e.g. ElevenLabs) requires changes mainly there and in config.

---

## 3. Technology Stack

| Layer        | Technology |
|-------------|------------|
| Frontend    | React 18, TypeScript, Vite 6, Tailwind CSS |
| Backend     | Node.js 18+, Express 4, CommonJS |
| TTS         | OpenAI TTS API (e.g. `gpt-4o-mini-tts`), MP3 output |
| Doc parsing | pdf-parse (PDF), mammoth (DOCX), Node Buffer (TXT) |
| Dev proxy   | Vite `server.proxy` for `/api` → backend |

---

## 4. Backend Structure

```
backend/
├── server.js                 # Entry: loads app, binds port
├── .env.example
├── package.json
└── src/
    ├── app.js                 # Express app: CORS, JSON, routes, error handler
    ├── config/
    │   └── env.js             # NODE_ENV, PORT, OPENAI_API_KEY
    ├── services/
    │   ├── extractService.js  # PDF/DOCX/TXT → plain text
    │   └── ttsService.js      # text + voice + speed → MP3 buffer (OpenAI)
    └── routes/
        ├── extract.routes.js  # POST /api/extract-text
        ├── tts.routes.js     # POST /api/tts
        └── health.routes.js  # GET /api/health
```

### Design choices

- **Config**: All environment-derived values (port, API keys) are read in `config/env.js` so the rest of the app does not touch `process.env` directly.
- **Services**: Contain the core logic (extraction, TTS). They throw domain-specific errors (e.g. `ExtractError`, `TtsError`) with optional status codes; routes map these to HTTP responses.
- **Routes**: Only handle HTTP (body, query, file upload) and call one service per endpoint. Unhandled errors fall through to the global error handler in `app.js`.
- **Error handling**: In production, 5xx responses can be sanitized to a generic message while full details are logged server-side.

---

## 5. Frontend Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.ts             # Proxy /api → backend
├── tailwind.config.cjs
├── postcss.config.cjs
└── src/
    ├── main.tsx
    ├── App.tsx                # Root: state, composition of layout + reader
    ├── index.css
    ├── api/
    │   ├── documentApi.ts      # extractTextFromFile(file) → /api/extract-text
    │   └── ttsApi.ts         # generateSpeech({ text, voice, speed }) → /api/tts
    ├── types/
    │   ├── documents.ts       # DocumentItem, DocumentId
    │   └── tts.ts             # VoiceOption, GenerateTtsRequest
    ├── hooks/
    │   └── useAudioPlayer.ts  # Audio ref, play/pause/stop/seek, URL lifecycle
    └── components/
        ├── layout/
        │   ├── Sidebar.tsx    # App title, theme, new/upload, document list
        │   └── ThemeToggle.tsx
        ├── documents/
        │   └── DocumentList.tsx
        └── reader/
            ├── TextEditor.tsx
            ├── ReadingView.tsx   # Word-level highlight from playback progress
            ├── VoiceSpeedControls.tsx
            └── PlayerControls.tsx
```

### Design choices

- **Typed APIs**: `documentApi` and `ttsApi` are the only places that call the backend; they return typed data or throw on error. This keeps HTTP and error parsing in one place.
- **Single source of state**: `App.tsx` holds theme, documents, active document, editor text, voice, speed, and error. No global store is used; state is passed down or via callbacks.
- **Reusable UI**: Sidebar, DocumentList, TextEditor, ReadingView, VoiceSpeedControls, and PlayerControls are presentational or lightly behavioral; they receive props and callbacks from `App`.
- **Audio**: `useAudioPlayer` encapsulates the `<audio>` element, blob URL lifecycle, and playback state (currentTime, duration, play/pause/stop/seek). The app supplies the audio URL (from TTS response) and uses the hook for all playback UI.
- **Word highlighting**: ReadingView splits the current text into words and highlights the word at index `floor((currentTime / duration) * words.length)`. This is an approximation (no word-level timestamps from the API).

---

## 6. Data Flow

### Document flow

1. User uploads a file (or creates blank) → Frontend calls `extractTextFromFile(file)` or creates a new document in memory.
2. Backend receives file at `POST /api/extract-text` → `extractService.extractTextFromFile(req.file)` → returns `{ text }`.
3. Frontend adds a document to the list, sets it active, and puts `text` into the editor.

### TTS and playback flow

1. User clicks “Generate audio” with current editor text, voice, and speed.
2. Frontend calls `generateSpeech({ text, voice, speed })` → `POST /api/tts` with JSON body.
3. Backend `ttsService.generateSpeech(...)` calls OpenAI TTS API, returns MP3 buffer; route sends it as `audio/mpeg`.
4. Frontend receives array buffer → creates blob URL → `useAudioPlayer.loadFromArrayBuffer(buffer)` → playback controls and seek become available.
5. User can play, pause, stop, seek; ReadingView uses `currentTime` and `duration` from the hook to highlight the current word.

### Theme

- Theme is stored in React state (`light` | `dark`). On change, the root `document.documentElement` gets class `dark` or not; Tailwind’s `dark:` variants apply.

---

## 7. Security & Configuration

- **API key**: The OpenAI API key is only used on the backend (`OPENAI_API_KEY` in `.env`). The frontend never sees it.
- **CORS**: Backend allows requests from the frontend (in dev, same-origin via proxy; in production, configure `cors` origin as needed).
- **File upload**: Multer limits (e.g. 10 MB) and allowed types (PDF, DOCX, TXT) are enforced on the server.
- **Errors**: In production, the global error handler can hide internal error messages from clients and log them server-side.

---

## 8. Extension Points

- **Another TTS provider**: Implement a new function in `ttsService.js` (or a new service) that returns an MP3 buffer; switch the TTS route to use it. Optionally add provider-specific config in `config/env.js`.
- **New document types**: In `extractService.js`, add a branch for the new MIME type/extension and use an appropriate parser; keep the same `extractTextFromFile(file)` interface.
- **Persistence**: Add a database (e.g. SQLite/Postgres) and new routes/services for saving/loading documents and optionally audio; frontend can add “Save” / “Open” against these endpoints.
- **Auth**: Add authentication middleware and session or JWT handling in Express; protect routes and optionally tie documents to users.
- **Streaming TTS**: If the TTS provider supports streaming, add a streaming endpoint and use the Web Audio API or MediaSource on the frontend for playback while data arrives.

---

## 9. Glossary

| Term | Meaning |
|------|--------|
| TTS | Text-to-speech; conversion of text to spoken audio. |
| Extract | Reading plain text from an uploaded document (PDF, DOCX, TXT). |
| Reading view | The panel that shows the current text with the active word highlighted during playback. |
| Voice / Speed | TTS parameters: voice id (e.g. alloy, verse, ash) and playback speed (e.g. 0.75–1.5). |

---

For API request/response details, see [API.md](./API.md). For setup and run instructions, see the root [README.md](../README.md).
