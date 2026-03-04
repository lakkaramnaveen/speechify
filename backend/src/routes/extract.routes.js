const express = require("express");
const multer = require("multer");
const { extractTextFromFile, ExtractError } = require("../services/extractService");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const text = await extractTextFromFile(req.file);
    res.json({ text });
  } catch (err) {
    if (err instanceof ExtractError) {
      res.status(err.statusCode || 400).json({ error: err.message });
      return;
    }
    next(err);
  }
});

module.exports = router;

