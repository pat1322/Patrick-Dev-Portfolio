# Contributing

Thanks for your interest in contributing. This is a personal portfolio, so the scope for external contributions is narrow — but bug reports, accessibility fixes, and performance improvements are welcome.

## What you can contribute

- **Bug fixes** — broken links, layout issues, JS errors, API errors
- **Accessibility improvements** — ARIA labels, keyboard navigation, contrast fixes
- **Performance improvements** — image optimization, unused CSS removal
- **Typo / copy fixes** — corrections to visible text content

Please **do not** open PRs that change personal content (bio, resume entries, project descriptions, contact info, credentials) — that content is managed by the site owner via the admin panel.

## Getting started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/Patrick-Dev-Portfolio.git
   cd Patrick-Dev-Portfolio
   ```
3. Install dependencies and start the dev server:
   ```bash
   npm install
   ```
   On Linux / macOS:
   ```bash
   ADMIN_PASS=secret RECRUITER_CODE=1234 SESSION_SECRET=dev node server.js
   ```
   On Windows (PowerShell):
   ```powershell
   $env:ADMIN_PASS="secret"; $env:RECRUITER_CODE="1234"; $env:SESSION_SECRET="dev"; node server.js
   ```
4. Open `http://localhost:8080`
5. Make your changes and test in at least one modern browser

> The server is required — `data/config.json` and uploaded images are served through it. Opening `index.html` directly via `file://` will not work correctly.

## Key files to know

| File | Role |
|------|------|
| `index.html` | Main page — custom styles live in its `<style>` block |
| `server.js` | Express server — API routes and static file serving |
| `assets/css/golden-noir.css` | Golden-noir theme (hero, sidebar panel, glitch animation) |
| `assets/js/gate.js` | Security gate — touch carefully |
| `data/config.json` | Live content config — do not edit personal data here |

The security gate (`gate.js`) uses `RECRUITER_CODE_PLACEHOLDER` and `ADMIN_PASS_PLACEHOLDER` as placeholder strings that get replaced by Railway environment variables at deploy time. Do not replace them with real values in any committed file.

## Pull request guidelines

- Keep PRs small and focused on one change
- Describe what you changed and why in the PR description
- If fixing a visual bug, include a before/after screenshot
- Do not commit `data/config.json` changes — that file is managed by the site owner via the admin panel
- Do not commit anything inside `data/uploads/` — that directory is managed at runtime on the Railway Volume

## Reporting issues

Open a [GitHub Issue](https://github.com/pat1322/Patrick-Dev-Portfolio/issues) and include:

- What you expected to happen
- What actually happened
- Browser, OS, and device
- Screenshot or recording if it is a visual issue
- Whether the issue occurs on the live site, locally, or both
