# CLAUDE.md

This file tells Claude Code how to work with this repository.

## Project Overview

Static personal developer portfolio — no build step, no package manager, no framework. Pure HTML/CSS/JS served by nginx on Railway. Content is driven by `data/config.json` (written by the admin panel); hardcoded values in `index.html` are fallbacks when no config exists.

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main single-page portfolio — hero, about, skills, services, resume, portfolio, achievements, contact |
| `portfolio-details.html` | Single template for all project detail pages, driven by `?project=<id>` query param |
| `admin.html` | Browser-based admin CMS — edits all sections, publishes to GitHub via API |
| `data/config.json` | Live site config — committed here overrides all hardcoded content in index.html |
| `assets/css/main.css` | Vendor/base styles (Bootstrap, AOS, Swiper) |
| `assets/css/golden-noir.css` | Custom golden-noir theme — hero section, sidebar hero panel, glitch animation |
| `assets/js/main.js` | Shared JS — AOS init, glitch animation, Swiper, Isotope, scroll-spy, header toggle |
| `assets/js/gate.js` | Security gate — overlay, 3-role access (guest/recruiter/admin), role-based blur, anti-scraping |
| `docker-entrypoint.sh` | Injects `$PORT`, `$RECRUITER_CODE`, `$ADMIN_PASS` at container start |

## Architecture Decisions

- **Config-driven content**: `data/config.json` is fetched by the config loader at the bottom of `index.html` and re-renders every dynamic section (about, services, resume timeline, portfolio grid, etc.). Hardcoded HTML is the fallback. The admin panel writes this file via the GitHub API.
- **Admin panel publishes via GitHub API**: `admin.html` calls `PUT /repos/.../contents/data/config.json` with a user-supplied GitHub PAT. No server-side logic needed.
- **Instant preview via localStorage**: The admin panel also writes `pfConfig` to localStorage. The config loader in `index.html` checks localStorage first (instant preview for the admin's browser), then falls back to `data/config.json`.
- **Security gate is synchronous**: `gate.js` is the first script in `<body>` and runs synchronously before the page renders. It sets `window.pfGateActive = true` and `html.gate-active` so all other scripts can defer initialization.
- **Credentials from Railway env vars**: `RECRUITER_CODE` and `ADMIN_PASS` are injected into `gate.js` by `docker-entrypoint.sh` using `sed`. They are never hardcoded. If unset, the placeholder strings remain and those roles are inaccessible.
- **Single project detail template**: All projects share `portfolio-details.html`. Project data lives in a JS object at the bottom of that file. Do NOT create separate per-project HTML files.
- **No build tooling**: Edit HTML/CSS/JS files directly. There is no Sass compilation, bundler, or transpiler.
- **Custom styles in `index.html`**: The main CSS is split between `assets/css/main.css` (vendor/base), `assets/css/golden-noir.css` (theme), and a large `<style>` block in `index.html` (component styles). Keep custom component styles in `index.html`'s `<style>` block.
- **Vendor libraries**: Loaded from `assets/vendor/`. Do not add CDN links for libraries already present locally.
- **Animation timing**: All one-shot animations (hero scanner, glitch phrases) are frozen by `body.pre-reveal` until `startPuzzleReveal()` fires after the splash screen. AOS is deferred behind `gateDismissed` event.

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

Via admin panel (preferred):
1. Drop screenshots into `assets/img/portfolio/`
2. Add project data to the `projects` object in `portfolio-details.html`
3. Admin panel → Portfolio → Add Project → fill fields → Save & Publish

Manually:
1. Drop screenshots into `assets/img/portfolio/`
2. Add an entry to the `projects` object in `portfolio-details.html`
3. Edit `data/config.json` → add to the `projects` array

## Deployment

Hosted on **Railway** at **patrickdev.work**. Push to `main` on `pat1322/Patrick-Dev-Portfolio` — Railway auto-redeploys via the Dockerfile.

- `Dockerfile` — nginx:alpine image, copies site files, listens on `$PORT`
- `nginx.conf` — uses `PORT_PLACEHOLDER`, swapped at runtime by `docker-entrypoint.sh`
- `docker-entrypoint.sh` — sed-replaces `PORT_PLACEHOLDER`, `RECRUITER_CODE_PLACEHOLDER`, `ADMIN_PASS_PLACEHOLDER`
- `railway.json` — tells Railway to use the Dockerfile builder

Required Railway Variables:
- `RECRUITER_CODE` — 4-digit recruiter PIN
- `ADMIN_PASS` — admin password

SSL is handled automatically by Railway (Let's Encrypt). Do not configure SSL inside nginx.

## Coding Conventions

- Indentation: 2 spaces in HTML/CSS/JS
- No TypeScript, no JSX, no modules
- Keep JS in `<script>` tags at the bottom of HTML files (before `</body>`)
- Class naming: Bootstrap conventions + custom BEM-ish names for new components
- Gate CSS namespace: `#gx-ov` and `.gx-*` (avoids conflicts with golden-noir `.pg-*` classes)
- Config attributes: `data-cfg="fieldname"` for text, `data-cfg-href="fieldname"` for links
- Sensitive elements: `class="sensitive"` — blurred by CSS for guest role
