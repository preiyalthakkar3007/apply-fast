# Apply Fast — Flask Backend

Generates a tailored, single-page PDF resume using reportlab. Resume content is hardcoded in `app.py`; the endpoint accepts bullet replacements from the frontend and renders the PDF in memory — no external APIs or credentials required.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Running locally

```bash
python app.py
```

Server starts on `http://localhost:5001`.

### Test the endpoint

```bash
curl -X POST http://localhost:5001/generate-resume \
  -H "Content-Type: application/json" \
  -d '{
    "bullets": "[PricewaterhouseCoopers] Diagnosed that financial → New tailored bullet here",
    "role_title": "SWE Intern",
    "company_name": "Google"
  }' \
  --output resume.pdf
```

## API

### `POST /generate-resume`

**Request body (JSON):**

| Field | Type | Description |
|---|---|---|
| `bullets` | string | Tailored bullets from Claude in `[Section] Original → Rewritten` format |
| `role_title` | string | Job title (used in filename) |
| `company_name` | string | Company name (used in filename) |

**Response:** `application/pdf` download named `Preiyal_Thakkar_<RoleTitle>_<CompanyName>.pdf`

**Bullet matching:** Each `[Section]` tag is matched against the hardcoded experience entry keys (`Infoseeking Lab`, `PricewaterhouseCoopers`, `Monedo`) using a first-word fuzzy match. The `Original` text is matched against the first 20 characters of each hardcoded bullet (case-insensitive). Unmatched rewrites are appended as new bullets.

**Font scaling:** The renderer makes a measurement pass at each scale in `[1.0, 0.95, 0.90, 0.85, 0.80, 0.75]` and picks the largest that keeps content within the 0.5-inch bottom margin.

## Deploying to Render

1. Create a **Web Service** on [render.com](https://render.com), connected to this repo.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `pip install -r requirements.txt`.
4. Set **Start Command** to `gunicorn app:app` (add `gunicorn` to `requirements.txt` first).
5. No secret files or environment variables needed.
