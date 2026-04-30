import io
import re
import logging
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


# ── Resume content ────────────────────────────────────────────────────────────

NAME    = 'Preiyal Thakkar'
CONTACT = 'preiyalt@uw.edu  |  LinkedIn  |  Github  |  +1 425 463 7697  |  Seattle, WA'

EDUCATION = {
    'org':      'University of Washington',
    'location': 'Seattle, WA',
    'lines': [
        'Bachelor of Science, Informatics: Data Science | Expected Jun 2028',
        'Cumulative GPA: 3.59/4.00',
    ],
}

BASE_EXPERIENCE = [
    {
        'key':      'Infoseeking Lab',
        'org':      'Infoseeking Lab (Prof. Chirag Shah), UW',
        'location': 'Seattle, WA',
        'role':     'Undergraduate Research Assistant',
        'dates':    'Jan 2026 – Present',
        'bullets': [
            'Proactively identified an underexplored gap across HCI, cognitive science, and ML evaluation'
            ' literature — that benchmark failures disproportionately affect non-Western and'
            ' underrepresented users — and formulated this as the central research question driving'
            ' workshop-scale publications on equitable AI systems.',
        ],
    },
    {
        'key':      'PricewaterhouseCoopers',
        'org':      'PricewaterhouseCoopers Services LLP',
        'location': 'Mumbai, IN',
        'role':     'Financial Services Technology Advisory Intern',
        'dates':    'Jul 2025 – Aug 2025',
        'bullets': [
            'Diagnosed that financial documentation bottlenecks stemmed from structural information gaps,'
            ' not just manual effort — then designed an AI-driven BRD generation system (Python,'
            ' TF-IDF, LLaMA) to address the root cause, significantly reducing cognitive load for analysts',
            'Streamlined document chunking, embedding, and review workflows, improving processing'
            ' efficiency by ~60%',
            'Partnered with FS Tech engineers to design secure, scalable architecture, ensuring the'
            ' solution safely and effectively met the needs of cross-functional teams',
        ],
    },
    {
        'key':      'Monedo',
        'org':      'Monedo Financial Services (Fintech)',
        'location': 'Mumbai, IN',
        'role':     'Data Science Intern',
        'dates':    'Jun 2024 – Aug 2024',
        'bullets': [
            'Developed ML models for credit risk assessment, improving prediction accuracy by 30% to help'
            ' facilitate fairer, more inclusive lending decisions',
            'Analyzed large financial datasets (Python, Pandas, scikit-learn) to uncover hidden risk'
            ' indicators, linking complex data points to broader financial behaviors and trends',
            'Collaborated with senior data scientists to translate analytical insights into a functional'
            ' prototype, successfully bridging theoretical models with real-world financial applications',
        ],
    },
]

BASE_PROJECTS = [
    'NLP and AI Systems: Built a Text-to-SQL Natural Language Interface translating plain English to'
    ' executable SQL using Python and NLP; developed FinDocGPT, a RAG-based document intelligence tool'
    ' for querying dense financial text; built a Skill Gap Analyzer mapping user profiles against job'
    ' descriptions to surface upskilling recommendations',
    'Finance and Mobile: Built a Voice Finance Intelligence App in Flutter for Android enabling natural'
    ' language personal finance queries; deployed Habit Cost Calculator live on Vercel and Render;'
    ' developed a Smart Visual Planner for goal tracking with calendar integration and progress visualization',
    'Productivity and Automation: Built a Distributed Task Queue system in Python for async job'
    ' processing across worker nodes; developed TabMinder for browser tab management with usage'
    ' analytics; built a Meeting Transcript Analyzer to extract action items and decisions from raw'
    ' meeting text; developed Subscription Radar for tracking recurring expenses with automated alerting',
    'Full Stack and APIs: Built a Job Application Tracker as a Chrome Extension with React, Flask,'
    ' Supabase, and Claude API integration; developed a UW Smart Registration Assistant Chrome Extension'
    ' integrating DawgPath and RateMyProfessor data for optimized course selection; built a GitHub'
    ' Activity Visualizer using React and GitHub API with Claude API integration for AI-generated'
    ' contribution summaries',
    'Developer Tools: Built Mini Git, a version control system in Python using SHA-based hashing, object'
    ' storage, and file I/O to replicate core Git functionality including commits and diffs; built a File'
    ' Deduplication Tool using hashing and binary comparison for efficient storage management',
    'Data Pipelines and Dashboards: Built a Healthcare Cost Transparency Dashboard in React with a Python'
    ' data pipeline on CMS public datasets to surface provider pricing disparities; developed a Mental'
    ' Health Trends Analyzer using Streamlit and CDC data to identify population-level behavioral health'
    ' patterns',
]

