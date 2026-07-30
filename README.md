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

The interface is available in **Greek and English**, and the completed resume can be downloaded as an **A4 PDF** directly from the browser, on desktop or mobile.

## Features

- Live resume preview while editing
- Greek and English interface
- Personal details and customizable contact links (email, phone, location, website, LinkedIn, GitHub, X, or a custom link)
- Professional summary with rich-text formatting (bold, italic, underline, bullet lists)
- Work experience and education sections, with a decade → year → month date picker and start/end date validation
- Skills and language proficiency levels
- Certifications and projects
- Optional profile photo
- Drag-and-drop entry reordering
- Preset and custom sidebar colors, with automatic text contrast for light and dark colors
- Automatic multi-page A4 layout, with page navigation in the preview
- One-click PDF export that works the same on desktop and mobile
- Automatic local saving with `localStorage`
- Responsive layout for desktop and smaller screens
- No sign-up, subscription, watermark, or backend

## Privacy

CVsible is a client-side application. Resume information and uploaded photos are stored locally in the browser using `localStorage`; they are not sent to a CVsible server.

Clearing the browser's site data or selecting **New resume** removes the locally stored resume.

## Tech stack

- **React 19**
- **TypeScript 6**
- **Vite 8**
- **CSS**
- **Vercel** for deployment
- Browser `localStorage` for persistence
- `html2canvas` + `jsPDF` (lazy-loaded on demand) for client-side PDF generation

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

Open the local address shown by Vite, usually `http://localhost:5173`.

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
├── public/                  # Static assets and favicon
├── src/
│   ├── components/          # Resume preview, forms, and reusable UI
│   ├── data/                # Default CV data and theme presets
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
- [ ] Import and export resume data as JSON
- [ ] More typography and spacing controls
- [ ] Automated accessibility tests
- [ ] Unit and end-to-end tests
- [ ] Optional ATS-focused template

## Author

Created by **Stavros Kalyviotis**.

[LinkedIn](https://www.linkedin.com/in/stavros-kalyviotis/) · [Live application](https://cvsible.vercel.app/)
