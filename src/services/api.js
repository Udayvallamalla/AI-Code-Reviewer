const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  const isJson = contentType.includes("application/json");
  const data = isJson ? JSON.parse(raw || "{}") : null;

  if (!isJson) {
    throw new Error(
      `API returned non-JSON response. Check backend is running at ${API_BASE_URL} and endpoint ${path} exists.`,
    );
  }

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export async function analyzeCode(code, language = "javascript") {
  return request("/analyze/code", { code, language });
}

export async function analyzeGithub(repoUrl) {
  return request("/analyze/github", { repoUrl });
}
