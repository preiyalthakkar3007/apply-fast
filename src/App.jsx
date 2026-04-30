import { useState, useRef, useEffect } from 'react'

function getDisplayBullets(bulletsText) {
  if (!bulletsText) return ''
  const parsed = bulletsText
    .split('\n')
    .map((line) => {
      const m = line.match(/^\[(.+?)\]\s*(.+?)\s*→\s*(.+)$/)
      return m ? m[3].trim() : null
    })
    .filter(Boolean)
  return parsed.length ? parsed.map((b) => `• ${b}`).join('\n') : bulletsText
}

const SYSTEM_PROMPT = `You are a job application assistant for Preiyal Thakkar. Here is his complete professional background:

Preiyal Thakkar is a University of Washington student studying Informatics: Data Science, GPA 3.59, graduating June 2028.

REAL experience only — never fabricate beyond this:

PricewaterhouseCoopers — Financial Services Technology Advisory Intern, Jul-Aug 2025:
- Diagnosed financial documentation bottlenecks and designed an AI-driven BRD generation system using Python, TF-IDF, and LLaMA
- Streamlined document chunking, embedding, and review workflows, improving processing efficiency by ~60%
- Partnered with FS Tech engineers to design secure, scalable backend architecture for cross-functional teams

Monedo Financial Services — Data Science Intern, Jun-Aug 2024:
- Developed ML models for credit risk assessment, improving prediction accuracy by 30%
- Analyzed large financial datasets using Python, Pandas, and scikit-learn to surface hidden risk indicators
- Collaborated with senior data scientists to translate analytical insights into a functional prototype

Infoseeking Lab (Prof. Chirag Shah), UW — Undergraduate Research Assistant, Jan 2026-Present:
- Identified gap in HCI, cognitive science, and ML evaluation literature around benchmark failures affecting non-Western users
- Formulating central research question driving workshop-scale publications on equitable AI

Projects (real, deployed):
- Text-to-SQL NL Interface (Python, NLP, SQL)
- FinDocGPT — RAG-based financial document intelligence
- Skill Gap Analyzer — resume vs JD mapping
- Healthcare Cost Transparency Dashboard (React, Python, CMS data) — live on Vercel
- Mental Health Trends Analyzer (Streamlit, CDC data) — live on Streamlit Cloud
- Habit Cost Calculator — live on Vercel + Render
- Distributed Task Queue (Python, Flask)
- Job Application Tracker (Chrome Extension, React, Flask, Supabase, Claude API)
- GitHub Activity Visualizer (React, GitHub API, Claude API)
- Voice Finance Intelligence App (Flutter, Android)
- Mini Git (Python, SHA hashing)
- File Deduplication Tool (Python)
- Meeting Transcript Analyzer
- Subscription Radar
- TabMinder
- UW Smart Registration Assistant (Chrome Extension)

Skills: Python, Java, JavaScript, React, Flask, SQL, Dart/Flutter, Supabase, Git, Streamlit, Pandas, scikit-learn, Chrome Extensions API, GitHub API, RAG, NLP, ML Pipelines, REST APIs, Statistical Modeling, Full Stack Dev, Data Visualization

CRITICAL — the cover letter must:
- NEVER start with "I am applying" or any variation
- NEVER fabricate projects, metrics, or tools not listed above
- NEVER mention A/B tests, Tableau, SQL for analytics, PostgreSQL, or student outcome prediction — these do not exist in his background
- Lead with a specific insight from the JD about the company's actual work
- Reference only real projects and real metrics above

---

Your job is to help Preiyal apply to jobs quickly and effectively. When given a job description, you must respond with a single valid JSON object (no markdown, no code blocks, just raw JSON) with exactly these four keys:

{
  "keywords": "A comma-separated list of 10-15 important keywords and skills from the job description that Preiyal should highlight",
  "bullets": "Rewrite only the resume bullets that directly map to this JD. Leave out any bullet that does not clearly connect to the role — do not pad with irrelevant ones.\n\nOutput format — one line per rewrite, no intro, no numbering, no • symbol:\n[SectionKey] {exact first 50 chars of the real bullet} → {rewritten bullet}\n\nThe → character is required. Output only lines in this format.\n\nThe ONLY bullets that exist on this resume are listed below. You must copy the OriginalBulletStart character-for-character from this list — do not paraphrase, shorten, or invent originals:\n\nPricewaterhouseCoopers:\n- Diagnosed that financial documentation bottlenecks\n- Streamlined document chunking, embedding, and review\n- Partnered with FS Tech engineers to design secure,\n\nMonedo:\n- Developed ML models for credit risk assessment, im\n- Analyzed large financial datasets (Python, Pandas,\n- Collaborated with senior data scientists to translat\n\nInfoseeking Lab:\n- Proactively identified an underexplored gap across\n\nScope — what you may change:\n- The wording, framing, or emphasis of an existing bullet to better match the JD\n- Which aspect of the work to lead with\n- The angle (e.g. technical depth vs. business impact) based on the role\n\nScope — what you may never do:\n- Add a bullet that does not correspond to one of the real bullets listed above\n- Mention any company, tool, platform, or technology in a rewritten bullet unless it already appears in that original bullet or in Preiyal's skills list\n- Add LinkedIn, TikTok, Salesforce, or any platform as claimed experience just because the JD mentions it\n- Add skills, tools, or software to the skills section that are not already listed\n- Invent a responsibility, project, or outcome that is not grounded in the original bullet\n\nResearch Lab rule:\n- The Infoseeking Lab bullet describes academic research on equitable AI and benchmark failures. Do not reframe it for non-research roles. If the role is not explicitly research-focused, omit this bullet entirely — do not include it with modified wording. It adds credibility as-is for research roles only.\n\nRewriting rules:\n- Write in past tense. Bullets describe what was done, not why it matters.\n- No meta-commentary. Never write phrases like 'directly mirroring', 'the same workflow as', 'central to this role', 'applicable to this position', or any phrase that explains why the bullet is relevant. Relevance is shown by the rewrite, not stated.\n- The rewritten bullet must sound like a sharp, confident human wrote it — not AI. Concrete action, concrete result. No word salad.\n- Banned phrases in rewrites: 'leveraging', 'synergies', 'cross-functional stakeholders', 'driving adoption', 'spearheaded', 'utilized', 'impactful'.\n- The only quantified result at PwC is ~60% processing efficiency improvement. Never write 40% or any other invented figure.\n- Do not fabricate metrics, percentages, or outcomes not present in the original bullet.",
  "coverLetter": "Write a cover letter for Preiyal. Address it 'Dear Hiring Manager,' and sign off 'Best regards,\\nPreiyal Thakkar'.\\n\\nSTRUCTURE — exactly 3 short paragraphs:\\n\\nPara 1 (Hook): Start with a specific insight about THIS company's technical work or business problem. Not generic praise. Not 'I am applying'. Lead with something that shows you understand what they are actually building. Then connect one concrete credential from Preiyal's background directly to it.\\n\\nPara 2 (Story): Tell his most relevant experience as a story. What problem existed, what he did, what it produced. Do NOT summarize the resume. Add context the resume cannot show: his thinking, his approach, what he learned. Pick the 1-2 experiences most relevant to THIS specific role and company.\\n\\nPara 3 (Close): One sentence. Direct ask or forward statement. No fluff.\\n\\nBANNED phrases:\\n- 'I am applying'\\n- 'I am writing to apply'\\n- 'I am excited'\\n- 'I would love'\\n- 'I am passionate'\\n- 'perfect fit'\\n- 'great fit'\\n- 'quick learner'\\n- 'dream company'\\n- Any variation of announcing the application in the opener\\n\\nBANNED punctuation:\\n- Em dashes anywhere in the cover letter. Use commas or periods instead.\\n\\nWRITING STYLE:\\n- Sound like a sharp, confident human wrote this. No AI word salad.\\n- No 'leveraging', 'synergies', 'cross-functional stakeholders', 'driving adoption', 'spearheaded', 'utilized', 'impactful'.\\n- Short sentences over long ones. Active voice only.\\n- The cover letter should make a recruiter want to read the resume, not repeat it.\\n\\nDo not invent metrics or outcomes not stated in his background.",
  "outreach": "Write a cold outreach email to a recruiter or team member at the company.\\n\\nSTRUCTURE:\\nSubject line: Under 8 words, specific, not generic.\\nLine 1 (Hook): One specific observation about the company's actual work. Something from their product, team focus, or what the JD reveals about what they are building. Not a compliment. An observation that shows you know what they do.\\nLine 2 (Credential): One concrete data point from Preiyal's background that connects to their work.\\nLine 3 (Ask): Single low-friction ask. A 15-minute call or just flagging interest.\\nOptional PS: One surprising or memorable detail.\\n\\nBANNED:\\n- 'I hope you are doing well'\\n- 'I came across your profile'\\n- 'I would love to connect'\\n- Em dashes anywhere\\n- More than 4 sentences in the body\\n\\nDo not invent facts not present in the job description or his background."
}

Rules:
- Always respond with raw JSON only. No markdown. No code blocks. No explanation.
- Base all content on Preiyal's REAL experience above — do not fabricate credentials.
- Do not invent metrics, percentages, or outcomes not explicitly stated in his background.
- Never mention a company, tool, platform, or technology in any output unless it already appears in his background or the original bullet being rewritten. Do not claim experience with LinkedIn, Salesforce, TikTok, or any platform just because the JD lists it.
- Your job is to reframe what exists — not invent what doesn't.
- Tailor everything specifically to the provided job description and company.
- For the role type context provided, adjust tone and emphasis accordingly.`