BASE_ASSOCIATIONS = [
    'Contributed to a large-scale financial research study on SaaS valuation in the AI era, co-authored'
    ' by a strategy executive and a Michigan Ross professor, leading data collection and analysis that'
    ' formed the foundation of published findings',
    'Member, University of Washington Technical & Analytics Clubs: Active in Applied Analytics, Applied'
    ' Math, AI Alignment, and CSE Entrepreneurship clubs',
    'Led finance education outreach and community service initiatives, organizing workshops for 200+'
    ' students, coordinating COVID-19 relief, launching a Book Bank project, and raising $5,000;'
    ' recognized with the “Outstanding Volunteer Initiative” award',
]

BASE_SKILLS = [
    {
        'label': 'Language & Tools',
        'value': 'Python, Java, JavaScript, React, Flask, SQL, Dart/Flutter, Supabase, Git,'
                 ' Chrome Extensions API, GitHub API, Streamlit, Pandas, scikit-learn,'
                 ' Microsoft Excel, Canva, R Studio',
    },
    {
        'label': 'Technical Skills',
        'value': 'Data Structures and Algorithms, Machine Learning Pipelines, NLP and Text Processing,'
                 ' Retrieval-Augmented Generation, REST APIs, Statistical Modeling, Full Stack'
                 ' Development, Data Visualization, File I/O and Systems Programming, Analytical Skills',
    },
    {
        'label': 'Interests',
        'value': 'Classical Dance, Cooking & Nutrition, Music; Information Equity & Algorithmic Fairness',
    },
]


# ── Bullet parsing + substitution ─────────────────────────────────────────────

def _norm(s):
    """Lowercase, strip punctuation, collapse whitespace — used for fuzzy matching."""
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9 ]', '', s.lower())).strip()


def parse_bullets(text):
    """
    Parse bullet lines in either format:
      [Section] original text → rewritten
      Section: original text → rewritten
    """
    out = []
    for raw in (text or '').split('\n'):
        line = raw.strip()
        if not line or '→' not in line:
            continue
        # Try [Section] bracket format first
        m = re.match(r'^\[(.+?)\]\s*(.+?)\s*→\s*(.+)$', line)
        # Fall back to "Section: original → rewritten"
        if not m:
            m = re.match(r'^(.+?):\s*(.+?)\s*→\s*(.+)$', line)
        if m:
            entry = {
                'section':   m.group(1).strip(),
                'original':  m.group(2).strip(),
                'rewritten': m.group(3).strip(),
            }
            logger.debug(
                f"  parsed  section='{entry['section']}'  "
                f"original='{entry['original'][:50]}'"
            )
            out.append(entry)
        else:
            logger.debug(f"  could not parse line: {line[:80]}")
    logger.info(f"parse_bullets → {len(out)} bullet(s) found")
    return out


def apply_substitutions(experience, parsed):
    if not parsed:
        return experience
    out = []
    for entry in experience:
        key = entry['key']
        # Section match: first word of either side must appear in the other
        relevant = [
            p for p in parsed
            if (key.lower().split()[0] in p['section'].lower()
                or p['section'].lower().split()[0] in key.lower())
        ]
        logger.debug(
            f"[{key}] {len(relevant)} relevant parsed bullet(s) from "
            f"{[p['section'] for p in parsed]}"
        )
        if not relevant:
            out.append(entry)
            continue
        bullets = list(entry['bullets'])
        for rb in relevant:
            needle = _norm(rb['original'])[:30]
            matched = False
            for i, b in enumerate(bullets):
                if _norm(b).startswith(needle):
                    logger.info(
                        f"  ✓ MATCH  [{key}]  "
                        f"'{rb['original'][:45]}' → '{rb['rewritten'][:45]}'"
                    )
                    bullets[i] = rb['rewritten']
                    matched = True
                    break
            if not matched:
                logger.warning(
                    f"  ✗ NO MATCH  [{key}]  original='{rb['original'][:45]}'\n"
                    f"    searched: {[_norm(b)[:30] for b in bullets]}"
                )
        out.append({**entry, 'bullets': bullets})
    return out


# ── PDF layout engine ─────────────────────────────────────────────────────────

