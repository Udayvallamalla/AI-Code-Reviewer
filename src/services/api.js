const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:4000" : "");

function estimateComplexity(code) {
  const loops = (code.match(/\b(for|while)\b/g) || []).length;
  if (loops >= 2) {
    return { timeComplexity: "O(n^2)", label: "Medium", reason: "Nested or multiple loops detected." };
  }
  if (loops === 1) {
    return { timeComplexity: "O(n)", label: "Low", reason: "Single loop detected." };
  }
  return { timeComplexity: "O(1)", label: "Low", reason: "No loop-heavy patterns found." };
}

function localAnalyze(code, language = "javascript") {
  const badPatterns = [];
  const securityWarnings = [];

  if (/(^|\n)\s{8,}\S/m.test(code)) {
    badPatterns.push("Deep indentation detected; consider reducing nesting.");
  }
  if (/\beval\s*\(/.test(code)) {
    securityWarnings.push("Use of eval() detected.");
  }
  if (/(api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"]+['"]/i.test(code)) {
    securityWarnings.push("Hardcoded secret-like value detected.");
  }
  if ((code.match(/\n/g) || []).length > 160) {
    badPatterns.push("Large code block detected; consider splitting into smaller functions.");
  }
  if (!badPatterns.length) {
    badPatterns.push("No major anti-patterns detected by local analyzer.");
  }

  const complexity = estimateComplexity(code);
  const securityPenalty = securityWarnings.length * 12;
  const patternPenalty = Math.max(0, badPatterns.length - 1) * 8;
  const qualityScore = Math.max(55, 100 - securityPenalty - patternPenalty - (complexity.timeComplexity === "O(n^2)" ? 8 : 0));

  const refactorCodeExamples = {
    JavaScript: [
      {
        title: "Split logic into helpers",
        code: "function validateInput(v){ if(!v) throw new Error('invalid input'); }\nfunction run(items){ validateInput(items); return items.map(i=>i.trim()); }",
      },
    ],
    Python: [
      {
        title: "Split logic into helpers",
        code: "def validate_input(v):\n    if not v:\n        raise ValueError('invalid input')\n\ndef run(items):\n    validate_input(items)\n    return [i.strip() for i in items]",
      },
    ],
    Java: [
      {
        title: "Split logic into helpers",
        code: "private static void validateInput(List<String> v){ if(v==null||v.isEmpty()) throw new IllegalArgumentException(); }\nprivate static List<String> run(List<String> items){ validateInput(items); return items.stream().map(String::trim).toList(); }",
      },
    ],
    "C++": [
      {
        title: "Split logic into helpers",
        code: "void validateInput(const vector<string>& v){ if(v.empty()) throw invalid_argument(\"invalid input\"); }\nvector<string> run(const vector<string>& items){ validateInput(items); return items; }",
      },
    ],
    TypeScript: [
      {
        title: "Split logic into helpers",
        code: "function validateInput(v: string[]): void { if(!v?.length) throw new Error('invalid input'); }\nfunction run(items: string[]): string[] { validateInput(items); return items.map(i=>i.trim()); }",
      },
    ],
  };

  return {
    source: "local-fallback",
    analysis: {
      badPatterns,
      securityWarnings,
      complexity,
      refactorSuggestions: [
        "Break large blocks into smaller functions.",
        "Use clearer variable/function names.",
        "Validate and sanitize all external inputs.",
      ],
      refactorCodeExamples: refactorCodeExamples[language === "python" ? "Python" : "JavaScript"],
      qualityScore,
      scoreBreakdown: {
        lintScore: 82,
        securityScore: Math.max(60, 100 - securityPenalty),
        complexityScore: complexity.timeComplexity === "O(n^2)" ? 78 : 92,
        readabilityScore: 84,
      },
    },
  };
}

async function requestOrNull(path, payload) {
  if (!API_BASE_URL) {
    return null;
  }

  try {
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
    if (!isJson) {
      return null;
    }

    const data = JSON.parse(raw || "{}");
    if (!response.ok) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export async function analyzeCode(code, language = "javascript") {
  const remote = await requestOrNull("/analyze/code", { code, language });
  return remote || localAnalyze(code, language);
}

export async function analyzeGithub(repoUrl) {
  const remote = await requestOrNull("/analyze/github", { repoUrl });
  if (remote) {
    return remote;
  }
  return localAnalyze(
    `Repository URL: ${repoUrl}\nNo backend API available, so this is a client-side fallback review.`,
    "javascript",
  );
}
