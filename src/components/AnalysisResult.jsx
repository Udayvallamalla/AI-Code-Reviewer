import { useMemo, useState } from "react";

function RenderList({ title, items }) {
  return (
    <div className="result-block">
      <h4>{title}</h4>
      {items?.length ? (
        <ul>
          {items.map((item, index) => (
            <li key={`${title}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="hint">No issues detected.</p>
      )}
    </div>
  );
}

function AnalysisResult({ result, loading, error, sectionId }) {
  const [targetLanguage, setTargetLanguage] = useState("JavaScript");

  const languageTemplates = useMemo(
    () => ({
      JavaScript: [
        {
          title: "Function decomposition",
          code: `function validateInput(input) {\n  if (!input) throw new Error("input required");\n}\n\nfunction transformData(items) {\n  return items.map((item) => item.trim());\n}\n\nfunction process(items) {\n  validateInput(items);\n  return transformData(items);\n}`,
        },
        {
          title: "Naming and dead code cleanup",
          code: `// Before: const x = getData(); const temp = 123;\nconst users = getData();\nreturn users.filter((user) => user.isActive);`,
        },
        {
          title: "Input validation and sanitization",
          code: `function safeQuery(input) {\n  const value = String(input ?? "").trim();\n  if (!value) throw new Error("Invalid input");\n  return value.replace(/[^a-zA-Z0-9_\\- ]/g, "");\n}`,
        },
      ],
      Python: [
        {
          title: "Function decomposition",
          code: `def validate_input(value):\n    if not value:\n        raise ValueError("input required")\n\n\ndef transform_data(items):\n    return [item.strip() for item in items]\n\n\ndef process(items):\n    validate_input(items)\n    return transform_data(items)`,
        },
        {
          title: "Naming and dead code cleanup",
          code: `# Before: x = get_data(); temp = 123\nusers = get_data()\nreturn [user for user in users if user["is_active"]]`,
        },
        {
          title: "Input validation and sanitization",
          code: `import re\n\n\ndef safe_query(raw_input):\n    value = str(raw_input or "").strip()\n    if not value:\n        raise ValueError("Invalid input")\n    return re.sub(r"[^a-zA-Z0-9_\\- ]", "", value)`,
        },
      ],
      Java: [
        {
          title: "Function decomposition",
          code: `private static void validateInput(List<String> items) {\n  if (items == null || items.isEmpty()) {\n    throw new IllegalArgumentException("input required");\n  }\n}\n\nprivate static List<String> transformData(List<String> items) {\n  return items.stream().map(String::trim).toList();\n}\n\nprivate static List<String> process(List<String> items) {\n  validateInput(items);\n  return transformData(items);\n}`,
        },
        {
          title: "Naming and dead code cleanup",
          code: `// Before: var x = getData(); int temp = 123;\nList<User> users = getData();\nreturn users.stream().filter(User::isActive).toList();`,
        },
        {
          title: "Input validation and sanitization",
          code: `private static String safeQuery(String input) {\n  String value = input == null ? "" : input.trim();\n  if (value.isEmpty()) {\n    throw new IllegalArgumentException("Invalid input");\n  }\n  return value.replaceAll("[^a-zA-Z0-9_\\\\- ]", "");\n}`,
        },
      ],
      "C++": [
        {
          title: "Function decomposition",
          code: `void validateInput(const vector<string>& items) {\n  if (items.empty()) throw invalid_argument("input required");\n}\n\nvector<string> transformData(const vector<string>& items) {\n  vector<string> out;\n  for (auto item : items) out.push_back(trim(item));\n  return out;\n}\n\nvector<string> process(const vector<string>& items) {\n  validateInput(items);\n  return transformData(items);\n}`,
        },
        {
          title: "Naming and dead code cleanup",
          code: `// Before: auto x = getData(); int temp = 123;\nauto users = getData();\n// filter users where user.isActive == true`,
        },
        {
          title: "Input validation and sanitization",
          code: `string safeQuery(const string& input) {\n  string value = trim(input);\n  if (value.empty()) throw invalid_argument("Invalid input");\n  value.erase(remove_if(value.begin(), value.end(), [](char c) {\n    return !isalnum(c) && c != '_' && c != '-' && c != ' ';\n  }), value.end());\n  return value;\n}`,
        },
      ],
      TypeScript: [
        {
          title: "Function decomposition",
          code: `function validateInput(input: string[]): void {\n  if (!input?.length) throw new Error("input required");\n}\n\nfunction transformData(items: string[]): string[] {\n  return items.map((item) => item.trim());\n}\n\nfunction process(items: string[]): string[] {\n  validateInput(items);\n  return transformData(items);\n}`,
        },
        {
          title: "Naming and dead code cleanup",
          code: `// Before: const x = getData(); const temp = 123;\nconst users = getData();\nreturn users.filter((user) => user.isActive);`,
        },
        {
          title: "Input validation and sanitization",
          code: `function safeQuery(input: unknown): string {\n  const value = String(input ?? "").trim();\n  if (!value) throw new Error("Invalid input");\n  return value.replace(/[^a-zA-Z0-9_\\- ]/g, "");\n}`,
        },
      ],
    }),
    [],
  );

  const fallbackExamples = [
    {
      title: "Function decomposition",
      code: `function validateInput(input) {\n  if (!input) throw new Error("input required");\n}\n\nfunction transformData(items) {\n  return items.map((item) => item.trim());\n}\n\nfunction process(items) {\n  validateInput(items);\n  return transformData(items);\n}`,
    },
    {
      title: "Naming and dead code cleanup",
      code: `// Before: const x = getData(); const temp = 123;\nconst users = getData();\nreturn users.filter((user) => user.isActive);`,
    },
    {
      title: "Input validation and sanitization",
      code: `function safeQuery(input) {\n  const value = String(input ?? "").trim();\n  if (!value) throw new Error("Invalid input");\n  return value.replace(/[^a-zA-Z0-9_\\- ]/g, "");\n}`,
    },
  ];

  const refactorExamples =
    targetLanguage === "JavaScript" && result?.refactorCodeExamples?.length
      ? result.refactorCodeExamples
      : languageTemplates[targetLanguage] || fallbackExamples;

  return (
    <section className="panel" id={sectionId}>
      <h3>Analysis Results</h3>

      {loading && <p className="hint">Running parser, static checks, and LLM review...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && !result && <p className="hint">Run an analysis to see results here.</p>}

      {!loading && result && (
        <div className="results-grid">
          <div className="score-card">
            <p>Code Quality Score</p>
            <strong>{result.qualityScore}/100</strong>
            <span>{result.complexity?.label || "Complexity unavailable"}</span>
          </div>

          <RenderList title="Bad Coding Patterns" items={result.badPatterns} />
          <RenderList title="Security Vulnerabilities" items={result.securityWarnings} />
          <RenderList title="Refactoring Suggestions" items={result.refactorSuggestions} />

          <div className="result-block">
            <h4>Suggested Refactor Code</h4>
            <div className="panel-row language-row">
              <label htmlFor="refactor-language">Language</label>
              <select
                id="refactor-language"
                value={targetLanguage}
                onChange={(event) => setTargetLanguage(event.target.value)}
              >
                {Object.keys(languageTemplates).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            {refactorExamples.length ? (
              refactorExamples.map((example, index) => (
                <div key={`${example.title}-${index}`} className="code-example">
                  <p className="hint">{example.title}</p>
                  <pre>
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))
            ) : (
              <p className="hint">No code examples available.</p>
            )}
          </div>

          <div className="result-block">
            <h4>Time Complexity Estimation</h4>
            <p>{result.complexity?.timeComplexity || "N/A"}</p>
            <p className="hint">{result.complexity?.reason}</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default AnalysisResult;