def _wrap(text, font, size, max_w):
    words = text.split()
    if not words:
        return ['']
    lines, cur = [], words[0]
    for w in words[1:]:
        test = cur + ' ' + w
        if stringWidth(test, font, size) <= max_w:
            cur = test
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def _wrap_offset(text, font, size, first_w, rest_w):
    """Wrap with a narrower first line — used for bold-label skill rows."""
    words = text.split()
    if not words:
        return ['']
    lines, cur, max_w = [], words[0], first_w
    for w in words[1:]:
        test = cur + ' ' + w
        if stringWidth(test, font, size) <= max_w:
            cur = test
        else:
            lines.append(cur)
            cur = w
            max_w = rest_w
    lines.append(cur)
    return lines


def _draw_resume(c, experience, scale, draw):
    """
    Dual-mode renderer.
      draw=False  pure measurement — c is ignored, returns final y
      draw=True   renders to canvas c, returns final y
    """
    PAGE_W, PAGE_H = letter
    LEFT  = 0.65 * inch
    RIGHT = PAGE_W - 0.65 * inch
    CW    = RIGHT - LEFT

    N  = 18   * scale   # name
    CT =  9   * scale   # contact
    H  = 10.5 * scale   # section header
    CO = 10   * scale   # company name
    RO =  9.5 * scale   # role / dates
    B  =  9   * scale   # body + bullets
    LH =  1.2           # line-height multiplier

    BCHAR = '•  '
    BX    = LEFT + 0.15 * inch
    bchar_w = stringWidth(BCHAR, 'Helvetica', B)
    TX    = BX + bchar_w
    TW    = RIGHT - TX

    y = PAGE_H - 0.5 * inch   # start just inside top margin

    # ── drawing primitives ────────────────────────────────────────────────

    def txt(s, font, size, x, color=(0, 0, 0), align='left'):
        if draw:
            c.setFillColorRGB(*color)
            c.setFont(font, size)
            if align == 'center':
                c.drawCentredString(PAGE_W / 2, y, s)
            elif align == 'right':
                c.drawRightString(x, y, s)
            else:
                c.drawString(x, y, s)

    def rule(lw=0.5, color=(0, 0, 0)):
        if draw:
            c.setLineWidth(lw)
            c.setStrokeColorRGB(*color)
            c.line(LEFT, y, RIGHT, y)

    # ── block helpers (each advances y) ──────────────────────────────────

    def section(title):
        nonlocal y
        y -= H
        txt(title, 'Helvetica-Bold', H, LEFT)
        y -= 2
        rule()
        y -= 3

    def company(org, loc, first=False):
        nonlocal y
        if not first:
            y -= 4              # between company blocks
        y -= CO * LH
        txt(org, 'Helvetica-Bold', CO, LEFT)
        txt(loc, 'Helvetica', B, RIGHT, align='right')

    def role_line(title, dates):
        nonlocal y
        y -= RO * LH
        txt(title, 'Helvetica-Oblique', RO, LEFT)
        txt(dates, 'Helvetica-Oblique', RO, RIGHT, align='right')

    def bullet(btext, last_entry=False, last_section=False):
        nonlocal y
        lines = _wrap(btext, 'Helvetica', B, TW)
        for i, line in enumerate(lines):
            y -= B * LH
            if draw:
                c.setFont('Helvetica', B)
                c.setFillColorRGB(0, 0, 0)
                if i == 0:
                    c.drawString(BX, y, BCHAR)
                c.drawString(TX, y, line)
        # gap after bullet:
        #   2pt between bullets within an entry
        #   0pt after last bullet of a non-last entry (company row adds 4pt)
        #   6pt after last bullet of entire section
        y -= 6 if last_section else (0 if last_entry else 2)

    def bodyline(btext):
        nonlocal y
        lines = _wrap(btext, 'Helvetica', B, CW)
        for line in lines:
            y -= B * LH
            if draw:
                c.setFont('Helvetica', B)
                c.setFillColorRGB(0, 0, 0)
                c.drawString(LEFT, y, line)

    def skill_row(label, value, last=False):
        nonlocal y
        ls  = label + ': '
        lw  = stringWidth(ls, 'Helvetica-Bold', B)
        lines = _wrap_offset(value, 'Helvetica', B, CW - lw, CW)
        for i, line in enumerate(lines):
            y -= B * LH
            if draw:
                c.setFillColorRGB(0, 0, 0)
                if i == 0:
                    c.setFont('Helvetica-Bold', B)
                    c.drawString(LEFT, y, ls)
                    c.setFont('Helvetica', B)
                    c.drawString(LEFT + lw, y, line)
                else:
                    c.setFont('Helvetica', B)
                    c.drawString(LEFT, y, line)
        if not last:
            y -= 2

    # ── header ───────────────────────────────────────────────────────────

    y -= N
    txt(NAME, 'Helvetica-Bold', N, PAGE_W / 2, align='center')
    y -= 2

    y -= CT * LH
    contact_y = y
    txt(CONTACT, 'Helvetica', CT, PAGE_W / 2, color=(0.4, 0.4, 0.4), align='center')
    if draw:
        # Place clickable link rects over "LinkedIn" and "Github" in the centered line.
        total_w = stringWidth(CONTACT, 'Helvetica', CT)
        x_start = PAGE_W / 2 - total_w / 2
        for word, url in (
            ('LinkedIn', 'https://www.linkedin.com/in/preiyalthakkar'),
            ('Github',   'https://github.com/preiyalthakkar3007'),
        ):
            prefix_w = stringWidth(CONTACT[:CONTACT.index(word)], 'Helvetica', CT)
            x1 = x_start + prefix_w
            x2 = x1 + stringWidth(word, 'Helvetica', CT)
            c.linkURL(url, (x1, contact_y - 2, x2, contact_y + CT * 0.85), relative=0)
    y -= 2
    rule(color=(0.6, 0.6, 0.6))
    y -= 4

    # ── education ─────────────────────────────────────────────────────────

    section('EDUCATION')
    company(EDUCATION['org'], EDUCATION['location'], first=True)
    for line in EDUCATION['lines']:
        bodyline(line)
    y -= 6

    # ── experience ────────────────────────────────────────────────────────

    section('EXPERIENCE')
    n_exp = len(experience)
    for ei, exp in enumerate(experience):
        company(exp['org'], exp['location'], first=(ei == 0))
        role_line(exp['role'], exp['dates'])
        n_b = len(exp['bullets'])
        for bi, b in enumerate(exp['bullets']):
            last_e = (bi == n_b - 1)
            last_s = last_e and (ei == n_exp - 1)
            bullet(b, last_entry=last_e, last_section=last_s)

    # ── technical projects ────────────────────────────────────────────────

    section('TECHNICAL PROJECTS')
    n_p = len(BASE_PROJECTS)
    for pi, p in enumerate(BASE_PROJECTS):
        bullet(p, last_entry=(pi == n_p - 1), last_section=(pi == n_p - 1))

    # ── associations ──────────────────────────────────────────────────────

    section('ASSOCIATIONS & OTHER PROJECTS')
    n_a = len(BASE_ASSOCIATIONS)
    for ai, a in enumerate(BASE_ASSOCIATIONS):
        bullet(a, last_entry=(ai == n_a - 1), last_section=(ai == n_a - 1))

    # ── skills & interests ────────────────────────────────────────────────

    section('SKILLS & INTERESTS')
    n_s = len(BASE_SKILLS)
    for si, sk in enumerate(BASE_SKILLS):
        skill_row(sk['label'], sk['value'], last=(si == n_s - 1))

    return y


