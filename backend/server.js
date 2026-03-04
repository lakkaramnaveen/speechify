const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

app.post("/api/extract-text", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { originalname, buffer, mimetype } = req.file;
    const ext = (path.extname(originalname) || "").toLowerCase();
    let text = "";

    if (ext === ".pdf" || mimetype === "application/pdf") {
      const data = await pdfParse(buffer);
      text = data.text || "";
    } else if (ext === ".docx" || mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || "";
    } else if (ext === ".txt" || mimetype === "text/plain") {
      text = buffer.toString("utf8");
    } else {
      return res
        .status(400)
        .json({ error: "Unsupported file type. Please upload PDF, DOCX, or TXT." });
    }

    text = text.trim();
    if (!text) {
      return res.status(400).json({ error: "Could not extract any text from the document." });
    }

    res.json({ text });
  } catch (err) {
    console.error("Error extracting text:", err);
    res.status(500).json({ error: "Failed to extract text from document." });
  }
});

app.post("/api/tts", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
    }

    const { text, voice = "alloy", speed = 1 } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required for TTS." });
    }

    const safeSpeed = typeof speed === "number" ? Math.min(Math.max(speed, 0.5), 2.0) : 1;

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
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI TTS error:", errorText);
      return res.status(500).json({ error: "TTS provider error", details: errorText });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
    res.send(buffer);
  } catch (err) {
    console.error("Error in /api/tts:", err);
    res.status(500).json({ error: "Failed to generate speech." });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`SpeechifyClone backend listening on http://localhost:${PORT}`);
});