const ROLE_TYPES = [
  'Software Engineering',
  'Product Management',
  'Data Science / Analytics',
  'Technology Consulting',
  'UX / Design',
  'Business / Operations',
  'Other',
]

const STATUS_OPTIONS = ['Applied', 'Phone Screen', 'Interview', 'Offer', 'Rejected', 'Withdrawn']

const STATUS_COLORS = {
  'Applied': 'bg-blue-900 text-blue-200',
  'Phone Screen': 'bg-yellow-900 text-yellow-200',
  'Interview': 'bg-purple-900 text-purple-200',
  'Offer': 'bg-green-900 text-green-200',
  'Rejected': 'bg-red-900 text-red-200',
  'Withdrawn': 'bg-gray-700 text-gray-300',
}

const TABS = ['keywords', 'bullets', 'coverLetter', 'outreach']
const TAB_LABELS = {
  keywords: 'Keywords',
  bullets: 'Tailored Bullets',
  coverLetter: 'Cover Letter',
  outreach: 'Outreach Email',
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-700 rounded"
          style={{ width: `${[95, 80, 88, 72, 85][i]}%` }}
        />
      ))}
      <div className="h-3 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
    </div>
  )
}

function SettingsModal({ apiKey, onSave, onClose }) {
  const [draft, setDraft] = useState(apiKey)
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.target === overlayRef.current) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-white font-semibold text-lg mb-1">API Key Settings</h2>
        <p className="text-gray-400 text-sm mb-4">
          Your key is stored only in your browser's localStorage and never sent anywhere except directly to Anthropic.
        </p>
        <input
          type="password"
          className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 mb-4"
          placeholder="sk-ant-..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  )
}

