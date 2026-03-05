/* global process */
import OpenAI from "openai";

let openaiClient = null;

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  return openaiClient;
}

export async function getLlmSuggestions({ codeSnippet, lintIssues, securityWarnings }) {
  const client = getClient();
  if (!client) {
    return [
      "Split large functions into smaller composable functions.",
      "Use descriptive names and remove dead code to improve maintainability.",
      "Add input validation and sanitization around external data boundaries.",
    ];
  }

  const prompt = `
You are a strict senior code reviewer.
Given the code and findings, return JSON only:
{"suggestions":["...", "...", "..."]}

Lint issues:
${lintIssues.join("\n") || "None"}

Security warnings:
${securityWarnings.join("\n") || "None"}

Code:
${codeSnippet.slice(0, 8000)}
`;

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    input: prompt,
    temperature: 0.2,
  });

  const text = response.output_text || "";

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.suggestions) && parsed.suggestions.length) {
      return parsed.suggestions.slice(0, 6);
    }
  } catch {
    return [
      "Refactor deeply nested blocks into guard clauses.",
      "Extract repeated logic into reusable helper functions.",
      "Add tests for edge-case and error paths before optimizing.",
    ];
  }

  return [
    "Refactor deeply nested blocks into guard clauses.",
    "Extract repeated logic into reusable helper functions.",
    "Add tests for edge-case and error paths before optimizing.",
  ];
}
