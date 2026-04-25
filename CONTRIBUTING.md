# Contributing

Thanks for your interest in contributing. This is a personal portfolio, so the scope for external contributions is narrow — but bug reports, accessibility fixes, and performance improvements are welcome.

## What you can contribute

- **Bug fixes** — broken links, layout issues, JS errors
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
3. Serve locally (required — `data/config.json` is fetched via HTTP):
   ```bash
   # Python
   python -m http.server 8080

   # Node
   npx serve .
   ```
   Then open `http://localhost:8080`

4. Make your changes and test in at least one modern browser

## Key files to know

| File | Role |
|------|------|
| `index.html` | Main page — custom styles live in its `<style>` block |
| `assets/css/golden-noir.css` | Golden-noir theme (hero, sidebar panel, glitch animation) |
| `assets/js/gate.js` | Security gate — touch carefully |
| `data/config.json` | Live content config — do not edit personal data here |

The security gate (`gate.js`) uses `RECRUITER_CODE_PLACEHOLDER` and `ADMIN_PASS_PLACEHOLDER` as placeholder strings that get replaced by Railway environment variables at deploy time. Do not replace them with real values.

## Pull request guidelines

- Keep PRs small and focused on one change
- Describe what you changed and why in the PR description
- If fixing a visual bug, include a before/after screenshot
- Do not commit `data/config.json` changes — that file is managed by the site owner

## Reporting issues

Open a [GitHub Issue](https://github.com/pat1322/Patrick-Dev-Portfolio/issues) and include:

- What you expected to happen
- What actually happened
- Browser and OS version
- Screenshot or recording if it's a visual issue
