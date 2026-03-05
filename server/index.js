/* global process */
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeSourceCode } from "./analysis/analyzeEngine.js";
import { fetchGithubCode } from "./analysis/githubReader.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "AI code reviewer server is running." });
});

app.post("/analyze/code", async (req, res) => {
  const { code, language } = req.body;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "Code input is required." });
  }

  try {
    const analysis = await analyzeSourceCode(code, language || "javascript");
    return res.json({ source: "code", analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Code analysis failed." });
  }
});

app.post("/analyze/github", async (req, res) => {
  const { repoUrl } = req.body;

  if (!repoUrl || typeof repoUrl !== "string") {
    return res.status(400).json({ error: "GitHub repository URL is required." });
  }

  try {
    const repoCode = await fetchGithubCode(repoUrl);
    const analysis = await analyzeSourceCode(repoCode, "javascript");
    return res.json({ source: "github", analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Repository analysis failed." });
  }
});

app.use((err, _req, res, next) => {
  void next;
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON payload." });
  }
  return res.status(500).json({ error: err?.message || "Internal server error." });
});

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
