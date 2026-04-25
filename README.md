# Patrick Perez — Developer Portfolio

A personal developer portfolio built with pure HTML, CSS, and vanilla JavaScript — no build step, no framework. Features a golden-noir art-deco aesthetic, a security gate with role-based access, a browser-based admin CMS, and one-click publishing to GitHub via the GitHub API.

**Live site: [patrickdev.work](https://patrickdev.work)**

---

## Features

- **Security gate** — visitors choose Guest, Recruiter (4-digit PIN), or Admin before entering; sensitive content is blurred for guests
- **Browser-based admin CMS** — edit every section of the portfolio (bio, skills, resume, projects, services, contact) via `admin.html`; changes preview instantly and publish to GitHub in one click
- **Config-driven content** — `data/config.json` drives all dynamic sections; hardcoded values in `index.html` serve as fallbacks
- **Glitch text animation** — custom vanilla JS character-glitch cycling replaces Typed.js in the sidebar hero panel
- **Puzzle hero reveal** — hero background assembles tile-by-tile after the splash screen
- **Animated skill rows** — auto-scrolling carousel of tech stack badges
- **Timeline resume** — tabbed Education / Experience view
- **Filterable portfolio grid** — filter by Mobile App, Web App, Hardware/IoT
- **Single project detail template** — `portfolio-details.html` serves all projects via `?project=<id>`; no duplicate pages
- **EmailJS contact form** — messages sent without a backend
- **AOS scroll animations** — entrance animations throughout, deferred until after the splash screen
- **Responsive sidebar layout** — collapses to hamburger on mobile

---

## Project Structure

```
pat-portfolio/
├── index.html                  # Main single-page portfolio
├── portfolio-details.html      # Shared project detail template (data-driven via ?project=id)
├── admin.html                  # Browser-based admin CMS (password-protected)
├── data/
│   └── config.json             # Live site config — committed here drives all dynamic content
├── Dockerfile                  # nginx:alpine image for Railway
├── nginx.conf                  # nginx config (PORT_PLACEHOLDER swapped at runtime)
├── docker-entrypoint.sh        # Injects $PORT + Railway credentials into gate.js at startup
├── railway.json                # Railway build config
├── assets/
│   ├── css/
│   │   ├── main.css            # Vendor/base styles
│   │   └── golden-noir.css     # Custom golden-noir theme (hero, sidebar panel, glitch animation)
│   ├── js/
│   │   ├── main.js             # AOS init, glitch animation, Swiper, scroll-spy, header toggle
│   │   └── gate.js             # Security gate overlay, role-based blur, anti-scraping
│   ├── img/
│   │   ├── portfolio/          # Project card images
│   │   └── ...                 # Profile photo, hero background, about GIF, favicon
│   └── vendor/                 # Third-party libraries (Bootstrap, AOS, Swiper, Isotope, GSAP)
├── .gitignore
├── .dockerignore
├── CLAUDE.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
└── CODE_OF_CONDUCT.md
```

---

## Content Management

All site content is managed through the admin panel at `/admin.html` (requires admin password).

### Admin panel sections

| Section | What you can edit |
|---|---|
| Hero / Profile | Name, title, sidebar role label, glitch phrases |
| About | Quote, bio, competency highlights, personal info card |
| Summary of Work | Service cards (icon, title, description, tags) |
| Professional Journey | Work experience and education timeline entries |
| Portfolio | Project cards (title, category, image, tags, link) |
| Skills | Skill names and proficiency percentages |
| Contact | Phone, email, location, social links |
| Links | Resume URL, YouTube video ID |
| Images | Profile photo, hero background, about GIF |
| Guest Blurring | Toggle which elements are blurred for guest visitors |
| Publish | One-click publish to GitHub via GitHub API |

### Publishing workflow

1. Log in to the admin panel (Admin role at the security gate)
2. Edit any section and click **Save Changes** — changes appear immediately in your browser
3. Go to **Publish**, enter your GitHub Personal Access Token, click **Save & Publish to GitHub**
4. Railway detects the new commit and redeploys in ~30 seconds

### Adding a project

1. Add screenshot(s) to `assets/img/portfolio/`
2. Add project data to the `projects` object in `portfolio-details.html`
3. In the admin panel → Portfolio, add a project card entry and publish

---

## Security Gate

The site has a three-role access system managed by `assets/js/gate.js`:

| Role | How to enter | Access |
|---|---|---|
| Guest | Click Guest | Site visible; sensitive info (phone, email, LinkedIn, personal info) blurred |
| Recruiter | 4-digit PIN (printed on resume) | Full access |
| Admin | Password | Full access + redirected to admin.html |

Credentials are set as Railway environment variables — **never hardcoded**:
- `RECRUITER_CODE` — 4-digit PIN
- `ADMIN_PASS` — admin password

If either variable is unset, that access mode is disabled (fails safely).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS3, Bootstrap 5, custom golden-noir theme |
| Icons | Bootstrap Icons, devicons (CDN) |
| JavaScript | Vanilla JS, AOS, Swiper, Isotope, GSAP, EmailJS |
| Fonts | Google Fonts (Cormorant Garamond, Raleway) |
| Hosting | Railway (Docker + nginx:alpine) |
| Domain | patrickdev.work |
| CI/CD | Railway auto-deploy on `git push main` |

---

## Deployment

Every push to `main` triggers an automatic Railway redeploy.

### How it works

1. Railway detects the `Dockerfile` and builds an `nginx:alpine` image
2. `docker-entrypoint.sh` substitutes `$PORT` into `nginx.conf` and injects `$RECRUITER_CODE` / `$ADMIN_PASS` into `gate.js`
3. nginx serves static files with 1-year asset caching and security headers

### Required Railway environment variables

| Variable | Purpose |
|---|---|
| `RECRUITER_CODE` | 4-digit recruiter PIN |
| `ADMIN_PASS` | Admin panel password |
| `PORT` | Injected automatically by Railway |

### Local Docker testing

```bash
docker build -t portfolio .
docker run -p 8080:8080 -e RECRUITER_CODE=1234 -e ADMIN_PASS=secret portfolio
# open http://localhost:8080
```

### Local dev (no Docker)

No build step required:

```bash
# Python
python -m http.server 8080

# Node
npx serve .
```

Note: `data/config.json` is fetched via HTTP, so local dev requires a server (not `file://`).

---

## License

MIT — see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
