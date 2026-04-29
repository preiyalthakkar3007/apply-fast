import { jsPDF } from 'jspdf'

const PAGE_W = 215.9
const PAGE_H = 279.4
const PT_TO_MM = 0.352778

const BASE_EXPERIENCE = [
  {
    key: 'Infoseeking Lab',
    company: 'Infoseeking Lab (Prof. Chirag Shah), University of Washington',
    location: 'Seattle, WA',
    role: 'Undergraduate Research Assistant',
    dates: 'Jan 2026 – Present',
    bullets: [
      'Proactively identified an underexplored gap across HCI, cognitive science, and ML evaluation literature — that benchmark failures disproportionately affect non-Western and underrepresented users — and formulated this as the central research question driving workshop-scale publications on equitable AI systems.',
    ],
  },
  {
    key: 'PricewaterhouseCoopers',
    company: 'PricewaterhouseCoopers Services LLP',
    location: 'Mumbai, IN',
    role: 'Financial Services Technology Advisory Intern',
    dates: 'Jul 2025 – Aug 2025',
    bullets: [
      'Diagnosed that financial documentation bottlenecks stemmed from structural information gaps, not just manual effort — then designed an AI-driven BRD generation system (Python, TF-IDF, LLaMA) to address the root cause, significantly reducing cognitive load for analysts',
      'Streamlined document chunking, embedding, and review workflows, improving processing efficiency by ~60%',
      'Partnered with FS Tech engineers to design secure, scalable architecture, ensuring the solution safely and effectively met the needs of cross-functional teams',
    ],
  },
  {
    key: 'Monedo',
    company: 'Monedo Financial Services (Fintech)',
    location: 'Mumbai, IN',
    role: 'Data Science Intern',
    dates: 'Jun 2024 – Aug 2024',
    bullets: [
      'Developed ML models for credit risk assessment, improving prediction accuracy by 30% to help facilitate fairer, more inclusive lending decisions',
      'Analyzed large financial datasets (Python, Pandas, scikit-learn) to uncover hidden risk indicators, linking complex data points to broader financial behaviors and trends',
      'Collaborated with senior data scientists to translate analytical insights into a functional prototype, successfully bridging theoretical models with real-world financial applications',
    ],
  },
]

const TECHNICAL_PROJECTS = [
  'NLP and AI Systems: Built a Text-to-SQL Natural Language Interface translating plain English to executable SQL using Python and NLP; developed FinDocGPT, a RAG-based document intelligence tool for querying dense financial text; built a Skill Gap Analyzer mapping user profiles against job descriptions to surface upskilling recommendations',
  'Finance and Mobile: Built a Voice Finance Intelligence App in Flutter for Android enabling natural language personal finance queries; deployed Habit Cost Calculator live on Vercel and Render; developed a Smart Visual Planner for goal tracking with calendar integration and progress visualization',
  'Productivity and Automation: Built a Distributed Task Queue system in Python for async job processing across worker nodes; developed TabMinder for browser tab management with usage analytics; built a Meeting Transcript Analyzer to extract action items and decisions from raw meeting text; developed Subscription Radar for tracking recurring expenses with automated alerting',
  'Full Stack and APIs: Built a Job Application Tracker as a Chrome Extension with React, Flask, Supabase, and Claude API integration; developed a UW Smart Registration Assistant Chrome Extension integrating DawgPath and RateMyProfessor data for optimized course selection; built a GitHub Activity Visualizer using React and GitHub API with Claude API integration for AI-generated contribution summaries',
  'Developer Tools: Built Mini Git, a version control system in Python using SHA-based hashing, object storage, and file I/O to replicate core Git functionality including commits and diffs; built a File Deduplication Tool using hashing and binary comparison for efficient storage management',
  'Data Pipelines and Dashboards: Built a Healthcare Cost Transparency Dashboard in React with a Python data pipeline on CMS public datasets to surface provider pricing disparities; developed a Mental Health Trends Analyzer using Streamlit and CDC data to identify population-level behavioral health patterns',
]

const ASSOCIATIONS = [
  'Contributed to a large-scale financial research study on SaaS valuation in the AI era, co-authored by a strategy executive and a Michigan Ross professor, leading data collection and analysis that formed the foundation of published findings',
  'Member, University of Washington Technical & Analytics Clubs: Active in Applied Analytics, Applied Math, AI Alignment, and CSE Entrepreneurship clubs',
  'Led finance education outreach and community service initiatives, organizing workshops for 200+ students, coordinating COVID-19 relief, launching a Book Bank project, and raising $5,000; recognized with the "Outstanding Volunteer Initiative" award',
]

