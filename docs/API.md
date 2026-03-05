# SpeechifyClone — API Reference

This document describes the HTTP API provided by the SpeechifyClone backend. The base URL in development is `http://localhost:5000`; the frontend proxies `/api` to this host.

---

## Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/extract-text` | Extract plain text from an uploaded document (PDF, DOCX, TXT). |
| POST | `/api/tts` | Generate speech from text; returns MP3 audio. |
| GET | `/api/health` | Health check; returns `{ status: "ok" }`. |

All JSON error responses use the shape: `{ "error": "<message>" }`.

---

## POST /api/extract-text

Extracts plain text from a single uploaded file. Supports PDF, DOCX, and TXT.

### Request

- **Content-Type**: `multipart/form-data`
- **Body**: One file under the field name `file`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | A PDF, DOCX, or TXT file. Max size 10 MB. |

### Success response

- **Status**: `200 OK`
- **Content-Type**: `application/json`
- **Body**:

```json
{
  "text": "Extracted plain text from the document..."
}
```

### Error responses

| Status | Condition | Example `error` |
|--------|-----------|------------------|
| 400 | No file in request | `"No file uploaded."` |
| 400 | Unsupported file type | `"Unsupported file type. Please upload PDF, DOCX, or TXT."` |
| 400 | No text extracted | `"Could not extract any text from the document."` |
| 500 | Server/parsing error | `"Failed to extract text from document."` or generic message in production |

---

## POST /api/tts

Generates speech from the given text using the configured TTS provider (e.g. OpenAI). Returns the audio as an MP3 file.

### Request

- **Content-Type**: `application/json`
- **Body**:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| text | string | Yes | — | Text to convert to speech. |
| voice | string | No | `"alloy"` | Voice ID (e.g. `alloy`, `verse`, `ash` for OpenAI). |
| speed | number | No | `1` | Playback speed. Clamped to `0.5`–`2.0` on the server. |

Example:

```json
{
  "text": "Hello, world.",
  "voice": "alloy",
  "speed": 1.25
}
```

### Success response

- **Status**: `200 OK`
- **Content-Type**: `audio/mpeg`
- **Headers**: `Content-Disposition: attachment; filename="speech.mp3"`
- **Body**: Raw MP3 binary data.

### Error responses

| Status | Condition | Example `error` |
|--------|-----------|------------------|
| 400 | Missing or empty text | `"Text is required for TTS."` |
| 500 | TTS provider not configured | `"OPENAI_API_KEY is not configured on the server."` |
| 500 | TTS provider error | `"TTS provider error"` or generic in production |
| 500 | Unexpected error | Generic message in production |

---

## GET /api/health

Simple liveness/readiness check.

### Request

No body or query parameters.

### Success response

- **Status**: `200 OK`
- **Content-Type**: `application/json`
- **Body**:

```json
{
  "status": "ok"
}
```

---

## CORS

The backend sends CORS headers so that the frontend (e.g. on another port or origin) can call these endpoints. In production, restrict `origin` in the CORS configuration as needed.

---

## Environment

The API behavior depends on backend environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port; default `5000`. |
| `OPENAI_API_KEY` | Yes (for TTS) | OpenAI API key used by the TTS service. |
| `NODE_ENV` | No | When `production`, 5xx error messages may be sanitized for clients. |

See the root [README.md](../README.md) and [DESIGN.md](./DESIGN.md) for more context.
