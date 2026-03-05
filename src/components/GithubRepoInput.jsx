function GithubRepoInput({ repoUrl, onRepoUrlChange, onAnalyze, loading, sectionId }) {
  return (
    <section className="panel" id={sectionId}>
      <h3>GitHub Repository Analysis</h3>
      <p className="panel-subtitle">Paste a public GitHub repository URL to scan repository files.</p>

      <div className="panel-row">
        <input
          className="text-input"
          type="url"
          value={repoUrl}
          onChange={(event) => onRepoUrlChange(event.target.value)}
          placeholder="https://github.com/owner/repo"
        />
        <button className="primary-btn" type="button" onClick={onAnalyze} disabled={loading || !repoUrl.trim()}>
          {loading ? "Analyzing..." : "Analyze Repository"}
        </button>
      </div>
    </section>
  );
}

export default GithubRepoInput;
