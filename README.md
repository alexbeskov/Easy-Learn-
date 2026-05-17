# Easy Learn

Easy Learn is an MVP learning platform that turns a list of YouTube and article links into a structured mini-course. The repo is organized as a small monorepo with a React frontend and a FastAPI backend.

## Structure

- `frontend/` React + Vite interface with a premium landing section, course generator, result viewer, and local history.
- `backend/` FastAPI API that validates links, extracts source context, calls `Polza AI`, and falls back to a local generator when needed.

## Local run

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://127.0.0.1:8000` by default. Override with `VITE_API_BASE_URL`.

## Environment

Copy the example files and fill in the values you have:

- `backend/.env.example`
- `frontend/.env.example`

### Backend variables

- `POLZA_API_URL` URL of the Polza AI endpoint.
- `POLZA_API_KEY` API key for Polza AI.
- `POLZA_MODEL` Optional model name sent to Polza AI.
- `ALLOWED_ORIGINS` Comma-separated list of frontend origins.
- `REQUEST_TIMEOUT_SECONDS` Timeout for external requests.

### Frontend variables

- `VITE_API_BASE_URL` Base URL for the backend API.

## API

### `GET /api/health`

Returns service health and whether Polza AI is configured.

### `POST /api/course/generate`

Request body:

```json
{
  "topic": "Prompt engineering basics",
  "urls": [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://example.com/article"
  ]
}
```

Response body:

```json
{
  "title": "Prompt engineering basics",
  "summary": "Short intro...",
  "modules": [
    {
      "title": "Module title",
      "goal": "Learning goal",
      "content": "Main explanation",
      "key_points": ["Point 1", "Point 2"]
    }
  ],
  "takeaways": ["Takeaway"],
  "next_steps": ["Next step"],
  "sources": [
    {
      "url": "https://example.com/article",
      "kind": "article",
      "title": "Page title",
      "status": "processed",
      "excerpt": "Short excerpt"
    }
  ],
  "warnings": []
}
```

## Deployment notes

- Frontend: Vercel, Netlify, or any static hosting for Vite.
- Backend: Render, Railway, Fly.io, or another Python host for FastAPI.
- Set production CORS origins in `ALLOWED_ORIGINS`.
- Keep `POLZA_API_KEY` server-side only.

## Current MVP behavior

- Supports YouTube URLs and regular web article URLs.
- Stores the latest generated courses in browser `localStorage`.
- If Polza AI is missing or fails, the backend returns a graceful locally generated mini-course instead of a hard error.
