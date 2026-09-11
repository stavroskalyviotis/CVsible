<div align="center">
  <img src="docs/cvsible-banner.svg" alt="CVsible — Make your experience visible" width="100%" />

  <br />

  <a href="https://cvsible.com/"><strong>Open the live app →</strong></a>

  <br /><br />

  <img alt="React" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Auth%20%26%20DB-Supabase-3ECF8E?logo=supabase&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white" />
</div>

## About

**CVsible** is a free resume builder with a live preview and four templates. It requires no account and adds no watermark — resume data lives in the browser's `localStorage` unless you choose to sign in.

The PDF export is a real text layer, not a picture of the page: every word is selectable, searchable, and readable by an applicant tracking system, including correct Greek diacritics.

Two AI-assisted tools sit on top of the manual builder. Both are small self-checking agents rather than a single prompt call: a deterministic server-side checker measures every draft against the source text and against the same rules CVscan reports, and nothing is accepted until it clears them.

- **CVisor** builds a CV from a conversation. It asks one question at a time — what you're aiming at, then each job, then studies and skills — with the CV assembling beside you as you answer. The backbone of the interview is fixed; what the model adds are the follow-up questions inside a job, which is where the numbers and the scope come from. It is not allowed to invent a fact, company, number, or skill that isn't in your own answers: a grounding check finds anything it can't trace back to what you said and sends the draft back to be fixed. The loop gives up after a fixed number of rounds rather than looping forever, so on the rare occasion something survives, it is listed for you before you apply the CV.
- **CVfix** revises a CV you already have — the one you're editing, or one you upload as PDF/DOCX/TXT. It proposes individual edits, each showing what it replaces and why, and **nothing is applied until you accept it**. The server verifies that every quoted "before" matches what your CV actually says and that the replacement invents nothing; a proposal failing either is discarded rather than shown to you.

An uploaded file goes through a separate, strictly verbatim pass first: its content is moved into the right fields — dates, sections, bullets — without a single word changing, verified line by line. Only then are rewrites proposed, and only for your approval.

