# CX Portal React

React + Vite migration of the CX Portal.

## Included

- protected portal routes
- Supabase auth + session handling
- dashboard, tickets, reports, settings
- standalone login, reset-password, and reply routes
- Arabic/English, RTL/LTR, dark/light support
- GitHub Pages-friendly SPA fallback via `public/404.html`

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local` if you want to override Supabase settings.

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## GitHub Pages deploy

This project is configured with `base: "./"` in `vite.config.js` and includes `public/404.html` + `.nojekyll` for static SPA hosting.

Build output is created in `dist/`.

Typical deploy flow:

```bash
npm run build
```

Then publish the contents of `dist/` to the branch/folder used by GitHub Pages.
