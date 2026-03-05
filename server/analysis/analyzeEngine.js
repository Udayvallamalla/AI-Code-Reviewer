import { parse } from "@babel/parser";
import traverseModule from "@babel/traverse";
import { Linter } from "eslint";
import { getLlmSuggestions } from "./llmReview.js";

const LOOP_TYPES = new Set(["ForStatement", "ForInStatement", "ForOfStatement", "WhileStatement", "DoWhileStatement"]);
const traverse = traverseModule.default || traverseModule;

function parserPlugins(language) {
  if (language === "typescript") {
    return ["typescript", "jsx"];
  }
  return ["jsx"];
}

function parseAst(code, language) {
  try {
    return parse(code, {
      sourceType: "unambiguous",
      plugins: parserPlugins(language),
      errorRecovery: true,
    });
  } catch {
    return null;
  }
}

function runLint(code) {
  const linter = new Linter();
  const config = {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "no-eval": "error",
      "no-unreachable": "warn",
    },
  };

  const messages = linter.verify(code, config);
  const lintIssues = messages.map((item) => `L${item.line}: ${item.message}`);
  return { lintIssues, lintCount: messages.length };
}

function analyzeAstPatterns(ast) {
  if (!ast) {
    return {
      maxLoopDepth: 0,
      largeFunctions: [],
      duplicateLines: [],
      recursionFound: false,
    };
  }

  let loopDepth = 0;
  let maxLoopDepth = 0;
  let recursionFound = false;
  const largeFunctions = [];
  const recursiveCandidates = [];

  traverse(ast, {
    enter(path) {
      if (LOOP_TYPES.has(path.node.type)) {
        loopDepth += 1;
        maxLoopDepth = Math.max(maxLoopDepth, loopDepth);
      }

      if ((path.isFunctionDeclaration() || path.isFunctionExpression() || path.isArrowFunctionExpression()) && path.node.loc) {
        const size = path.node.loc.end.line - path.node.loc.start.line + 1;
        const name = path.node.id?.name || path.parentPath?.node?.id?.name || "anonymous";
        if (size > 150) {
          largeFunctions.push(`${name}() is ${size} lines (target < 150).`);
        }
        if (name !== "anonymous") {
          recursiveCandidates.push({ name, path });
        }
      }
    },
    exit(path) {
      if (LOOP_TYPES.has(path.node.type)) {
        loopDepth -= 1;
      }
    },
  });

  for (const candidate of recursiveCandidates) {
    let foundSelfCall = false;
    candidate.path.traverse({
      CallExpression(innerPath) {
        if (innerPath.node.callee?.type === "Identifier" && innerPath.node.callee.name === candidate.name) {
          foundSelfCall = true;
        }
      },
    });
    if (foundSelfCall) {
      recursionFound = true;
      break;
    }
  }

  return {
    maxLoopDepth,
    largeFunctions,
    duplicateLines: [],
    recursionFound,
  };
}

