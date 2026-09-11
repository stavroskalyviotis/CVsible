import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

interface VercelHeaders {
  headers: { source: string; headers: { key: string; value: string }[] }[]
}

/** The production security headers live in vercel.json, because that is what
 *  actually serves them. Reading them back here rather than repeating them
 *  means `npm run preview` serves the real policy — a CSP mistake shows up on
 *  a build you can open locally instead of on the deployed site.
 *
 *  Not applied to `npm run dev`: the dev server injects an inline module
 *  script for React Fast Refresh, which `script-src 'self'` would block. */
function productionHeaders(): Record<string, string> {
  const config = JSON.parse(
    readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'),
  ) as VercelHeaders
  const rule = config.headers.find((entry) => entry.source === '/(.*)')
  if (!rule) throw new Error('vercel.json no longer carries the site-wide header rule')
  return Object.fromEntries(rule.headers.map((header) => [header.key, header.value]))
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: { headers: productionHeaders() },
})