const SKILLS = [
  { label: 'Language & Tools', value: 'Python, Java, JavaScript, React, Flask, SQL, Dart/Flutter, Supabase, Git, Chrome Extensions API, GitHub API, Streamlit, Pandas, scikit-learn, Microsoft Excel, Canva, R Studio' },
  { label: 'Technical Skills', value: 'Data Structures and Algorithms, Machine Learning Pipelines, NLP and Text Processing, Retrieval-Augmented Generation, REST APIs, Statistical Modeling, Full Stack Development, Data Visualization, File I/O and Systems Programming, Analytical Skills' },
  { label: 'Interests', value: 'Classical Dance, Cooking & Nutrition, Music; Information Equity & Algorithmic Fairness' },
]

// Settings factory — all measurements in mm
function makeSettings(bodyPt, headerPt, truncateProjects) {
  const margin = 12.7 // 0.5 inch
  const lf = 1.3      // leading factor (tighter than default ~1.38)
  return {
    bodyPt,
    headerPt,
    margin,
    contentW: PAGE_W - 2 * margin,
    lh: (pt) => pt * PT_TO_MM * lf,
    gapBullet: 4 * PT_TO_MM,   // 4pt between bullet items
    gapSection: 6 * PT_TO_MM,  // 6pt before each section header
    gapEntry: 4 * PT_TO_MM,    // 4pt between experience entries
    truncateProjects,
  }
}

// Dual-mode renderer: draw=false → pure measurement, draw=true → renders to doc.
// Returns the final y position (y - s.margin = total content height).
function renderAll(doc, experience, s, draw) {
  let y = s.margin

  // Split text using jsPDF (always OK; doesn't render).
  // Font must be set first so word-wrap uses correct metrics.
  const split = (text, maxW, pt, style = 'normal') => {
    doc.setFontSize(pt)
    doc.setFont('helvetica', style)
    return doc.splitTextToSize(text, maxW)
  }

  // Advance y by h, and optionally render via fn.
  const block = (h, fn) => {
    if (draw) fn()
    y += h
  }

  // Single-line text (centered or left).
  const line = (text, x, pt, style, color, align) => {
    const h = s.lh(pt)
    block(h, () => {
      doc.setFontSize(pt)
      doc.setFont('helvetica', style)
      doc.setTextColor(...color)
      doc.text(text, x, y, align ? { align } : {})
    })
  }

  // Wrapped text block.
  const wrapped = (text, x, pt, style, maxW = s.contentW) => {
    const lines = split(text, maxW, pt, style)
    const h = lines.length * s.lh(pt)
    block(h, () => {
      doc.setFontSize(pt)
      doc.setFont('helvetica', style)
      doc.setTextColor(0, 0, 0)
      doc.text(lines, x, y)
    })
  }

  // Company row: bold name left, normal location right.
  const companyRow = (left, right) => {
    const h = s.lh(s.bodyPt)
    block(h, () => {
      doc.setFontSize(s.bodyPt)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(left, s.margin, y)
      doc.setFont('helvetica', 'normal')
      doc.text(right, PAGE_W - s.margin, y, { align: 'right' })
    })
  }

  // Section header: bold all-caps + full-width rule.
  const sectionHeader = (title) => {
    y += s.gapSection
    const textH = s.lh(s.headerPt)
    const ruleY = textH * 0.6 // rule sits just below text baseline
    block(textH + 1.8, () => {
      doc.setFontSize(s.headerPt)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(title, s.margin, y)
      doc.setLineWidth(0.2)
      doc.line(s.margin, y + ruleY, PAGE_W - s.margin, y + ruleY)
    })
  }

  // Bullet item, optionally truncated to 1 line.
  const bulletItem = (text, truncate = false) => {
    const indent = 3.5
    const maxW = s.contentW - indent
    let lines = split(`• ${text}`, maxW, s.bodyPt, 'normal')
    if (truncate && lines.length > 1) {
      lines = [lines[0].trimEnd() + '...']
    }
    const h = lines.length * s.lh(s.bodyPt)
    block(h, () => {
      doc.setFontSize(s.bodyPt)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(0, 0, 0)
      doc.text(lines, s.margin + indent, y)
    })
    y += s.gapBullet // inter-bullet gap (always applied)
  }

  // ── Header ──────────────────────────────────────────────────────────────────
  line('PREIYAL THAKKAR', PAGE_W / 2, 14, 'bold', [0, 0, 0], 'center')
  y += 0.5
  line(
    'preiyalt@uw.edu  |  LinkedIn  |  Github  |  +1 425 463 7697  |  Seattle, WA',
    PAGE_W / 2, s.bodyPt - 0.5, 'normal', [80, 80, 80], 'center'
  )
  y += 1.5

  // ── Education ───────────────────────────────────────────────────────────────
  sectionHeader('EDUCATION')
  companyRow('University of Washington', 'Seattle, WA')
  wrapped('Bachelor of Science, Informatics: Data Science | Expected Jun 2028', s.margin, s.bodyPt, 'normal')
  wrapped('Cumulative GPA: 3.59/4.00', s.margin, s.bodyPt, 'normal')

  // ── Experience ──────────────────────────────────────────────────────────────
  sectionHeader('EXPERIENCE')
  for (const exp of experience) {
    companyRow(exp.company, exp.location)
    const roleText = `${exp.role}  |  ${exp.dates}`
    line(roleText, s.margin, s.bodyPt, 'italic', [0, 0, 0])
    for (const b of exp.bullets) {
      bulletItem(b, false)
    }
    y += s.gapEntry
  }

  // ── Technical Projects ──────────────────────────────────────────────────────
  sectionHeader('TECHNICAL PROJECTS')
  for (const proj of TECHNICAL_PROJECTS) {
    bulletItem(proj, s.truncateProjects)
  }

  // ── Associations ────────────────────────────────────────────────────────────
  sectionHeader('ASSOCIATIONS & OTHER PROJECTS')
  for (const assoc of ASSOCIATIONS) {
    bulletItem(assoc, false)
  }

  // ── Skills & Interests ──────────────────────────────────────────────────────
  sectionHeader('SKILLS & INTERESTS')
  for (const skill of SKILLS) {
    const fullText = `${skill.label}: ${skill.value}`
    const lines = split(fullText, s.contentW, s.bodyPt, 'normal')
    const h = lines.length * s.lh(s.bodyPt)
    block(h, () => {
      doc.setFontSize(s.bodyPt)
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'bold')
      doc.text(lines[0], s.margin, y)
      if (lines.length > 1) {
        doc.setFont('helvetica', 'normal')
        for (let i = 1; i < lines.length; i++) {
          doc.text(lines[i], s.margin, y + i * s.lh(s.bodyPt))
        }
      }
    })
    y += h + s.gapBullet
  }

  return y
}

