const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");

class ExtractError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ExtractError";
    this.statusCode = statusCode;
  }
}

/**
 * Extract plain text from an uploaded document buffer.
 * Supports PDF, DOCX, and TXT.
 */
async function extractTextFromFile(file) {
  if (!file) {
    throw new ExtractError("No file uploaded.", 400);
  }

  const { originalname, buffer, mimetype } = file;
  const ext = (path.extname(originalname) || "").toLowerCase();
  let text = "";

  if (ext === ".pdf" || mimetype === "application/pdf") {
    const data = await pdfParse(buffer);
    text = data.text || "";
  } else if (
    ext === ".docx" ||
    mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value || "";
  } else if (ext === ".txt" || mimetype === "text/plain") {
    text = buffer.toString("utf8");
  } else {
    throw new ExtractError(
      "Unsupported file type. Please upload PDF, DOCX, or TXT.",
      400
    );
  }

  text = (text || "").trim();
  if (!text) {
    throw new ExtractError(
      "Could not extract any text from the document.",
      400
    );
  }

  return text;
}

module.exports = {
  extractTextFromFile,
  ExtractError
};

