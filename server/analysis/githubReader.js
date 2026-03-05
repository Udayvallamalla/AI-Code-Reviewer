/* global process */
const ALLOWED_EXTENSIONS = [".js", ".ts", ".py", ".java"];
const MAX_FILES = 20;
const MAX_FILE_BYTES = 200000;

function parseGithubUrl(repoUrl) {
  const match = repoUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/#?]+)(?:[/?#].*)?$/i);
  if (!match) {
    throw new Error("Invalid GitHub URL. Expected format: https://github.com/owner/repo");
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}

function shouldInclude(path) {
  return ALLOWED_EXTENSIONS.some((ext) => path.toLowerCase().endsWith(ext));
}

async function githubFetch(url) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ai-code-reviewer",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`GitHub API error (${response.status})`);
  }

  return response.json();
}

export async function fetchGithubCode(repoUrl) {
  const { owner, repo } = parseGithubUrl(repoUrl);
  const repoData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);
  const branch = repoData.default_branch;

  const treeData = await githubFetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);

  const candidateFiles = (treeData.tree || [])
    .filter((item) => item.type === "blob" && shouldInclude(item.path) && item.size <= MAX_FILE_BYTES)
    .slice(0, MAX_FILES);

  if (!candidateFiles.length) {
    throw new Error("No supported source files found in repository.");
  }

  const chunks = [];
  for (const file of candidateFiles) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`;
    const response = await fetch(rawUrl);
    if (!response.ok) {
      continue;
    }
    const content = await response.text();
    chunks.push(`// File: ${file.path}\n${content}`);
  }

  if (!chunks.length) {
    throw new Error("Unable to fetch code content from repository files.");
  }

  return chunks.join("\n\n");
}
