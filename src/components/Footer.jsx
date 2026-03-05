function Footer() {
  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <section>
          <h4>Disclosures</h4>
          <div className="footer-pill-row">
            <button className="footer-pill" type="button" onClick={() => scrollTo("results-section")}>
              Insights != outcomes
            </button>
            <button className="footer-pill" type="button" onClick={() => scrollTo("upload-section")}>
              Guidance != certification
            </button>
            <button className="footer-pill" type="button" onClick={() => scrollTo("github-section")}>
              Review != regulatory approval
            </button>
          </div>
          <p>
            This AI Code Reviewer provides engineering evidence and suggestions. It does not certify, approve, score, or
            determine legal compliance outcomes.
          </p>
          <p>If examples are shown, they are illustrative unless explicitly stated otherwise.</p>
        </section>

        <section>
          <h4>Review Core</h4>
          <ul>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("results-section")}>
                Static Analysis
              </button>
            </li>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("results-section")}>
                Security Pattern Detection
              </button>
            </li>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("results-section")}>
                Complexity Estimation
              </button>
            </li>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("results-section")}>
                Refactor Suggestions
              </button>
            </li>
          </ul>
          <p>Canonical boundaries for code quality, performance, and security posture.</p>
        </section>

        <section>
          <h4>Explore</h4>
          <ul>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("dashboard-top")}>
                Dashboard
              </button>
            </li>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("upload-section")}>
                Upload Code
              </button>
            </li>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("github-section")}>
                GitHub Repository Scan
              </button>
            </li>
            <li>
              <button className="footer-link-btn" type="button" onClick={() => scrollTo("results-section")}>
                Results & Suggestions
              </button>
            </li>
            <li>
              <a className="footer-link-btn" href="mailto:uday.vallamalla@example.com">
                Contact
              </a>
            </li>
          </ul>
          <p>Start with code input, then review issues, risks, complexity, and actionable refactors.</p>
        </section>
      </div>

      <div className="site-footer-bottom">
        <p>© 2026 Uday Vallamalla. All rights reserved.</p>
        <p>AI-powered engineering review workflow.</p>
      </div>
    </footer>
  );
}

export default Footer;
