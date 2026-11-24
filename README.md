# ProofCV: Sharper resume. Zero fiction.

A resume self-audit for first- and second-year students applying for technical internships. Paste a resume and a job
description (JD), and ProofCV shows which of the posting's skills you already cover, which you may have under other
wording, and which are real gaps. Then it helps you sharpen each bullet **without inventing experience**: missing
results become `[N]` placeholders and questions, never made-up numbers.

Built for **MLH HackDay: The Battle Royale** (GDG on Campus AITR). Problem statement: *ATS Keyword & Project Bullet Improver*.

## Non-negotiables (enforced in code and tests)

1. **Privacy.** Analysis runs in the browser. The server has no endpoint that accepts resume text. Saved data lives in `localStorage`.
2. **No invented numbers.** The rewriter only changes verbs and filler; a test checks every sample rewrite contains no new digits.
3. **"JD keyword coverage"**, never "ATS score". Two numbers: *Coverage now* (exact matches) and *After rewording true skills*.
4. **Never suggest claiming a gap.** Not-found skills say: *"Don't claim this unless it's true. Have you used it? Where?"*
5. **Honest limits on screen:** pasted text only; real ATS systems differ; a self-audit, not a guarantee.
6. **No paid APIs or LLM calls** in the core flow.

## Features

- **Landing:** a walkable 3D gallery (three.js, lazy-loaded) where sample resumes and job postings hang as prints drawn on canvas. Click to look closer, open a print page with live coverage and buckets, save to "Your audits", or switch to the list view. Falls back to the list if WebGL is unavailable; honours reduced motion.
- **Auth:** log in / sign up with validation, "Continue with Google" (Firebase, behind env flag), and a prominent **Continue as guest** with every feature.
  Without Firebase keys, accounts are local to the device and Google falls back to a demo profile. `/app/*` routes redirect to `/login?next=…`.
- **Audit workspace:** resume and JD side by side (tabs on mobile), role presets, 4 samples, live debounced re-scoring, inline highlights
  (green matched, amber worded differently, red weak/not found, yellow placeholders) with hover tips, coverage ring, bucket tabs,
  bullet inspector (checklist, verb swap by intent, metric questions by bullet type, live before/after, Apply to resume),
  top-5 fixes, new-bullet template, format checklist, print/save report, `.txt` import.
- **Dashboard** (saved resumes with coverage trend, recent audits, quick start), **History** (compare two audits, reopen, delete),
  **Settings** (theme, JSON export, delete all my data, account).
- About / Privacy / Terms / Community Guidelines / 404 / error boundary. Light and dark themes, reduced-motion support.

## Structure

```
shared/            Rule-based engine (no deps), used by client and server, 17 tests
  src/skills.js    165 skills: aliases (= matched) and evidence terms (= worded differently)
  src/match.js     Whole-word matching that keeps C++, C#, .NET, Node.js intact; plural + suffix stemming
  src/bullets.js   Bullet extraction, checklist, weak-phrase detection, placeholder rewriter
  src/analyze.js   JD importance weighting, 3 buckets, coverage, highlights, top-5 fixes
  src/presets.js   4 role JDs and 4 fictional sample resumes
server/            Express: /api/health, /api/presets, /api/skills; serves the built client (4 tests)
client/            React 19, Vite 6, Tailwind 4, React Router, Zustand
  src/components/ui        Button, IconButton, Card, Badge, Tabs, Tooltip, Modal, Drawer, Toast, Input, Textarea, Select, Skeleton, EmptyState, ProgressRing, Stepper
  src/components/layout    Public and app shells, theme toggle, profile menu, route guard
  src/features/audit       Workspace panels and hooks
  src/features/gallery     3D gallery scene, canvas-drawn prints and labels
  src/features/samples     Sample loading helpers
  src/features/import      Pluggable file-to-text extractors (OCR can be registered later, lazy-loaded)
  src/routes               Pages (code-split)
  src/lib                  Store, auth, config, hooks
```

## Run

```bash
npm install
npm run dev                 # web http://localhost:5180 (API on :3001, optional)
npm test                    # engine + API tests
npm run lint -w client
npm run build               # client/dist
npm start                   # production server on $PORT serving API + app
```

Optional Firebase: copy `client/.env.example` to `client/.env.local` and fill in the keys.

### Sample resume images

Drop PNG/JPG/WebP previews named after sample IDs (`riya-sde`, `arjun-frontend`, `sana-data`, `kabir-ml`) into
`client/src/assets/samples/`. Samples without an image show a rendered text preview.

### Deploy

`vercel.json` deploys the static client (build `npm run build -w client`, output `client/dist`, SPA rewrites).
The app never needs the API in production; presets ship in the bundle.

## 60-second demo

1. **Problem (5s):** "First-years write vague bullets and miss the posting's keywords. Coaches cost money."
2. **Landing → See a sample (5s):** guest mode, no sign-up. Audit opens with Riya's resume and an SDE intern JD.
3. **Coverage (10s):** *Coverage now 28%*, *after rewording true skills 66%*. "Not an ATS score, a rule of thumb for this posting."
4. **Buckets (15s):** *Worded differently*: GitHub → version control, Express endpoints → REST APIs. *Not found*: SQL, Docker. "It will never tell you to claim these."
5. **Rewrite (15s):** Bullet inspector: "Worked on…" → "Developed…, used by [N] users". Apply stays disabled until you type your real number. Apply → bullets update live.
   Reword one true skill in the resume (e.g. "GitHub" → "Git/GitHub (version control)") and watch coverage climb.
6. **Close (10s):** Save audit → Dashboard trend → "Runs in your browser, free, and zero fiction."