function detectDuplicateLines(code) {
  const counts = new Map();
  const lines = code
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 32);

  for (const line of lines) {
    counts.set(line, (counts.get(line) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .slice(0, 3)
    .map(([line, count]) => `Repeated ${count} times: ${line.slice(0, 70)}...`);
}

function detectSecurityWarnings(code) {
  const patterns = [
    { regex: /\beval\s*\(/, message: "Use of eval() detected." },
    { regex: /(SELECT|INSERT|UPDATE|DELETE).*\+.*(req|input|param|body)/i, message: "Potential SQL injection via string concatenation." },
    { regex: /(api[_-]?key|secret|token|password)\s*[:=]\s*['"][^'"]+['"]/i, message: "Hardcoded secret-like value detected." },
    { regex: /\b(fs\.(writeFile|appendFile|writeFileSync)\s*\()/, message: "Unsafe file write path should be validated." },
  ];

  return patterns.filter((item) => item.regex.test(code)).map((item) => item.message);
}

function estimateComplexity(maxLoopDepth, recursionFound) {
  if (recursionFound && maxLoopDepth >= 2) {
    return { timeComplexity: "O(n^2)", label: "High", reason: "Nested loops and recursion both detected." };
  }
  if (maxLoopDepth >= 3) {
    return { timeComplexity: "O(n^3)", label: "Very High", reason: "Three or more nested loops detected." };
  }
  if (maxLoopDepth === 2) {
    return { timeComplexity: "O(n^2)", label: "Medium", reason: "Nested loops detected." };
  }
  if (maxLoopDepth === 1 || recursionFound) {
    return { timeComplexity: "O(n)", label: "Low", reason: "Single loop or linear recursion detected." };
  }
  return { timeComplexity: "O(1)", label: "Low", reason: "No iterative complexity hotspots detected." };
}

function computeQualityScore({ lintCount, securityCount, maxLoopDepth, largeFunctionsCount, duplicateCount }) {
  const lintScore = Math.max(0, 100 - lintCount * 6);
  const securityScore = Math.max(0, 100 - securityCount * 18);
  const complexityScore = Math.max(0, 100 - Math.max(0, maxLoopDepth - 1) * 15);
  const readabilityScore = Math.max(0, 100 - largeFunctionsCount * 12 - duplicateCount * 8);

  const qualityScore = Math.round((lintScore + securityScore + complexityScore + readabilityScore) / 4);
  return { qualityScore, lintScore, securityScore, complexityScore, readabilityScore };
}

function buildRefactorCodeExamples(code, language) {
  const languageHint = language === "python" ? "#" : "//";
  const truncated = code.split("\n").slice(0, 10).join("\n");

  return [
    {
      title: "Function decomposition",
      code: `${languageHint} Split complex logic into small helpers\nfunction validateInput(input) {\n  if (!input) throw new Error("input required");\n}\n\nfunction transformData(items) {\n  return items.map((item) => item.trim());\n}\n\nfunction process(items) {\n  validateInput(items);\n  return transformData(items);\n}`,
    },
    {
      title: "Naming and dead code cleanup",
      code: `${languageHint} Before: unclear names and unused variables\n${languageHint} const x = getData(); const temp = 123;\n${languageHint} After:\nconst users = getData();\nreturn users.filter((user) => user.isActive);`,
    },
    {
      title: "Input validation and sanitization",
      code: `${languageHint} Validate and sanitize external input\nfunction safeQuery(input) {\n  const value = String(input ?? "").trim();\n  if (!value) throw new Error("Invalid input");\n  return value.replace(/[^a-zA-Z0-9_\\- ]/g, "");\n}`,
    },
    {
      title: "Context from your code",
      code: `${languageHint} Snippet analyzed\n${truncated || `${languageHint} No code snippet available`}`,
    },
  ];
}

export async function analyzeSourceCode(code, language = "javascript") {
  const ast = parseAst(code, language);
  const { lintIssues, lintCount } = runLint(code);
  const astPatterns = analyzeAstPatterns(ast);
  const duplicateLines = detectDuplicateLines(code);
  const securityWarnings = detectSecurityWarnings(code);
  const complexity = estimateComplexity(astPatterns.maxLoopDepth, astPatterns.recursionFound);

  const badPatterns = [
    ...lintIssues.filter((item) => item.toLowerCase().includes("unused")),
    ...astPatterns.largeFunctions,
    ...duplicateLines,
  ];

  if (astPatterns.maxLoopDepth >= 2) {
    badPatterns.push("Nested loops detected; this may cause O(n^2) or worse performance.");
  }

  const refactorSuggestions = await getLlmSuggestions({
    codeSnippet: code,
    lintIssues,
    securityWarnings,
  });

  const scoring = computeQualityScore({
    lintCount,
    securityCount: securityWarnings.length,
    maxLoopDepth: astPatterns.maxLoopDepth,
    largeFunctionsCount: astPatterns.largeFunctions.length,
    duplicateCount: duplicateLines.length,
  });

  return {
    badPatterns,
    securityWarnings,
    complexity,
    refactorSuggestions,
    refactorCodeExamples: buildRefactorCodeExamples(code, language),
    qualityScore: scoring.qualityScore,
    scoreBreakdown: {
      lintScore: scoring.lintScore,
      securityScore: scoring.securityScore,
      complexityScore: scoring.complexityScore,
      readabilityScore: scoring.readabilityScore,
    },
  };
}
