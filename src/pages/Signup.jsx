import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };

    syncSession();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const { error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    navigate("/dashboard");
  };

  return (
    <main className="auth-layout">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <p className="panel-subtitle">Create your account to run AI code reviews.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          className="text-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          className="text-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={8}
        />

        {error && <p className="error-text">{error}</p>}

        <button className="primary-btn wide-btn" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="hint">
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}

export default Signup;