**CVscan** is a standalone ATS-compatibility checker: drag and drop any resume (yours or one built elsewhere) and see exactly what an ATS parser would extract — headings it recognizes, contact fields, date formats, whether it's actually two columns, whether it's an image instead of text — plus the full text as the parser reads it. It reports **three separate scores** rather than one blended number, because "my CV is weak" and "I don't match this particular ad" are different problems with different fixes: **Format** (can a parser read the file at all), **Content** (is the writing what a recruiter expects), and **Match** (how much of a given job ad's vocabulary the CV actually covers). The analysis is purely deterministic, non-AI, and runs entirely in your browser; nothing is uploaded anywhere for the check itself.

Optionally, sign in with Google to save CVs to your account, reopen them from any device, duplicate one per job application, share a read-only link, and keep a lightweight per-CV application tracker (company/role/status/date) that never appears in the exported PDF.

Signing in also gives you a **master profile** — your personal details, photo, work history, education and skills kept once, then imported into any CV or into CVisor, so nothing is typed twice. It is private to your account with no share path of any kind.

The interface is available in **Greek and English**.

## Features

- Live preview while editing, with automatic multi-page A4 pagination
- Four templates — Meridian, Atlas and Compass (single column, ATS-safe) plus Aurora (sidebar) — all built to canonical, ATS-recognizable section headings; switch freely without losing content. Aurora's two columns are the one thing a parser can misread, so the builder flags it rather than letting you find out from a rejection
- Real vector-text PDF export: selectable, searchable, correct Greek uppercase/diacritics, real clickable links, no watermark
- **CVisor** — a self-checking AI agent that interviews you one question at a time and writes the CV from your answers, with a grounding pass that rejects anything not traceable to your own words and shows you whatever it couldn't fix
- **CVfix** — proposes specific edits to the CV you already have, one approval at a time, showing what each one replaces and why; nothing is applied unless you accept it
- **CVscan** — standalone ATS checker: drag-and-drop PDF/DOCX/TXT, three separate scores (Format / Content / Match), technical/factual report only (no opinions), keyword matching against a job ad, full extracted text view
- Undo/redo throughout the builder (Ctrl+Z / Ctrl+Shift+Z), with rapid edits collapsed into single steps
- Download/upload the whole resume as a JSON file, to keep editing later or move between devices without an account
- Optional **Google sign-in**: save multiple CVs to your account, reopen/duplicate/rename/delete them, a read-only public share link per CV, and a per-CV job-application tracker (company, role, status, date, notes — never exported to the PDF)
- A **master profile** for signed-in users — fill your details, work history, education and skills in once, then import them into any CV or into CVisor; private to your account, never shareable
- Personal details, customizable contact links, rich-text summary, work experience/education with date validation, skills, soft skills, languages, interests, certifications and projects
- Optional categories for skills — grouped one line per category ("Kitchen: HACCP, Sauces"), or left as a single inline list if you don't use them
- Expected graduation date for studies still in progress
- Optional profile photo with drag-to-reposition
- Drag-and-drop reordering of entries and whole sections
- Preset/custom sidebar color with automatic contrast, adjustable density and font
- Fully responsive, mobile-friendly layout
- Greek and English interface and PDF output
- No sign-up required for the core builder, no watermark, no cost
- Optional, unobtrusive "Support CVsible" link (Buy Me a Coffee) — a voluntary tip, never required and never gates any feature

## Privacy

Full details live on the in-app [Privacy Policy](https://cvsible.com/#/privacy) and [Terms of Use](https://cvsible.com/#/terms) pages — the short version:

- Without an account, everything stays in your browser's `localStorage`; nothing reaches a CVsible server except when you actively use CVisor or CVfix.
- CVisor/CVfix send the relevant text to a CVsible serverless function and from there to the Anthropic API to generate a result. That content isn't logged or permanently stored on our servers.
- CVscan's analysis of an uploaded file runs entirely client-side; the file itself is never uploaded anywhere. Its text leaves the device only if you go on to run CVfix over it.
- If you sign in, Supabase handles Google authentication and stores your saved CVs and your master profile, protected by Postgres Row Level Security so only your account can read or write them. The profile has no public-share path at all, and both are deleted with your account.
- [Vercel Web Analytics](https://vercel.com/docs/analytics) and [Speed Insights](https://vercel.com/docs/speed-insights) provide anonymous, cookie-free aggregate usage data. Both are inactive during local development.
- The "Support CVsible" link points to an external Buy Me a Coffee page; clicking it just opens that page in a new tab — no data is sent to it from CVsible.
- Every response carries a Content-Security-Policy (`vercel.json`) that allows scripts only from the site's own origin, forbids plugins and framing, and keeps the page out of anyone else's `<iframe>` — alongside `nosniff`, a strict referrer policy, HSTS, and a `Permissions-Policy` that turns off camera, microphone, location and payment access. Rich text that the AI writes is put through the same sanitizer as text you type before it is ever rendered as HTML, so a job ad carrying an injection payload cannot turn into a script in your browser.

## Tech stack

- **React 19**, **TypeScript 6**, **Vite 8**
- **Vercel** for hosting, Serverless Functions (the CVisor/CVfix backend), Web Analytics and Speed Insights
- **Supabase** — Google OAuth and Postgres (saved CVs, the master profile, Row Level Security, public-share links via a `security definer` function)
- **Anthropic API** — Claude Sonnet 5 where the model writes the candidate's own words (CVisor's drafting/refine loop, CVfix's proposed rewrites), Claude Haiku 4.5 for the jobs that are comprehension rather than composition (the verbatim structuring pass, CVisor's follow-up questions, single-section wording suggestions)
- **Upstash Redis** (via Vercel Storage) for per-account/per-IP rate limiting on the AI endpoints, fails open if not configured
- `pdfjs-dist` + `fflate` for client-side PDF/DOCX parsing (CVscan, CVfix)
- A from-scratch DOM-to-PDF renderer (no `html2canvas`) built on jsPDF primitives and the browser's Range API, for a pixel-accurate, fully selectable PDF text layer
- Browser `localStorage` for the no-account path

## Getting started

### Prerequisites

Install a recent supported version of [Node.js](https://nodejs.org/).

### Installation

```bash
git clone https://github.com/stavroskalyviotis/CVsible.git
cd CVsible
npm install
npm run dev
```

Open the local address shown by Vite, usually `http://localhost:5173`. The manual resume builder and CVscan's analysis work fully offline this way — but see below for the AI features and cloud save.

### Backend setup (optional)

The AI features (CVisor, CVfix) and the cloud save features (Google sign-in, My CVs) live in `api/` as **Vercel Serverless Functions**, so they aren't served by plain `npm run dev`. Either deploy to Vercel, or run [`vercel dev`](https://vercel.com/docs/cli/dev) locally instead:

```bash
npx vercel login
npx vercel link
npx vercel dev
```

`vercel dev` reads `.env.local` automatically. Create one with:

```bash
ANTHROPIC_API_KEY=            # from console.anthropic.com, with a spend limit set
VITE_SUPABASE_URL=            # Supabase project URL — Project Settings → API
VITE_SUPABASE_ANON_KEY=       # Supabase anon/public key — same page
SUPABASE_SERVICE_ROLE_KEY=    # Supabase service_role key — server-only, never expose to the browser
KV_REST_API_URL=              # optional — Vercel dashboard → Storage → add a Redis integration
KV_REST_API_TOKEN=            # optional — provided alongside KV_REST_API_URL
```

Without the Supabase keys, the app still works fully — sign-in/save simply don't appear. Without the Redis keys, CVisor/CVfix still work, just without rate limiting.

If you want Google sign-in to work, also run `supabase/schema.sql` once in the Supabase project's SQL Editor, and enable the Google provider under **Authentication → Providers** (needs a Google Cloud OAuth Client ID/Secret — see the comments at the top of `supabase/schema.sql` and the provider's own setup page for the redirect URL to register).

## Available scripts

```bash
npm run dev            # Start the development server (frontend only, see above)
npm run build          # Create a production build
npm run lint           # Run ESLint
npm run preview        # Preview the production build locally
npm test               # Run unit tests (Vitest)
npm run test:watch     # Unit tests in watch mode
npm run test:coverage  # Unit tests with a coverage report
npm run test:e2e       # Run end-to-end tests (Playwright, needs `npm run dev` or starts its own server)
```

## Testing

- **Unit tests** (Vitest) cover the deterministic, correctness-critical logic: the CVscan ATS analyser, the grounding/verbatim/structure checks behind the anti-fabrication guarantees described above, the CVfix change model (a proposal that quotes the wrong "before", points at a path that isn't there, or invents a fact must be discarded), the CVisor interview state machine, CV data normalization, undo/redo, PDF/JSON filename building, and pagination formatting. Run with `npm test`.
- Two of those suites exist to catch a specific class of silent drift. `api/_lib/` holds copies of the action-verb list, the keyword matcher and the score thresholds, because the serverless build cannot import from `src/`. If those copies diverge, the agent starts declaring a CV finished by a different standard than the one the app applies to it a second later — which is exactly the "I fixed things and the score didn't move" failure. `actionVerbs.test.ts`, `keywords.test.ts` and `draftReview.test.ts` fail if they ever drift apart.
- **End-to-end tests** (Playwright) drive a real Chrome browser against the app — landing page, the builder (editing, undo/redo, template switching, skill categories, PDF export, JSON export/import round-trip, rich text, photo upload, drag-reorder), CVscan (file upload, scoring, keyword matching), the CVisor interview and the CVfix change window (with the AI endpoints stubbed at the network boundary, so the flow around them is tested without calling a model), My CVs / the profile / the public share page (with Supabase mocked the same way — no real Google login needed), a set of narrow-viewport checks that fail if any page grows wider than a phone screen, and a WCAG 2.0/2.1 A/AA accessibility audit of the main pages via axe-core — asserting on real UI state and checking for console/page errors. Run with `npm run test:e2e` (starts its own dev server on port 5173). `E2E_PREVIEW=1 npm run test:e2e` runs the same suite against a production build served by `vite preview` on port 5174, with the real security headers from `vercel.json` — the only way a Content-Security-Policy mistake (a blocked script, a blocked pdf.js worker) surfaces as a failing flow before it reaches the deployed site.
- Both suites are TypeScript-checked as part of `npm run build` (see `tsconfig.e2e.json`).
- The AI-backed endpoints (CVisor/CVfix) are exercised indirectly: their deterministic server-side checks (`api/_lib/*`) are unit-tested directly, while the live model loop is best verified manually via `scripts/try-agent.mjs` against `vercel dev`, since it calls the real Anthropic API and costs money per run.
- `npm run test:coverage`'s number only reflects the Vitest suite; it doesn't (and can't) credit code that's only exercised through the Playwright E2E suite, which runs in a separate real browser process outside Vitest's instrumentation. Most UI components read as 0% there despite being covered end-to-end — that's expected, not a gap.

## Project structure

```text
CVsible/
├── api/                     # Vercel Serverless Functions
│   ├── _lib/                # Anthropic client, agent prompts, the deterministic critic,
│   │                        #   grounding/verbatim/structure checks, the CVfix change model,
│   │                        #   rate limiting, Supabase auth verification
│   ├── cvisor-step.ts       # CVisor: one draft/refine turn per request
│   ├── cvisor-followup.ts   # CVisor: the follow-up questions to ask about one job
│   ├── cvfix.ts             # CVfix: propose edits for the candidate to approve
│   ├── cvfix-structure.ts   # CVfix phase one: restructure an upload, changing no wording
│   ├── cvisor-suggest.ts    # Improve the wording of a single section
│   └── delete-account.ts    # Permanently deletes a signed-in user's account
├── e2e/                     # Playwright end-to-end tests (run against a live dev server)
├── public/fonts/            # Subsetted Latin+Greek webfonts used by the preview and PDF
├── scripts/                 # Font-subsetting pipeline and local verification tooling
├── supabase/schema.sql      # Cloud storage schema — run once in the Supabase SQL Editor
├── src/
│   ├── ats/                 # CVscan: PDF/DOCX extraction and the deterministic ATS analyzer
│   ├── auth/                # Google sign-in context, hook, and account menu
│   ├── cloud/               # Saved-CV storage (Supabase) and the per-CV application tracker
│   ├── components/          # Resume preview, forms, and reusable UI
│   ├── cvfix/               # The CVfix change window, and applying an approved change
│   ├── cvisor/              # The CVisor interview, its page, and the client-side agent loop
│   ├── data/                # Default CV data, theme presets, density, and font options
│   ├── hooks/               # CV state (with undo/redo), routing, and preview scaling
│   ├── i18n/                # Greek and English translations
│   ├── legal/               # Privacy Policy / Terms of Use content and page
│   ├── pages/               # Landing, builder, CVscan, My CVs, profile, public-CV pages
│   ├── pagination/          # A4 page measurement and pagination
│   ├── profile/             # The master profile: storage, completeness, import matching
│   ├── templates/           # Template (Aurora/Meridian/Atlas/Compass) definitions
│   ├── utils/pdf/           # The DOM-to-PDF vector rendering pipeline
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── index.html
├── package.json
├── vercel.json             # Security headers (CSP et al.); vite preview reads them back
└── vite.config.ts
```

## How PDF export works

Exporting walks the live, already-rendered DOM of the resume preview and reconstructs it as vector PDF content — real text runs (via jsPDF), not a rasterized image. Photos and any SVG icons are the only parts rasterized to canvas; everything else, including every line of body text, is drawn as selectable, searchable text with the browser's own line-wrapping and Range API used to get pixel-accurate positioning.

This is why the exported PDF's text layer matches the on-screen render 1:1 and is fully machine-readable by an ATS — unlike a picture-of-the-page export, or the inconsistent margins/extra blank pages that browser and OS print pipelines can add.

## Possible next steps

- [ ] Custom free-text CV sections
- [ ] Collapsible builder panel for a full-screen preview on tablets
- [x] Automated accessibility tests
- [x] Unit and end-to-end tests

## Author

Created by **Stavros Kalyviotis**.

[LinkedIn](https://www.linkedin.com/in/stavros-kalyviotis/) · [Live application](https://cvsible.com/)
