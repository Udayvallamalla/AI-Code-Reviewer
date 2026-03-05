function Navbar({ userEmail, onLogout }) {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <h1>AI Code Reviewer</h1>
        <p>Static + LLM powered code insights</p>
      </div>

      <div className="navbar-actions">
        <span className="user-chip">{userEmail}</span>
        <button className="secondary-btn" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