const LOG_TABS = ['keywords', 'bullets', 'coverLetter', 'outreachEmail']
const LOG_TAB_LABELS = {
  keywords: 'Keywords',
  bullets: 'Bullets',
  coverLetter: 'Cover Letter',
  outreachEmail: 'Outreach Email',
}

function ViewModal({ entry, onClose }) {
  const [activeTab, setActiveTab] = useState('keywords')
  const [copiedTab, setCopiedTab] = useState(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (e.target === overlayRef.current) onClose() }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const getContent = (tab) => tab === 'bullets' ? getDisplayBullets(entry.bullets) : (entry[tab] || '')

  const copy = (tab) => {
    navigator.clipboard.writeText(getContent(tab)).then(() => {
      setCopiedTab(tab)
      setTimeout(() => setCopiedTab(null), 2000)
    })
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-white font-semibold">{entry.company}</h2>
            <p className="text-gray-400 text-sm">{entry.role} · {entry.date}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 mt-0.5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex border-b border-gray-700 px-6">
          {LOG_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {LOG_TAB_LABELS[tab]}
            </button>
          ))}
        </div>
        <div className="relative flex-1 overflow-auto p-5">
          {getContent(activeTab) ? (
            <>
              <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed font-sans pr-16">
                {getContent(activeTab)}
              </pre>
              <button
                onClick={() => copy(activeTab)}
                className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 rounded-lg transition-all duration-150"
              >
                {copiedTab === activeTab ? <span className="text-green-400">Copied!</span> : 'Copy'}
              </button>
            </>
          ) : (
            <p className="text-gray-500 text-sm">No content saved for this field.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('applyfast_api_key') || '')
  const [showSettings, setShowSettings] = useState(false)
  const [jobDescription, setJobDescription] = useState('')
  const [roleType, setRoleType] = useState(ROLE_TYPES[0])
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [activeTab, setActiveTab] = useState('keywords')
  const [isLoading, setIsLoading] = useState(false)
  const [output, setOutput] = useState(null)
  const [error, setError] = useState('')
  const [copiedTab, setCopiedTab] = useState(null)
  const [showHunter, setShowHunter] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [toast, setToast] = useState({ show: false, error: false })
  const [appLog, setAppLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('applyfast_log') || '[]')
    } catch {
      return []
    }
  })
  const [viewEntry, setViewEntry] = useState(null)

  const logRef = useRef(null)

  const saveApiKey = (key) => {
    setApiKey(key)
    localStorage.setItem('applyfast_api_key', key)
    setShowSettings(false)
  }

  const generate = async () => {
    if (!apiKey) {
      setShowSettings(true)
      return
    }
    if (!jobDescription.trim()) {
      setError('Please paste a job description.')
      return
    }
    setError('')
    setIsLoading(true)
    setOutput(null)
    setShowHunter(false)

    const userMessage = `Job Description:
${jobDescription}

Role Type: ${roleType}
Company: ${companyName || 'Unknown'}
Role Title: ${roleTitle || 'Unknown'}

Before writing the cover letter opener, identify one specific thing about this company's product, mission, or recent work that is mentioned in the job description itself. Use that as the anchor for the opening hook. Do not make up facts about the company not present in the JD. If the JD mentions specific technical areas, products, or company milestones, reference those specifically.

Please generate the keywords, tailored bullets, cover letter, and outreach message as a JSON object.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 4096,
          system: [
            {
              type: 'text',
              text: SYSTEM_PROMPT,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      let rawText = data.content?.[0]?.text || ''

      // Strip markdown code blocks if present
      rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

      const parsed = JSON.parse(rawText)
      setOutput(parsed)
      setShowHunter(true)

      // Auto-add to application log
      if (companyName || roleTitle) {
        const newEntry = {
          id: Date.now(),
          company: companyName || '—',
          role: roleTitle || '—',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          status: 'Applied',
          keywords: parsed.keywords || '',
          bullets: parsed.bullets || '',
          coverLetter: parsed.coverLetter || '',
          outreachEmail: parsed.outreach || '',
        }
        setAppLog((prev) => {
          const updated = [newEntry, ...prev]
          localStorage.setItem('applyfast_log', JSON.stringify(updated))
          return updated
        })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadResume = async () => {
    if (!output?.bullets || isDownloading) return
    setIsDownloading(true)
    try {
      const res = await fetch('https://apply-fast-backend.onrender.com/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bullets: output.bullets,
          role_title: roleTitle,
          company_name: companyName,
        }),
      })
      if (!res.ok) throw new Error('Server error')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Preiyal_Thakkar_${roleTitle}_${companyName}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setToast({ show: true, error: false })
      setTimeout(() => setToast({ show: false, error: false }), 2000)
    } catch {
      setToast({ show: true, error: true })
      setTimeout(() => setToast({ show: false, error: false }), 2500)
    } finally {
      setIsDownloading(false)
    }
  }

  const copyContent = (tab) => {
    if (!output?.[tab]) return
    const text = tab === 'bullets' ? getDisplayBullets(output.bullets) : output[tab]
    navigator.clipboard.writeText(text).then(() => {
      setCopiedTab(tab)
      setTimeout(() => setCopiedTab(null), 2000)
    })
  }

  const openHunter = () => {
    const domain = (companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '') + '.com'
    window.open(`https://hunter.io/search/${domain}`, '_blank')
  }

  const updateLogStatus = (id, status) => {
    setAppLog((prev) => {
      const updated = prev.map((entry) => (entry.id === id ? { ...entry, status } : entry))
      localStorage.setItem('applyfast_log', JSON.stringify(updated))
      return updated
    })
  }

  const deleteLogEntry = (id) => {
    setAppLog((prev) => {
      const updated = prev.filter((entry) => entry.id !== id)
      localStorage.setItem('applyfast_log', JSON.stringify(updated))
      return updated
    })
  }

  const exportCSV = () => {
    const headers = ['Company', 'Role', 'Date', 'Status']
    const rows = appLog.map((e) =>
      [e.company, e.role, e.date, e.status].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'apply-fast-log.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const scrollToLog = () => {
    logRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const hasKey = !!apiKey

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {showSettings && (
        <SettingsModal apiKey={apiKey} onSave={saveApiKey} onClose={() => setShowSettings(false)} />
      )}
      {viewEntry && (
        <ViewModal entry={viewEntry} onClose={() => setViewEntry(null)} />
      )}

      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-white tracking-tight">Apply Fast</span>
          <span className="text-xs text-gray-500 font-medium bg-gray-800 px-2 py-0.5 rounded-full">beta</span>
        </div>
        <div className="flex items-center gap-3">
          {!hasKey && (
            <span className="text-xs text-amber-400 bg-amber-900/40 border border-amber-700 px-3 py-1 rounded-full">
              No API key
            </span>
          )}
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left panel — Input */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Job Description</label>
              <textarea
                className="w-full h-56 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none leading-relaxed"
                placeholder="Paste the full job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Role Type</label>
                <select
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                  value={roleType}
                  onChange={(e) => setRoleType(e.target.value)}
                >
                  {ROLE_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Company</label>
                <input
                  type="text"
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Google"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Role Title</label>
              <input
                type="text"
                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Software Engineering Intern"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={generate}
                disabled={isLoading}
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base rounded-xl transition-all duration-150 shadow-lg shadow-blue-900/40 active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  'Generate Application Materials'
                )}
              </button>
              <button
                onClick={downloadResume}
                disabled={!output || isDownloading}
                title={!output ? 'Generate first to enable' : ''}
                className="px-4 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 disabled:text-gray-600 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap active:scale-[0.98]"
              >
                {isDownloading ? 'Generating…' : '⬇ Download Tailored Resume'}
              </button>
            </div>

            <div className="flex items-center gap-3">
              {showHunter && (
                <button
                  onClick={openHunter}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-700/30 hover:bg-orange-700/50 border border-orange-700 text-orange-300 rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find contacts on Hunter.io
                </button>
              )}
              {appLog.length > 0 && (
                <button
                  onClick={scrollToLog}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2"
                >
                  View application log ({appLog.length})
                </button>
              )}
            </div>
          </div>

          {/* Right panel — Output */}
          <div className="flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-gray-800 mb-5">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex-1 min-h-64 relative">
              {isLoading ? (
                <Skeleton />
              ) : output ? (
                <>
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                    {activeTab === 'bullets' ? getDisplayBullets(output.bullets) || '—' : output[activeTab] || '—'}
                  </pre>
                  <button
                    onClick={() => copyContent(activeTab)}
                    className="absolute top-4 right-4 px-3 py-1.5 text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-all duration-150"
                  >
                    {copiedTab === activeTab ? (
                      <span className="text-green-400">Copied!</span>
                    ) : (
                      'Copy'
                    )}
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-10">
                  <div className="text-4xl mb-3">⚡</div>
                  <p className="text-gray-500 text-sm">
                    Paste a JD and hit Generate to get tailored application materials.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {toast.show && (
          <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-xl text-sm font-medium z-50 pointer-events-none border ${
            toast.error
              ? 'bg-red-900 border-red-700 text-red-100'
              : 'bg-green-800 border-green-700 text-green-100'
          }`}>
            {toast.error ? 'Resume generation failed — try again' : 'Resume downloaded!'}
          </div>
        )}

      {/* Application Log */}
        <section ref={logRef} className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Application Log</h2>
            {appLog.length > 0 && (
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 rounded-lg transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            )}
          </div>

          {appLog.length === 0 ? (
            <div className="text-center py-12 text-gray-600 text-sm border border-dashed border-gray-800 rounded-xl">
              Applications you generate will appear here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Company</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Date</th>
                    <th className="text-left px-4 py-3 text-gray-400 font-medium">Status</th>
                    <th className="px-4 py-3" />
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {appLog.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className={`border-b border-gray-800 last:border-0 ${idx % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900/50'}`}
                    >
                      <td className="px-4 py-3 text-white font-medium">{entry.company}</td>
                      <td className="px-4 py-3 text-gray-300">{entry.role}</td>
                      <td className="px-4 py-3 text-gray-400">{entry.date}</td>
                      <td className="px-4 py-3">
                        <select
                          value={entry.status}
                          onChange={(e) => updateLogStatus(entry.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[entry.status] || 'bg-gray-700 text-gray-300'}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s} className="bg-gray-900 text-gray-100">{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setViewEntry(entry)}
                          disabled={!entry.coverLetter && !entry.keywords}
                          className="px-3 py-1 text-xs font-medium bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteLogEntry(entry.id)}
                          className="text-gray-600 hover:text-red-400 transition-colors p-1"
                          title="Delete"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
