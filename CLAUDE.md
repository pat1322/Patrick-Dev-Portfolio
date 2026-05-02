# CLAUDE.md

This file tells Claude Code how to work with this repository.

## Project Overview

Personal developer portfolio — pure HTML/CSS/JS frontend served by a Node.js/Express server on Railway. Content is driven by `data/config.json` (written by the admin panel API); hardcoded values in `index.html` are fallbacks when no config exists. Images uploaded via the admin panel are stored on a Railway Volume at `/app/data/uploads/`.

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main single-page portfolio — hero, about, skills, services, resume, portfolio, achievements, contact |
| `portfolio-details.html` | Single template for all project detail pages, driven by `?project=<id>` query param |
| `admin.html` | Browser-based admin CMS — edits all sections, publishes via `/api/config`, uploads images via `/api/upload` |
| `server.js` | Node.js/Express server — static file serving, session auth, config API, image upload |
| `package.json` | Node dependencies: express, express-session, multer |
| `data/config.json` | Live site config on the Railway Volume — overrides all hardcoded content in index.html |
| `assets/css/main.css` | Vendor/base styles (Bootstrap, AOS, Swiper) |
| `assets/css/golden-noir.css` | Custom golden-noir theme — hero section, sidebar hero panel, glitch animation |
| `assets/js/main.js` | Shared JS — AOS init, glitch animation, Swiper, Isotope, scroll-spy, header toggle |
| `assets/js/gate.js` | Security gate — overlay, 3-role access (guest/recruiter/admin), role-based blur, anti-scraping |
| `docker-entrypoint.sh` | Injects `$RECRUITER_CODE`, `$ADMIN_PASS` at container start, then starts `node server.js` |

## Architecture Decisions

