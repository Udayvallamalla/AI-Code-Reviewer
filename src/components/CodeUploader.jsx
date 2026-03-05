import { useState } from "react";

const EXTENSION_LANGUAGE = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  java: "java",
};

function detectLanguage(filename = "") {
  const extension = filename.split(".").pop()?.toLowerCase();
  return EXTENSION_LANGUAGE[extension] || "javascript";
}

function CodeUploader({ code, language, onCodeChange, onLanguageChange, onAnalyze, loading, sectionId }) {
  const [fileName, setFileName] = useState("");

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const nextLanguage = detectLanguage(file.name);

    setFileName(file.name);
    onCodeChange(text);
    onLanguageChange(nextLanguage);
  };

  return (
    <section className="panel" id={sectionId}>
      <h3>Upload Code</h3>
      <p className="panel-subtitle">Paste code or upload `.js`, `.py`, `.ts`, `.java` files.</p>

      <textarea
        className="code-textarea"
        value={code}
        onChange={(event) => onCodeChange(event.target.value)}
        placeholder="Paste your code here..."
      />

      <div className="panel-row">
        <div className="file-upload-wrap">
          <label className="file-upload-btn" htmlFor="code-file">
            Choose File
          </label>
          <input id="code-file" className="file-input-hidden" type="file" accept=".js,.py,.ts,.java" onChange={handleFile} />
          <span className="file-upload-name">{fileName || "No file chosen"}</span>
        </div>
        <select value={language} onChange={(event) => onLanguageChange(event.target.value)}>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
        </select>
        <button className="primary-btn" type="button" onClick={onAnalyze} disabled={loading || !code.trim()}>
          {loading ? "Analyzing..." : "Analyze Code"}
        </button>
      </div>

      {fileName && <p className="hint">Loaded file: {fileName}</p>}
    </section>
  );
}

export default CodeUploader;
