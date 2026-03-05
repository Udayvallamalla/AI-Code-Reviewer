import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CodeUploader from "../components/CodeUploader";
import GithubRepoInput from "../components/GithubRepoInput";
import AnalysisResult from "../components/AnalysisResult";
import Footer from "../components/Footer";
import { supabase } from "../services/supabaseClient";
import { analyzeCode, analyzeGithub } from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [repoUrl, setRepoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email || "Developer");
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleAnalyzeCode = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await analyzeCode(code, language);
      setResult(response.analysis);
    } catch (analyzeError) {
      setError(analyzeError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeRepo = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await analyzeGithub(repoUrl);
      setResult(response.analysis);
    } catch (analyzeError) {
      setError(analyzeError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-layout">
      <div id="dashboard-top" />
      <Navbar userEmail={userEmail} onLogout={handleLogout} />

      <div className="dashboard-content">
        <CodeUploader
          sectionId="upload-section"
          code={code}
          language={language}
          loading={loading}
          onCodeChange={setCode}
          onLanguageChange={setLanguage}
          onAnalyze={handleAnalyzeCode}
        />

        <GithubRepoInput
          sectionId="github-section"
          repoUrl={repoUrl}
          onRepoUrlChange={setRepoUrl}
          onAnalyze={handleAnalyzeRepo}
          loading={loading}
        />

        <AnalysisResult sectionId="results-section" result={result} loading={loading} error={error} />
      </div>

      <Footer />
    </main>
  );
}

export default Dashboard;