// ── Parse / display helpers (used by App.jsx) ─────────────────────────────────

function parseBulletsInternal(bulletsText) {
  if (!bulletsText) return []
  return bulletsText
    .split('\n')
    .map((line) => {
      const m = line.match(/^\[(.+?)\]\s*(.+?)\s*→\s*(.+)$/)
      return m ? { section: m[1].trim(), original: m[2].trim(), rewritten: m[3].trim() } : null
    })
    .filter(Boolean)
}

function applyBullets(exp, tailored) {
  const relevant = tailored.filter(
    (t) =>
      exp.key.toLowerCase().includes(t.section.toLowerCase().split(' ')[0]) ||
      t.section.toLowerCase().includes(exp.key.toLowerCase().split(' ')[0])
  )
  if (!relevant.length) return exp.bullets
  const bullets = [...exp.bullets]
  for (const t of relevant) {
    const key = t.original.substring(0, 35).toLowerCase()
    const idx = bullets.findIndex((b) => b.substring(0, 35).toLowerCase().startsWith(key.substring(0, 20)))
    if (idx >= 0) {
      bullets[idx] = t.rewritten
    } else {
      bullets.push(t.rewritten)
    }
  }
  return bullets
}

export function parseTailoredBullets(bulletsText) {
  return parseBulletsInternal(bulletsText)
}

export function getDisplayBullets(bulletsText) {
  if (!bulletsText) return ''
  const parsed = parseBulletsInternal(bulletsText)
  if (!parsed.length) return bulletsText
  return parsed.map((b) => `• ${b.rewritten}`).join('\n')
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateResumePDF(bulletsText, roleTitle, companyName) {
  const tailored = parseBulletsInternal(bulletsText)
  const experience = BASE_EXPERIENCE.map((exp) => ({
    ...exp,
    bullets: applyBullets(exp, tailored),
  }))

  const doc = new jsPDF({ unit: 'mm', format: 'letter' })
  const bottomLimit = PAGE_H - 12.7 // bottom edge of 0.5-inch bottom margin

  // Three candidate settings in priority order.
  // renderAll with draw=false is a pure measurement pass — no output produced.
  const candidates = [
    makeSettings(9, 9.5, false),    // pass 1: 9pt body, tighter spacing
    makeSettings(8.5, 9, false),    // pass 2: 8.5pt body
    makeSettings(8.5, 9, true),     // pass 3: 8.5pt + truncate projects to 1 line each
  ]

  const chosen = candidates.find((s) => renderAll(doc, experience, s, false) <= bottomLimit)
    ?? candidates[candidates.length - 1]

  // Final render with the chosen settings.
  renderAll(doc, experience, chosen, true)

  const r = (roleTitle || 'Resume').replace(/[^a-zA-Z0-9]/g, '')
  const c = (companyName || '').replace(/[^a-zA-Z0-9]/g, '')
  doc.save(`Preiyal_Thakkar_${r}${c ? '_' + c : ''}.pdf`)
}
