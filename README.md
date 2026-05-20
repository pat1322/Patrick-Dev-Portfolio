# Patrick Perez — Developer Portfolio

A personal developer portfolio built with pure HTML, CSS, and vanilla JavaScript — no build step, no framework. Features a golden-noir art-deco aesthetic, a security gate with role-based access, a browser-based admin CMS, a floating music player, and a Node.js/Express server that persists content to a Railway Volume so edits go live instantly without any git push.

**Live site: [patrickdev.work](https://patrickdev.work)**

---

## Features

- **Security gate** — visitors choose Guest, Recruiter (4-digit PIN), or Admin before entering; sensitive content is blurred for guests
- **Browser-based admin CMS** — edit every section (bio, skills, resume, projects, services, contact, images, music) via `admin.html`; changes save to the server in one click, no git push needed
- **Floating music player** — golden-noir widget plays YouTube audio (audio-only, no video) in the background; collapses to a pill or expands to a full card with waveform visualizer, progress bar, prev/next, and volume control; auto-plays after gate dismissal if enabled
- **Direct image uploads** — upload profile photos and portfolio card images from the admin panel; files stored on the Railway Volume
- **Config-driven content** — `data/config.json` (on the Volume) drives all dynamic sections; hardcoded values in `index.html` are fallbacks
- **Scroll progress bar** — gold gradient bar at the top of the viewport tracks scroll depth
- **3D morphing section transitions** — each section folds in with a perspective tilt as it enters the viewport (GSAP ScrollTrigger)
- **Glitch text animation** — custom vanilla JS character-glitch cycling in the sidebar hero panel
- **Cinematic hero** — Three.js 3D scene with GSAP-choreographed acts, wipe transitions, and particle parallax
- **Puzzle hero reveal** — hero background assembles tile-by-tile after the splash screen
- **Animated skill rows** — auto-scrolling carousel of tech stack badges
- **Timeline resume** — tabbed Education / Experience view
- **Filterable portfolio grid** — filter by Mobile App, Web App, Hardware/IoT
- **Single project detail template** — `portfolio-details.html` serves all projects via `?project=<id>`; no duplicate pages
- **AOS scroll animations** — entrance animations throughout, deferred until after the splash screen
- **Responsive sidebar layout** — collapses to hamburger on mobile

---

## Project Structure

```
pat-portfolio/
├── index.html                  # Main single-page portfolio
├── portfolio-details.html      # Shared project detail template (driven via ?project=id)
├── admin.html                  # Browser-based admin CMS (password-protected)
├── server.js                   # Node.js/Express server — API + static file serving
├── package.json                # Node dependencies
├── .env                        # Local dev secrets — gitignored, never commit
├── .env.example                # Template for .env (safe to commit)
├── data/
│   └── config.json             # Live site config (persisted to Railway Volume)
├── data-seed/
│   └── config.json             # Default config seeded on first boot
├── Dockerfile                  # node:20-alpine image for Railway
├── docker-entrypoint.sh        # Injects Railway credentials into gate.js, starts Node server
├── railway.json                # Railway build config (Dockerfile builder)
├── assets/
│   ├── css/
│   │   ├── main.css            # Vendor/base styles
│   │   └── golden-noir.css     # Custom golden-noir theme
│   ├── js/
│   │   ├── main.js             # AOS, glitch animation, Swiper, scroll-spy, header toggle
│   │   └── gate.js             # Security gate overlay, role-based blur, anti-scraping
│   ├── img/
│   │   ├── portfolio/          # Project card images
│   │   └── ...                 # Profile photo, hero background, about GIF, favicon
│   └── vendor/                 # Third-party libraries (Bootstrap, AOS, Swiper, GSAP)
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── suggestion.md
│   └── PULL_REQUEST_TEMPLATE.md
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

All site content is managed through the admin panel at `/admin.html` (requires admin password at the security gate).

### Admin panel sections

| Section | What you can edit |
|---|---|
| Hero / Profile | Name, title, sidebar role label, glitch phrases |
| About | Quote, bio, competency highlights, personal info card |
| Summary of Work | Service cards (icon, title, description, tags) |
| Professional Journey | Work experience and education timeline entries |
| Portfolio | Project cards (title, category, image upload, tags, link) |
| Skills | Skill names displayed in the animated carousel |
| Achievements | Stat cards, certifications, and milestone cards |
| Contact | Phone, email, location, social links |
| Links | Resume URL, YouTube video ID |
| Images | Upload profile photo, hero background, about GIF directly |
| Music Player | Enable/disable widget, autoplay toggle, volume, YouTube playlist |
| Guest Blurring | Toggle which elements are blurred for guest visitors |
| Publish | One-click save to server — live instantly, no deploy needed |
| Export / Backup | Download `config.json` as a local backup |

### Publishing workflow

1. Log in to the admin panel (Admin role at the security gate)
2. Edit any section and click **Save Changes** — changes appear in your browser immediately via localStorage preview
3. Click **Save & Publish to Server** on the Publish page — writes directly to `data/config.json` on the Railway Volume; the live site reflects changes on the next page load

### Adding a project

1. In the admin panel → Portfolio, click **Add Project**
2. Fill in the title, category, tags, and description
3. Click **Upload** next to the card image to upload a screenshot from your computer
4. Click **Save & Publish to Server** — done, no git push needed

> For project *detail* pages (screenshots gallery, full description): add an entry to the `projects` object in `portfolio-details.html` and push to git.

### Setting up the music player

1. Admin panel → **Music Player**
2. Check **Enable Music Player**
3. Paste YouTube video URLs into the playlist (one per line in the add-track fields)
4. Set volume and autoplay preference
5. Save & Publish — the widget will appear on the live site after visitors pass the gate

---

## API Routes

| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| `POST` | `/api/login` | — | Establish admin session |
| `GET` | `/api/auth` | — | Check session status |
| `POST` | `/api/logout` | — | Destroy session |
| `GET` | `/api/config` | — | Read `data/config.json` |
| `POST` | `/api/config` | Admin | Write `data/config.json` |
| `POST` | `/api/upload` | Admin | Upload image to `data/uploads/` |
| `DELETE` | `/api/upload/:file` | Admin | Delete uploaded image |

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
| JavaScript | Vanilla JS, AOS, Swiper, GSAP + ScrollTrigger, Three.js, YouTube IFrame API |
| Fonts | Google Fonts (Cormorant Garamond, Raleway) |
| Server | Node.js 20, Express, express-session, multer, dotenv |
| Hosting | Railway (Docker + node:20-alpine) |
| Persistent storage | Railway Volume mounted at `/app/data` |
| Domain | patrickdev.work |
| CI/CD | Railway auto-deploy on `git push main` |

---

## Local Development

```bash
git clone https://github.com/pat1322/Patrick-Dev-Portfolio.git
cd Patrick-Dev-Portfolio
npm install
cp .env.example .env   # then edit .env with your values
node server.js
# open http://localhost:8080
```

The server reads credentials from `.env` automatically via `dotenv`. The `.env` file is gitignored and will never be committed.

> The server is required — opening `index.html` directly via `file://` will not work correctly.

### Docker testing

```bash
docker build -t portfolio .
docker run -p 8080:8080 \
  -e RECRUITER_CODE=1234 \
  -e ADMIN_PASS=secret \
  -e SESSION_SECRET=dev \
  portfolio
# open http://localhost:8080
```

---

## Deployment

Every push to `main` triggers an automatic Railway redeploy.

### How it works

1. Railway detects the `Dockerfile` and builds a `node:20-alpine` image
2. `docker-entrypoint.sh` injects `$RECRUITER_CODE` / `$ADMIN_PASS` into `gate.js`, then starts `node server.js`
3. Express serves all static files and handles the admin API
4. `data/config.json` and uploaded images live on the Railway Volume at `/app/data` and survive redeploys

### First-time Railway setup

After the first deploy, configure the Volume and environment variables:

1. **Attach a Volume** — Railway dashboard → your service → **Volumes** tab → **Add Volume**
   - Mount path: `/app/data`
   - 1 GB is plenty for a portfolio
2. **Set environment variables** — Railway dashboard → **Variables**:

| Variable | Purpose |
|---|---|
| `RECRUITER_CODE` | 4-digit recruiter PIN |
| `ADMIN_PASS` | Admin panel password |
| `SESSION_SECRET` | Random secret for session signing (keep private) |
| `PORT` | Injected automatically by Railway — do not set manually |

3. **Trigger a redeploy** after adding the Volume and variables

---

## License

MIT — see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
