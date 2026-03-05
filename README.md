# AI Code Reviewer

AI Code Reviewer is a full-stack web app built with React + Vite (frontend), Supabase Auth, and Node.js + Express (backend).

After login/signup, users can:
- Upload source code (`.js`, `.ts`, `.py`, `.java`)
- Analyze public GitHub repositories
- View code quality score, bad patterns, security warnings, complexity insights, and refactor suggestions
- Switch suggested refactor code examples between multiple languages

Project customized for **Uday Vallamalla**.

## Tech Stack

- Frontend: React, Vite, React Router, Supabase JS
- Backend: Node.js, Express, Babel Parser/Traverse, ESLint, OpenAI API (optional), GitHub API
- Auth: Supabase email/password authentication

## Folder Structure

```text
resume_scanner/
  src/
    components/
      AnalysisResult.jsx
      CodeUploader.jsx
      Footer.jsx
      GithubRepoInput.jsx
      Navbar.jsx
    pages/
      Dashboard.jsx
      Login.jsx
      Signup.jsx
    services/
      api.js
      supabaseClient.js
    App.jsx
    main.jsx
    index.css
  server/
    analysis/
      analyzeEngine.js
      githubReader.js
      llmReview.js
    index.js
    .env.example
  .env
  package.json
```

## Environment Variables

### Frontend (`.env`)

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:4000
```

### Backend (`server/.env`)

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
OPENAI_API_KEY=your_openai_api_key_optional
OPENAI_MODEL=gpt-4o-mini
GITHUB_TOKEN=your_github_token_optional
```

Notes:
- `OPENAI_API_KEY` is optional. If missing, backend uses fallback static suggestions.
- `GITHUB_TOKEN` is optional but helps avoid GitHub rate limits.

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure env files:
- root `.env` (frontend)
- `server/.env` (backend)

3. Start backend

```bash
npm run server
```

4. Start frontend

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - start Vite frontend
- `npm run server` - start Express backend
- `npm run lint` - run ESLint
- `npm run build` - production build
- `npm run preview` - preview production build

## API Endpoints

- `GET /api/health`
- `POST /analyze/code`
  - body: `{ "code": "...", "language": "javascript" }`
- `POST /analyze/github`
  - body: `{ "repoUrl": "https://github.com/owner/repo" }`

## Authentication Flow

- `/login` -> Supabase sign in
- `/signup` -> Supabase sign up
- `/dashboard` -> protected route (requires active session)

## Analysis Output

Typical response includes:
- `qualityScore`
- `badPatterns`
- `securityWarnings`
- `complexity` (`timeComplexity`, `label`, `reason`)
- `refactorSuggestions`
- `refactorCodeExamples`

## UI Features

- Modern dashboard design
- Custom styled file picker
- Refactor code blocks in light green
- Footer navigation and project branding

## Troubleshooting

- If API returns non-JSON: confirm backend is running on `http://localhost:4000`
- If GitHub analysis fails: check repo URL and optional `GITHUB_TOKEN`
- If auth fails: verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

## License

Private project. All rights reserved.
