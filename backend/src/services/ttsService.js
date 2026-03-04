const { config } = require("../config/env");

class TtsError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "TtsError";
    this.statusCode = statusCode;
  }
}

/**
 * Call OpenAI TTS API and return an MP3 buffer.
 */
async function generateSpeech({ text, voice = "alloy", speed = 1 }) {
  if (!config.openAiApiKey) {
    throw new TtsError("OPENAI_API_KEY is not configured on the server.", 500);
  }

  if (!text || typeof text !== "string" || !text.trim()) {
    throw new TtsError("Text is required for TTS.", 400);
  }

  const safeSpeed =
    typeof speed === "number" ? Math.min(Math.max(speed, 0.5), 2.0) : 1;

  const requestBody = {
    model: "gpt-4o-mini-tts",
    voice,
    input: text,
    format: "mp3",
    speed: safeSpeed
  };

  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openAiApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new TtsError(
      "TTS provider error",
      response.status || 500,
      errorText
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = {
  generateSpeech,
  TtsError
};

