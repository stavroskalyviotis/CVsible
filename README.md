<div align="center">
  <img src="docs/cvsible-banner.svg" alt="CVsible — Make your experience visible" width="100%" />

  <br />

  <a href="https://cvsible.vercel.app/"><strong>Open the live app →</strong></a>

  <br /><br />

  <img alt="React" src="https://img.shields.io/badge/React-19-20232a?logo=react&logoColor=61DAFB" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" />
  <img alt="Vercel" src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white" />
</div>

## About

**CVsible** is a free, browser-based resume builder for creating clean and customizable CVs with a live preview. It requires no account, adds no watermark, and keeps the user's data on their own device.

Optionally, **CVisor** — an AI assistant built into the app — can draft resume content from a job posting through a guided 3-step flow, then hand back granular, checkbox-level control: keep or drop individual bullet points, accept or reject each suggested skill, and see a flag on any of your own listed skills that don't seem to fit the posting. It only works from information you provide (never invents facts) and is entirely opt-in; the manual builder works exactly as before if you don't use it.

The interface is available in **Greek and English**, and the completed resume can be downloaded as an **A4 PDF** directly from the browser, on desktop or mobile.

## Features

- Live resume preview while editing
- Greek and English interface
- Personal details and customizable contact links (email, phone, location, website, LinkedIn, GitHub, X, or a custom link)
- Professional summary with rich-text formatting (bold, italic, underline, bullet lists)
- Work experience and education sections, with a decade → year → month date picker (no future dates) and start/end date validation
- Skills, soft skills/characteristics, language proficiency levels, and hobbies/interests
- Certifications and projects, with long titles, links, and descriptions wrapping cleanly instead of overflowing the page
- Optional profile photo
- Drag-and-drop entry reordering, plus drag-and-drop reordering of whole sections within the sidebar and main column
- Preset and custom sidebar colors, with automatic text contrast for light and dark colors
- Adjustable layout density (compact/comfortable/spacious) and font choice (modern/classic/condensed) to help longer resumes fit fewer pages
- Automatic multi-page A4 layout with page navigation in the preview, tuned to keep concise resumes on a single page
- One-click PDF export that works the same on desktop and mobile
- Automatic local saving with `localStorage`
- Responsive layout for desktop and smaller screens
- No sign-up, subscription, or watermark
- **CVisor** (optional): a guided 3-step assistant — paste a job posting, add quick notes about your experience, then review everything CVisor drafted at bullet-point granularity: keep/drop each individual bullet for experience, education and projects, accept/reject each suggested skill, soft skill and interest, see which of your own skills may not fit the posting, and lock in a summary, job title, or color you like before regenerating fresh ideas. Nothing is applied until you approve it. Also improves the wording of individual sections on demand — powered by Claude

## Privacy

CVsible is a client-side application. Resume information and uploaded photos are stored locally in the browser using `localStorage`; they are not sent to a CVsible server.

Clearing the browser's site data or selecting **New resume** removes the locally stored resume.

**CVisor is the one exception.** If you choose to use it, the job posting text and whatever you write about your background (or an individual section's text, for the "improve" buttons) is sent to a CVsible serverless function and forwarded to the Anthropic API for processing. It is not stored on any CVsible server or database — only used to generate a response. Usage is rate-limited per visitor to keep the feature sustainable.

CVisor never invents facts about you — it only reorganizes and rephrases what you write, and never touches your name or contact details. The one exception is a small, clearly-labeled set of suggestions (extra skills, soft skills, interests, a job title, a theme color) that are explicitly presented as suggestions, not facts; nothing is added to your resume — down to individual bullet points — unless you check it.

The deployed app uses [Vercel Web Analytics](https://vercel.com/docs/analytics) and [Speed Insights](https://vercel.com/docs/speed-insights) for anonymous, aggregate page-view and performance data (no cookies, no personal data, no resume content). Both are inactive during local development.

## Tech stack

- **React 19**
- **TypeScript 6**
- **Vite 8**
- **CSS**
- **Vercel** for deployment, [Web Analytics](https://vercel.com/docs/analytics), [Speed Insights](https://vercel.com/docs/speed-insights), and Serverless Functions (CVisor's backend)
- Browser `localStorage` for persistence
- `html2canvas` + `jsPDF` (lazy-loaded on demand) for client-side PDF generation
- **CVisor**: Claude Haiku 4.5 via the Anthropic API, with Upstash Redis (through Vercel's Storage integration) for per-visitor rate limiting

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

Open the local address shown by Vite, usually `http://localhost:5173`. The resume builder works fully offline this way.

### CVisor setup (optional)

CVisor's endpoints live in `api/` as Vercel Serverless Functions, so they aren't served by plain `npm run dev` — either deploy to Vercel, or run [`vercel dev`](https://vercel.com/docs/cli/dev) locally instead of `npm run dev`. Either way you'll need:

- `ANTHROPIC_API_KEY` — from the [Anthropic Console](https://console.anthropic.com/), with a spend limit set on the account.
- A Redis store connected to the project (Vercel dashboard → **Storage** → add a Redis integration), which provides `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically. Without it, CVisor still works but with no rate limiting.

## Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run lint     # Run ESLint
npm run preview  # Preview the production build locally
```

## Project structure

```text
CVsible/
├── api/                     # Vercel Serverless Functions (CVisor backend)
│   ├── _lib/                # Shared Anthropic client, rate limiting, JSON schemas
│   ├── cvisor-fill.ts       # Generate resume content from a job posting
│   └── cvisor-suggest.ts    # Improve the wording of a single section
├── public/                  # Static assets and favicon
├── src/
│   ├── components/          # Resume preview, forms, and reusable UI
│   ├── cvisor/              # CVisor UI (panel, improve button) and API client
│   ├── data/                # Default CV data, theme presets, density, and font options
│   ├── hooks/               # CV state, routing, and preview scaling
│   ├── i18n/                # Greek and English translations
│   ├── pages/               # Landing page and resume builder
│   ├── pagination/          # A4 page measurement and pagination
│   ├── utils/               # Storage, photo, contrast, and text helpers
│   ├── App.tsx
│   ├── main.tsx
│   └── types.ts
├── index.html
├── package.json
└── vite.config.ts
```

## How PDF export works

Selecting **Download PDF** renders each A4 page of the resume to canvas in the browser and assembles the result into a real PDF file, which downloads immediately — no print dialog involved.

This avoids the inconsistent margins and extra blank pages that browser/OS print pipelines (like Windows' "Microsoft Print to PDF" or iOS's system print sheet) can add, so the export looks the same and works reliably on both desktop and mobile.

## Possible next steps

- [ ] Additional resume templates
- [ ] Support for multiple saved resumes
- [ ] Import and export resume data as JSON
- [ ] Automated accessibility tests
- [ ] Unit and end-to-end tests
- [ ] Optional ATS-focused template

## Author

Created by **Stavros Kalyviotis**.

[LinkedIn](https://www.linkedin.com/in/stavros-kalyviotis/) · [Live application](https://cvsible.vercel.app/)
