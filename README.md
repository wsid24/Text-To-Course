# CourseForge

**Turn any topic into a complete, AI-generated course.** Type a prompt, get a structured curriculum with modules, lessons, code examples, video references, and interactive quizzes — in seconds.

🌐 **Live demo**: https://text2course-nu.vercel.app
🔧 **API**: https://text-to-course.onrender.com

---

## What it does

You type a single topic — *"Introduction to TypeScript"*, *"Networking Fundamentals"*, *"How to start with React Hooks"* — and the app generates a full multi-module course you can navigate, study, quiz yourself on, and download as a PDF for offline reading.

| You enter | You get |
|---|---|
| A topic prompt | A course with **3–6 modules × 3–5 lessons** each |
| Click a lesson | Markdown content + code snippets + a YouTube video reference + **5–8 MCQs** with instant feedback + explanations |
| Click "Download PDF" | A clean, paginated PDF with searchable text (jsPDF) |

---

## Features

- **Multi-stage AI pipeline** — Planner → Writer → Validator → Formatter. Each stage has one job; the validator catches malformed LLM output and the formatter handles non-AI side-effects (YouTube enrichment).
- **Switchable LLM provider** — Groq (Llama 3.3 70B) as primary, Gemini 2.0 Flash as automatic fallback. A dropdown in the navbar lets the user pick which one is primary per session.
- **Schema-enforced output** — Zod schemas + repair logic guarantee the AI returns valid course/lesson JSON that always conforms to the structure (3–6 modules, 3–5 lessons, 5–8 MCQs).
- **Redis caching** — content-addressed keys, in-process request coalescing. Two users generating the same topic at the same moment = one LLM call.
- **Per-lesson on-demand generation** — outlines are generated up front; individual lesson bodies generate lazily when the user opens (or clicks the inline Generate button on) each one. Saves tokens.
- **Auth0 SSO** — email/password or Google sign-in, all on Auth0's hosted login. The Express API is protected with `express-oauth2-jwt-bearer`.
- **Offline PDF export** — jsPDF text-API rendering. Output is searchable, selectable, ~30 KB per lesson.
- **Light + dark themes** — clean Stripe/Apple-style cyan palette with full token-based theming.

---

## Stack

**Frontend** — React 19 · Vite · React Router · Auth0 React SDK · lucide-react · jsPDF · react-hot-toast

**Backend** — Node.js · Express · Mongoose · Zod · express-oauth2-jwt-bearer · redis · LangChain (for RAG, optional/off by default)

**External services** — MongoDB Atlas · Upstash Redis · Auth0 · Groq · Google Gemini · YouTube Data API

**Hosting** — Backend on Render · Frontend on Vercel

---

## Local development

```bash
# clone & install
git clone https://github.com/wsid24/Text-To-Course.git
cd Text-To-Course

# backend
cd server
cp .env.example .env       # fill in keys (see "Required env vars" below)
npm install
npm start                  # http://localhost:5001

# frontend (separate terminal)
cd ../client
cp .env.example .env       # fill in VITE_* keys
npm install
npm run dev                # http://localhost:5173
```

### Required env vars

**`server/.env`**
```
PORT=5001
MONGO_URI=...                          # MongoDB Atlas connection string
AUTH0_ISSUER_BASE_URL=...              # https://your-tenant.us.auth0.com/
AUTH0_AUDIENCE=...                     # your Auth0 API identifier
GROQ_API_KEY=...                       # free at console.groq.com
GEMINI_API_KEY=...                     # free at aistudio.google.com
YOUTUBE_API_KEY=...                    # for video-block enrichment
REDIS_URL=...                          # Upstash or local Redis
LLM_PROVIDERS=groq,gemini              # provider chain priority
ALLOWED_ORIGINS=                       # comma-separated prod origins for CORS
```

**`client/.env`**
```
VITE_API_URL=http://localhost:5001/api
VITE_AUTH0_DOMAIN=your-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=...
VITE_AUTH0_AUDIENCE=https://text-to-course-api
```

---

## Project layout

```
.
├── client/                       Vite SPA
│   ├── src/
│   │   ├── api/                  axios + endpoint definitions
│   │   ├── components/
│   │   │   ├── course/           LessonPDFExporter
│   │   │   ├── layout/           Navbar (user dropdown, LLM selector, theme)
│   │   │   └── ui/               Spinner, EmptyState, AnimatedBackground
│   │   ├── context/              Auth, Theme, LLM provider state
│   │   ├── pages/                Landing, Dashboard, CourseView, Lesson, etc.
│   │   └── index.css             design tokens (dark + light, cyan accent)
│   └── vercel.json               SPA fallback rewrite
│
└── server/                       Express + Mongoose API
    ├── controllers/              auth, course, lesson HTTP handlers
    ├── middlewares/               Auth0 JWT validator, error handler
    ├── models/                   Course, Module, Lesson Mongoose schemas
    ├── routes/                   /auth, /courses, /lessons
    ├── schemas/                  Zod schemas (course outline + lesson)
    ├── services/
    │   ├── agents/               PlannerAgent, WriterAgent, ValidatorAgent, FormatterAgent
    │   ├── pipeline/             CoursePipeline, LessonPipeline
    │   ├── llm/                  LLMProvider abstraction + Gemini/Groq/Mock impls + LLMRouter
    │   ├── cache/                Redis cache with content-addressed keys + coalescing
    │   └── rag/                  Optional RAG via LangChain memory vector store
    ├── tests/stress.js           JSON-integrity stress test harness
    └── server.js                 entry point
```

---

## How a course gets generated

```
[user types topic]
       │
       ▼
POST /api/courses/generate-course        ← Auth0-validated
       │
       ▼
CoursePipeline.run(topic)
       │
       ├── CacheService.getOrSet (Redis)         ← returns cached if hit
       │
       ▼
PlannerAgent → LLMRouter (Groq primary, Gemini fallback, retry+backoff, circuit-breaker)
       │
       ▼
ValidatorAgent (Zod parse + repair if needed)
       │
       ▼
FormatterAgent (YouTube enrichment for video blocks)
       │
       ▼
[Course + Module + Lesson docs created in MongoDB]
       │
       ▼
[returned to client]
```

Lesson content is generated lazily — the outline call is cheap (no body content), and individual lesson bodies are produced on demand when the user opens a lesson.

---

## Deploying your own

The app is set up to deploy on **Render** (backend) and **Vercel** (frontend). After cloning:

1. **Render** — connect repo, root dir `server`, build `npm install`, start `npm start`. Paste all server env vars.
2. **Vercel** — connect repo, root dir `client`, framework `Vite`. Paste all `VITE_*` env vars.
3. After Vercel gives you a domain:
   - Render → add it to `ALLOWED_ORIGINS`
   - Auth0 → add it to Allowed Callback URLs, Logout URLs, Web Origins
   - MongoDB Atlas → Network Access → allow `0.0.0.0/0`

---

## License

MIT
