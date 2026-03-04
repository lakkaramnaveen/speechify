## SpeechifyClone

SpeechifyClone is a full‑stack web application that converts text and documents into natural‑sounding speech, similar to Speechify. It uses a React + Vite + TypeScript frontend with Tailwind CSS and a Node.js + Express backend that integrates with a TTS provider (OpenAI TTS by default).

### Project Structure

- `frontend` – React/Vite/Tailwind UI
- `backend` – Node/Express API for TTS and document text extraction

### Prerequisites

- Node.js 18+ (required for `fetch` in Node and modern tooling)
- npm or pnpm or yarn
- An OpenAI API key (for TTS) set as `OPENAI_API_KEY`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env to add your OpenAI API key
npm start
```

The backend will start on `http://localhost:5000` by default.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Vite will start the frontend dev server on `http://localhost:5173`. The Vite dev server is configured to proxy `/api` to the backend, so the frontend will call `http://localhost:5000` transparently.

### Environment Variables (Backend)

Create `backend/.env` with:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=5000
```

### Core Features Implemented

- Text area input for arbitrary text
- File upload for PDF, DOCX, and TXT with server‑side extraction
- TTS generation via OpenAI’s TTS API (MP3 output)
- Playback controls: Play, Pause, Stop, Seek slider
- Approximate word highlighting synced with playback progress
- Sidebar listing uploaded documents and quick switching
- Light/dark mode toggle
- MP3 download of the last generated audio

### Notes

- Replace the OpenAI TTS integration with another provider (e.g., ElevenLabs) by updating the `/api/tts` route in `backend/server.js`.
- This repo is intentionally lightweight; you can add authentication, persistence, and advanced settings as next steps.

