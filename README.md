# ProofCV

**Improve your resume without inventing experience.**

ProofCV compares a student's pasted resume with an internship job description (JD). It shows which of the posting's
skills the resume already covers, which ones may already be there under different wording, and which are real gaps
that should only be added if true. Every bullet is audited, and the suggested rewrites leave `[placeholders]` instead of
inventing numbers.

Built for *The Battle Royale* hackathon (GDG on Campus AITR). Problem statement: ATS Keyword & Project Bullet Improver.

## Features

| | Feature |
|---|---|
| MVP | Side-by-side resume and JD panes, with a one-click **Load sample** and four role presets |
| MVP | **JD keyword coverage**: weighted share of the posting's skills found in the resume (required ×2, listed ×1, nice-to-have ×0.5) |
| MVP | **Weak verb finder**: flags *worked on, helped, responsible for, involved in…* and suggests stronger, truthful verbs |
| MVP | **Before/after rewriter + template builder**: verb + what + tool + result; the result slot is never auto-filled |
| Edge | **Honest-add check**: three buckets: *Already in your resume* / *Check your wording* / *Not found: don't claim unless true* |
| Edge | **Per-bullet checklist**: strong verb, names a tool, real result, 12–25 words |
| Edge | **Inline highlights** in both panes (green = match, amber = other wording, red = weak / not found) |
| Edge | **Top 5 fixes**, copyable; **Apply to resume** updates the bullet and the score live; print/save report as PDF |

## Honest limits (also stated in the UI)

- Coverage is a rule of thumb for one posting, based on ProofCV's own dictionary and weights. It does **not** predict any ATS or hiring decision.
- A word in the resume isn't proof of a skill. The tool says "related wording", never "you know this".
- ProofCV reads pasted text only, so it can't check PDF layout or parsing.

## Architecture

```
shared/   Pure, deterministic analysis engine (no dependencies), used by the client and the server
  src/skills.js     ~90 skills with aliases (exact) and evidence terms (worded differently)
  src/match.js      Whole-word matcher (Java ≠ JavaScript, js ∉ Node.js, C ≠ C++)
  src/bullets.js    Bullet extraction, checklist, weak-verb detection, placeholder rewriter
  src/analyze.js    JD importance weighting, 3-bucket classification, coverage, highlights, fix list
server/   Express: /api/health, /api/presets, /api/skills; serves the built client in production
client/   React 19 + Vite 6 + Tailwind 4
```

**Privacy:** the analysis runs entirely in the browser. The API has no endpoint that accepts resume text, so
"your resume never leaves your browser" is literally true. Inputs are kept only in the browser's localStorage.

## Run it

```bash
npm install
npm run dev        # API on :3001, web on http://localhost:5180
npm test           # engine + API tests (node:test)
npm run build && npm start   # production: one server on $PORT (default 3001) serving API + app
```

Requires Node 20+.

### Deploy

- **Full stack** (Render / Railway / any Node host): build `npm install && npm run build`, start `npm start`.
- **Static only** (Vercel / Firebase Hosting / Netlify): deploy `client/` with build `npm run build -w client` and output `client/dist`. The app falls back to bundled presets when `/api` is absent.

## Extending

- **Add a skill:** add one line to `shared/src/skills.js` (`aliases` = exact wording, `evidence` = related wording; `*` = any suffix). Then add a test in `shared/test/engine.test.js`.
- **Add a role preset:** append to `PRESETS` in `shared/src/presets.js`.

## 60-second demo

1. Problem: first- and second-year students write vague bullets and miss the posting's keywords.
2. **Load sample** → coverage **28%**, *up to 66% by rewording what you already have*.
3. Show the three buckets: *GitHub → version control*, *Express endpoints → REST APIs* versus the real gaps (SQL, Docker).
4. Open a weak bullet: checklist, rewrite with `[N]` placeholder, type in a real number, **Apply to resume**, and the score updates.
5. Close: runs in your browser, no account, and it never tells you to claim skills you don't have.
