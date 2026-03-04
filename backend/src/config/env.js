const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

const env = process.env.NODE_ENV || "development";

const config = {
  env,
  isProd: env === "production",
  isDev: env !== "production",
  port: Number(process.env.PORT) || 5000,
  openAiApiKey: process.env.OPENAI_API_KEY || ""
};

module.exports = {
  config
};

