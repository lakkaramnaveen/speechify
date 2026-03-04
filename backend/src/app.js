const express = require("express");
const cors = require("cors");
const { config } = require("./config/env");
const extractRoutes = require("./routes/extract.routes");
const ttsRoutes = require("./routes/tts.routes");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: false
  })
);
app.use(express.json({ limit: "2mb" }));

app.use("/api/extract-text", extractRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/health", healthRoutes);

// Generic error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
  // Avoid leaking implementation details in production.
  const status = err.statusCode || 500;
  const message =
    status >= 500 && config.isProd
      ? "Internal server error."
      : err.message || "Unexpected error.";

  // Log full error on the server only.
  // eslint-disable-next-line no-console
  console.error(err);

  res.status(status).json({ error: message });
});

module.exports = {
  app
};

