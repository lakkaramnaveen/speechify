const express = require("express");
const { generateSpeech, TtsError } = require("../services/ttsService");

const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { text, voice, speed } = req.body || {};
    const buffer = await generateSpeech({ text, voice, speed });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');
    res.send(buffer);
  } catch (err) {
    if (err instanceof TtsError) {
      res.status(err.statusCode || 500).json({ error: err.message });
      return;
    }
    next(err);
  }
});

module.exports = router;

