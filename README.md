# Apply Fast ⚡

### Paste a job description. Get a tailored resume, cover letter, and outreach email in 30 seconds.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Claude API](https://img.shields.io/badge/Claude_API-D97757?style=for-the-badge&logo=anthropic&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

---

## The Problem

Applying to 200 jobs a month sounds impossible when every application takes 20–30 minutes to tailor. Most people either send generic resumes (low response rate) or spend hours per application (unsustainable).

Apply Fast solves this by automating the tailoring — not the applying.

---

## What It Does

- **Paste any job description** + select a role type
- **Claude API analyzes the JD** and rewrites your resume bullets to match — without fabricating experience
- **Generates a cover letter** with a specific hook for that company
- **Drafts a cold outreach email** to the recruiter
- **Downloads a perfectly formatted single-page PDF resume** with the tailored bullets already swapped in
- **Logs every application** with status tracking and CSV export

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Flask + ReportLab (PDF generation) |
| AI | Claude API (`claude-sonnet-4-20250514`) |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Live Demo

[apply-fast-8hj6.vercel.app](https://apply-fast-8hj6.vercel.app)

---

## Local Setup

### Frontend
```bash
cd apply-fast
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### API Key

Click the gear icon in the top right and paste your Anthropic API key. It's stored in `localStorage` — never sent anywhere except directly to Anthropic.

---

## The Wow Feature

The PDF resume is generated server-side with ReportLab — not a janky jsPDF export. Bullets are **surgically swapped in** based on the JD, not rewritten from scratch. The base resume stays intact; only the relevant bullets change to mirror the company's language.

Same resume. Smarter bullets. Every time.
