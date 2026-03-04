import type { GenerateTtsRequest } from "../types/tts";

export async function generateSpeech(
  payload: GenerateTtsRequest
): Promise<ArrayBuffer> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let message = "Failed to generate speech.";
    try {
      const data = await response.json();
      if (data?.error) {
        message = data.error;
      }
    } catch {
      // ignore JSON parse errors and fall back to default message
    }
    throw new Error(message);
  }

  return response.arrayBuffer();
}