def build_pdf(experience):
    BOTTOM = 0.5 * inch

    scale = 0.75
    for s in (1.0, 0.95, 0.90, 0.85, 0.80, 0.75):
        if _draw_resume(None, experience, s, draw=False) >= BOTTOM:
            scale = s
            break

    buf = io.BytesIO()
    c = rl_canvas.Canvas(buf, pagesize=letter)
    _draw_resume(c, experience, scale, draw=True)
    c.save()
    buf.seek(0)
    return buf


# ── Route ─────────────────────────────────────────────────────────────────────

@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'Invalid JSON body'}), 400

    bullets_text = data.get('bullets', '')
    role_title   = data.get('role_title', 'Resume')
    company_name = data.get('company_name', '')

    safe_role    = re.sub(r'[^a-zA-Z0-9]', '', role_title)
    safe_company = re.sub(r'[^a-zA-Z0-9]', '', company_name)
    filename = f"Preiyal_Thakkar_{safe_role}{'_' + safe_company if safe_company else ''}.pdf"

    parsed     = parse_bullets(bullets_text)
    experience = apply_substitutions(BASE_EXPERIENCE, parsed)

    try:
        pdf = build_pdf(experience)
        logger.info(f"PDF generated — {len(parsed)} substitution(s), filename={filename}")
        return send_file(pdf, mimetype='application/pdf',
                         as_attachment=True, download_name=filename)
    except Exception as e:
        logger.error(f"PDF build failed: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
