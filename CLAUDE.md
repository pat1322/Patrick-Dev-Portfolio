# CLAUDE.md

This file tells Claude Code how to work with this repository.

## Project Overview

Static personal developer portfolio — no build step, no package manager, no framework. Pure HTML/CSS/JS served directly from the file system or GitHub Pages.

## Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main single-page portfolio (hero, about, skills, resume, portfolio grid, contact) |
| `portfolio-details.html` | Single template for all project detail pages, driven by `?project=<id>` query param |
| `assets/css/main.css` | Main stylesheet |
| `assets/js/main.js` | Shared JS — AOS init, Typed.js, Swiper, Isotope, scroll-spy, header toggle |

## Architecture Decisions

- **Single project detail template**: All 9 projects share `portfolio-details.html`. Project data lives in a JS object at the bottom of that file. Do NOT create separate per-project HTML files.
- **No build tooling**: Edit HTML/CSS/JS files directly. There is no Sass compilation, bundler, or transpiler.
- **Inline `<style>` blocks**: The main CSS is split between `assets/css/main.css` (vendor/base styles) and a large `<style>` block inside `index.html` (custom component styles). This is intentional — keep custom styles in `index.html`'s `<style>` block.
- **Vendor libraries**: Loaded from `assets/vendor/`. Do not add CDN links for libraries already present locally.

## Removed Libraries (do not restore without explicit request)

These were deleted from disk and references cleaned up:
- `glightbox` — lightbox gallery
- `purecounter` — animated stat counters
- `waypoints` — scroll-triggered events

## Adding a Project

1. Drop screenshots into `assets/img/portfolio/`
2. Add an entry to the `projects` object in `portfolio-details.html`
3. Add a card to the `.portfolio-container` in `index.html` with `href="portfolio-details.html?project=<id>"`

## Deployment

Push to `main` on `pat1322/Patrick-Dev-Portfolio` — GitHub Pages serves directly from the root.

## Coding Conventions

- Indentation: 2 spaces in HTML/CSS, 2 spaces in JS
- No TypeScript, no JSX, no modules
- Keep JS in `<script>` tags at the bottom of HTML files (before `</body>`)
- Class naming follows Bootstrap conventions + custom BEM-ish names for new components
