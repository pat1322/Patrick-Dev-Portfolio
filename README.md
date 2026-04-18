# Patrick Perez — Dev Portfolio

A personal developer portfolio built with Bootstrap 5, vanilla JavaScript, and custom CSS. Features a cyberpunk/gaming aesthetic with a GTA-mode hero toggle, animated skill rows, timeline resume, filterable portfolio grid, and a contact form powered by EmailJS.

Live site: [pat1322.github.io/Patrick-Dev-Portfolio](https://pat1322.github.io/Patrick-Dev-Portfolio) *(or your current deployment URL)*

---

## Features

- **GTA Mode toggle** — switches the hero section to a GTA San Andreas-inspired dark theme with animated effects
- **Animated skill rows** — auto-scrolling carousel of tech stack badges
- **Timeline resume** — tabbed Education / Experience view
- **Filterable portfolio grid** — filter projects by category (Mobile App, Web App, Windows/IoT)
- **Single project detail template** — `portfolio-details.html` serves all 9 projects via `?project=<id>` URL param; no duplicate pages
- **EmailJS contact form** — sends messages without a backend
- **AOS scroll animations** — entrance animations throughout
- **Responsive sidebar layout** — collapses to hamburger on mobile

---

## Project Structure

```
pat-portfolio/
├── index.html                  # Main single-page portfolio
├── portfolio-details.html      # Shared project detail template (data-driven)
├── assets/
│   ├── css/
│   │   └── main.css            # Main stylesheet
│   ├── js/
│   │   └── main.js             # Shared JS (AOS, Typed, Swiper, Isotope, scrollspy)
│   ├── img/
│   │   ├── portfolio/          # Project screenshot images
│   │   └── ...                 # Profile photo, hero backgrounds, GIF, etc.
│   ├── sounds/
│   │   └── gta-theme.mp3       # GTA mode audio
│   └── vendor/                 # Third-party libraries (Bootstrap, AOS, Swiper, etc.)
├── .gitignore
├── CLAUDE.md
├── LICENSE
├── CONTRIBUTING.md
├── SECURITY.md
└── CODE_OF_CONDUCT.md
```

---

## Adding a New Project

1. Add your screenshot(s) to `assets/img/portfolio/`
2. Open `portfolio-details.html` and add a new entry to the `projects` object:

```js
'your-project-id': {
  title: 'Your Project Title',
  images: ['your-image.png'],
  info: [
    { label: 'Category',     value: 'Web App' },
    { label: 'Project date', value: 'Month, Year' },
    { label: 'Project URL',  value: '<a href="https://...">Live Demo</a>' }
  ],
  description: 'Short description of the project.'
}
```

3. Add a portfolio card in `index.html` inside the `.portfolio-container` div:

```html
<div class="col-lg-4 col-md-6 portfolio-item filter-webapp">
  <a href="portfolio-details.html?project=your-project-id" class="portfolio-card">
    <div class="portfolio-img">
      <img src="assets/img/portfolio/your-image.png" class="img-fluid" alt="Your Project">
    </div>
    <div class="portfolio-info">
      <h4>Your Project Title</h4>
      <p>Short tagline</p>
      <div class="portfolio-tags">
        <span class="tag">Tag1</span>
      </div>
    </div>
  </a>
</div>
```

Available filter classes: `filter-mobapp`, `filter-webapp`, `filter-windows`

---

## Tech Stack

| Layer       | Technology                                      |
|-------------|-------------------------------------------------|
| Structure   | HTML5                                           |
| Styling     | CSS3, Bootstrap 5                               |
| Icons       | Bootstrap Icons                                 |
| JavaScript  | Vanilla JS, AOS, Typed.js, Swiper, Isotope      |
| Fonts       | Google Fonts (Roboto, Poppins, Raleway, Orbitron, Chakra Petch, Press Start 2P) |
| Email       | EmailJS                                         |
| Animation   | GSAP, AOS                                       |
| Hosting     | GitHub Pages                                    |

---

## Local Development

No build step required — open `index.html` directly in a browser, or serve it with any static file server:

```bash
# Python
python -m http.server 8080

# Node (npx)
npx serve .
```

---

## License

MIT — see [LICENSE](LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