- **Config-driven content**: `data/config.json` is fetched by the config loader at the bottom of `index.html` via `GET /api/config`. The server reads from the Railway Volume. Hardcoded HTML is the fallback. The admin panel writes this file via `POST /api/config`.
- **Railway Volume for persistence**: The Volume is mounted at `/app/data`. This directory holds `config.json` and `uploads/`. Because Railway's filesystem resets on redeploy, the Volume is required for content to survive deploys.
- **First-boot seeding**: On first boot the server checks if `data/config.json` exists; if not, it copies from `data-seed/config.json` (bundled in the Docker image from the repo's `data/config.json`).
- **Admin panel uses server API**: `admin.html` calls `POST /api/config` to save content and `POST /api/upload` (multipart) for images. No GitHub token needed.
- **Server-side session auth**: The admin enters their password at the gate; `gate.js` stores it as `pf_admin_token` in sessionStorage. `admin.html` calls `POST /api/login` with that token to establish a cookie-based Express session before any write API calls.
- **Instant preview via localStorage**: The admin panel also writes `pfConfig` to localStorage. The config loader in `index.html` checks localStorage first (instant preview for the admin's browser), then falls back to `/api/config`.
- **Security gate is synchronous**: `gate.js` is the first script in `<body>` and runs synchronously before the page renders. It sets `window.pfGateActive = true` and `html.gate-active` so all other scripts can defer initialization.
- **Credentials from Railway env vars**: `RECRUITER_CODE` and `ADMIN_PASS` are injected into `gate.js` by `docker-entrypoint.sh` using `sed`. They are never hardcoded. `SESSION_SECRET` is passed directly to the Node process as an env var.
- **Single project detail template**: All projects share `portfolio-details.html`. Project data lives in a JS object at the bottom of that file. Do NOT create separate per-project HTML files.
- **No build tooling**: Edit HTML/CSS/JS files directly. There is no Sass compilation, bundler, or transpiler.
- **Custom styles in `index.html`**: The main CSS is split between `assets/css/main.css` (vendor/base), `assets/css/golden-noir.css` (theme), and a large `<style>` block in `index.html` (component styles). Keep custom component styles in `index.html`'s `<style>` block.
- **Vendor libraries**: Loaded from `assets/vendor/`. Do not add CDN links for libraries already present locally. GSAP and Three.js are loaded from CDN (not vendored).
- **Animation timing**: All one-shot animations (hero scanner, glitch phrases) are frozen by `body.pre-reveal` until `startPuzzleReveal()` fires after the splash screen. AOS and GSAP ScrollTrigger section transitions are deferred behind `gateDismissed` event.

## Server API

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/login` | — | Establish admin session (body: `{ password }`) |
| `GET` | `/api/auth` | — | Check if session is active |
| `POST` | `/api/logout` | — | Destroy session |
| `GET` | `/api/config` | — | Read `data/config.json` |
| `POST` | `/api/config` | Admin | Overwrite `data/config.json` |
| `POST` | `/api/upload` | Admin | Upload image (multipart `image` field) → returns `{ url }` |
| `DELETE` | `/api/upload/:file` | Admin | Delete image from `data/uploads/` |

## Railway Environment Variables

| Variable | Purpose |
|---|---|
| `ADMIN_PASS` | Admin password — injected into gate.js and used for `/api/login` |
| `RECRUITER_CODE` | 4-digit recruiter PIN — injected into gate.js |
| `SESSION_SECRET` | Secret for signing Express sessions — keep private, never commit |
| `PORT` | Injected automatically by Railway |

## Removed Libraries (do not restore without explicit request)

- `glightbox` — lightbox gallery
- `purecounter` — animated stat counters
- `waypoints` — scroll-triggered events
- `typed.js` — replaced by the custom glitch animation in `main.js` / `golden-noir.css`

## Security Gate Roles

| Role | Entry | Access |
|------|-------|--------|
| Guest | Click Guest | Sensitive elements blurred (phone, email, LinkedIn, personal info card, location) |
| Recruiter | 4-digit PIN (`$RECRUITER_CODE`) | Full access |
| Admin | Password (`$ADMIN_PASS`) | Full access + redirect to `admin.html` |

The gate injects `body.role-guest`, `body.role-recruiter`, or `body.role-admin`. Elements with `class="sensitive"` are blurred via CSS for guests.

When admin logs in successfully, `gate.js` stores the entered password in `sessionStorage.pf_admin_token`. `admin.html` reads this to call `POST /api/login` and establish a server-side session before any write operations.

## Config System

The config loader in `index.html` applies these fields from `data/config.json`:

- **Hero**: `name`, `rolelabel`, `glitchPhrases`
- **About**: `quote`, `bio`, `highlights[]`, `fullname`, `birthday`, `address`, `nationality`, `religion`, `languages`, `hobbies`
- **Services**: `services[]` — each has `icon`, `title`, `desc`, `tags`
- **Experience**: `experience[]` — each has `period`, `role`, `company`, `bullets` (newline-separated), `tags`
- **Education**: `education[]` — each has `period`, `role`, `school`, `desc`, `tags`
- **Portfolio**: `projects[]` — each has `id`, `num`, `cat`, `filter`, `title`, `desc`, `img`, `tags`
- **Contact**: `phone`, `email`, `location`, `linkedin`, `github`, `facebook`
- **Links**: `resumeUrl`, `youtubeId`
- **Images**: `profileImg`, `heroBg`, `gifPath`

## Adding a Project

Via admin panel (preferred — no git push needed):
1. Admin panel → Portfolio → Add Project → fill fields
2. Click Upload next to card image → choose a file → URL auto-fills
3. Save & Publish to Server

Manually (for project detail page data):
1. Add screenshots to `assets/img/portfolio/`
2. Add an entry to the `projects` object in `portfolio-details.html`
3. Push to git; Railway redeploys automatically

## Local Development

```bash
npm install
# Set env vars (PowerShell)
$env:ADMIN_PASS="secret"; $env:RECRUITER_CODE="1234"; $env:SESSION_SECRET="dev"; node server.js
# open http://localhost:8080
```

The server creates `data/` and `data/uploads/` locally if they don't exist and seeds `data/config.json` from `data-seed/config.json`.

## Deployment

Hosted on **Railway** at **patrickdev.work**. Push to `main` on `pat1322/Patrick-Dev-Portfolio` — Railway auto-redeploys via the Dockerfile.

- `Dockerfile` — node:20-alpine image, installs dependencies, copies site files, starts with entrypoint
- `docker-entrypoint.sh` — sed-replaces credentials in gate.js, then runs `node server.js`
- `railway.json` — tells Railway to use the Dockerfile builder

Required Railway Variables:
- `RECRUITER_CODE` — 4-digit recruiter PIN
- `ADMIN_PASS` — admin password
- `SESSION_SECRET` — session signing secret

Required Railway Volume:
- Mount path: `/app/data`

SSL is handled automatically by Railway (Let's Encrypt). Do not configure SSL inside the app.

## Coding Conventions

- Indentation: 2 spaces in HTML/CSS/JS
- No TypeScript, no JSX, no modules
- Keep JS in `<script>` tags at the bottom of HTML files (before `</body>`)
- Class naming: Bootstrap conventions + custom BEM-ish names for new components
- Gate CSS namespace: `#gx-ov` and `.gx-*` (avoids conflicts with golden-noir `.pg-*` classes)
- Config attributes: `data-cfg="fieldname"` for text, `data-cfg-href="fieldname"` for links
- Sensitive elements: `class="sensitive"` — blurred by CSS for guest role
- Server routes: REST-style under `/api/`; all write routes require `requireAuth` middleware
