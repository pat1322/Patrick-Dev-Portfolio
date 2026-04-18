/* ═══════════════════════════════════════════════════════
   PATRICK PEREZ — main.js v2
═══════════════════════════════════════════════════════ */

(async function () {
  'use strict';

  // ── FETCH DATA ─────────────────────────────────────────
  let data = {};
  try {
    const res = await fetch('/api/data');
    data = await res.json();
  } catch (e) {
    console.error('Failed to load portfolio data', e);
  }

  // ── SPLASH SCREEN ──────────────────────────────────────
  function hideSplash() {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.classList.add('hidden');
      setTimeout(() => splash.remove(), 700);
    }
  }
  window.addEventListener('load', () => setTimeout(hideSplash, 1400));

  // ── CUSTOM CURSOR ──────────────────────────────────────
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (dot && ring && window.matchMedia('(pointer:fine)').matches) {
    let ringX = 0, ringY = 0;
    const LERP = 0.14;
    document.addEventListener('mousemove', e => {
      dot.style.left  = e.clientX + 'px';
      dot.style.top   = e.clientY + 'px';
    });
    (function animateRing() {
      const dotRect = dot.getBoundingClientRect();
      const tx = parseFloat(dot.style.left) || 0;
      const ty = parseFloat(dot.style.top)  || 0;
      ringX += (tx - ringX) * LERP;
      ringY += (ty - ringY) * LERP;
      ring.style.left = ringX + 'px';
      ring.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    })();
    document.querySelectorAll('a, button, .project-card, .skill-badge').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ── SCROLL PROGRESS ────────────────────────────────────
  const progressBar = document.getElementById('scroll-progress');
  function updateProgress() {
    const max  = document.documentElement.scrollHeight - window.innerHeight;
    const pct  = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  // ── HEADER SCROLL STATE ────────────────────────────────
  const header = document.getElementById('header');
  const scrollTopBtn = document.getElementById('scroll-top');
  function onScroll() {
    updateProgress();
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
    highlightNavLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── SCROLL TOP ─────────────────────────────────────────
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── MOBILE NAV ─────────────────────────────────────────
  const navToggle = document.getElementById('nav-toggle');
  const navLinks  = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  // ── NAV SCROLLSPY ──────────────────────────────────────
  function highlightNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY  = window.scrollY + 100;
    sections.forEach(sec => {
      const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`);
      if (!link) return;
      const inView = scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight;
      link.classList.toggle('active', inView);
    });
  }

  // ── AOS ────────────────────────────────────────────────
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 60 });
  }

  // ── FOOTER YEAR ────────────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── RENDER: META ───────────────────────────────────────
  if (data.name) {
    document.title = `${data.name} — ${data.title || 'Portfolio'}`;
    const heroName = document.getElementById('hero-name');
    if (heroName) heroName.textContent = data.name;
  }
  const heroTagline = document.getElementById('hero-tagline');
  if (heroTagline && data.tagline) heroTagline.textContent = data.tagline;

  // Profile images
  if (data.profileImage) {
    const staticImg = document.getElementById('profile-img-static');
    if (staticImg) staticImg.src = data.profileImage;
  }
  if (data.profileGif) {
    const gifImg = document.getElementById('profile-img-gif');
    if (gifImg) gifImg.src = data.profileGif;
  }

  // ── RENDER: SOCIALS ────────────────────────────────────
  function buildSocials(el, size = 40) {
    if (!el || !data.social) return;
    const icons = { facebook: 'bi-facebook', github: 'bi-github', linkedin: 'bi-linkedin', twitter: 'bi-twitter-x', instagram: 'bi-instagram' };
    el.innerHTML = Object.entries(data.social)
      .filter(([, url]) => url)
      .map(([k, url]) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${k}"><i class="bi ${icons[k] || 'bi-link-45deg'}"></i></a>`)
      .join('');
  }
  buildSocials(document.getElementById('hero-socials'));
  buildSocials(document.getElementById('footer-socials'));

  // ── RENDER: TYPED.JS ───────────────────────────────────
  if (typeof Typed !== 'undefined') {
    const typedEl = document.getElementById('typed-text');
    const roles = data.typedRoles || ['Software Engineer'];
    if (typedEl) {
      new Typed('#typed-text', {
        strings: roles, loop: true,
        typeSpeed: 80, backSpeed: 40, backDelay: 2000
      });
    }
  }

  // ── RENDER: ABOUT ──────────────────────────────────────
  const bioPara = document.getElementById('about-bio');
  if (bioPara && data.bio) bioPara.textContent = data.bio;

  const infoLocation = document.getElementById('info-location');
  if (infoLocation && data.location) infoLocation.textContent = data.location;

  const infoEmail = document.getElementById('info-email');
  if (infoEmail && data.email) {
    infoEmail.textContent = data.email;
    infoEmail.href = `mailto:${data.email}`;
  }

  const infoWebsite = document.getElementById('info-website');
  if (infoWebsite && data.website) infoWebsite.textContent = data.website;

  const aboutResumeBtn = document.getElementById('about-resume-btn');
  if (aboutResumeBtn && data.resumeUrl) aboutResumeBtn.href = data.resumeUrl;

  const resumeBtn = document.getElementById('resume-btn');
  if (resumeBtn && data.resumeUrl) resumeBtn.href = data.resumeUrl;

  // Services
  const servicesGrid = document.getElementById('services-grid');
  if (servicesGrid && data.services) {
    servicesGrid.innerHTML = data.services.map(s => `
      <div class="service-card">
        <i class="bi ${s.icon}"></i>
        <h4>${s.title}</h4>
        <p>${s.description}</p>
      </div>`).join('');
  }

  // ── RENDER: SKILLS ─────────────────────────────────────
  function buildMarquee(el, skills) {
    if (!el) return;
    const badges = skills.map(s => `
      <div class="skill-badge">
        <img src="${s.icon}" alt="${s.name}" onerror="this.style.display='none'">
        <span>${s.name}</span>
      </div>`).join('');
    // Double for seamless loop
    el.innerHTML = badges + badges;
  }
  if (data.skills) {
    const half = Math.ceil(data.skills.length / 2);
    buildMarquee(document.getElementById('skills-row-1'), data.skills.slice(0, half));
    buildMarquee(document.getElementById('skills-row-2'), data.skills.slice(half));
  }

  // ── RENDER: EXPERIENCE ─────────────────────────────────
  function buildTimeline(el, items, type) {
    if (!el) return;
    el.innerHTML = items.map(item => {
      if (type === 'experience') {
        return `
          <div class="timeline-item" data-aos="fade-up">
            <span class="timeline-period">${item.period}</span>
            <h3 class="timeline-title">${item.title}</h3>
            <p class="timeline-company"><i class="bi bi-building me-1"></i>${item.company} · ${item.location}</p>
            <p class="timeline-desc">${item.description}</p>
            <ul class="timeline-highlights">
              ${(item.highlights || []).map(h => `<li>${h}</li>`).join('')}
            </ul>
          </div>`;
      } else {
        return `
          <div class="timeline-item" data-aos="fade-up">
            <span class="timeline-period">${item.period}</span>
            <h3 class="timeline-title">${item.degree}</h3>
            <p class="timeline-company"><i class="bi bi-geo-alt me-1"></i>${item.school} · ${item.location}</p>
            <p class="timeline-desc">${item.description}</p>
            <div class="timeline-badges">
              ${(item.highlights || []).map(h => `<span class="timeline-badge">${h}</span>`).join('')}
            </div>
          </div>`;
      }
    }).join('');
  }
  if (data.experience) buildTimeline(document.getElementById('timeline-experience'), data.experience, 'experience');
  if (data.education)  buildTimeline(document.getElementById('timeline-education'),  data.education,  'education');

  // Timeline tab switching
  document.querySelectorAll('.timeline-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.timeline-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.dataset.tab;
      document.getElementById('timeline-experience').classList.toggle('hidden', target !== 'experience');
      document.getElementById('timeline-education').classList.toggle('hidden',  target !== 'education');
      if (typeof AOS !== 'undefined') AOS.refresh();
    });
  });

  // ── RENDER: PROJECTS ───────────────────────────────────
  const projectsGrid = document.getElementById('projects-grid');
  if (projectsGrid && data.projects) {
    projectsGrid.innerHTML = data.projects.map(p => `
      <a href="/portfolio-details.html?project=${p.id}" class="project-card" data-category="${p.category}">
        <div class="project-thumb">
          <img src="${p.thumbnail}" alt="${p.title}" loading="lazy">
          <div class="project-overlay">
            <i class="bi bi-arrow-up-right project-link-icon"></i>
          </div>
        </div>
        <div class="project-body">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-tags">${(p.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('')}</div>
        </div>
      </a>`).join('');
  }

  // Project filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      document.querySelectorAll('.project-card').forEach(card => {
        const show = f === 'all' || card.dataset.category === f;
        card.classList.toggle('filtered-out', !show);
      });
    });
  });

  // ── RENDER: CONTACT LINKS ──────────────────────────────
  const contactLinks = document.getElementById('contact-links');
  if (contactLinks && data.email) {
    const links = [];
    if (data.email)    links.push({ icon: 'bi-envelope-fill',  text: data.email,    href: `mailto:${data.email}` });
    if (data.location) links.push({ icon: 'bi-geo-alt-fill',   text: data.location, href: '#' });
    if (data.social?.github)   links.push({ icon: 'bi-github',   text: 'github.com/pat1322', href: data.social.github });
    if (data.social?.linkedin) links.push({ icon: 'bi-linkedin', text: 'LinkedIn',            href: data.social.linkedin });
    contactLinks.innerHTML = links.map(l => `
      <a href="${l.href}" target="_blank" rel="noopener" class="contact-link">
        <i class="bi ${l.icon}"></i>${l.text}
      </a>`).join('');
  }

  // ── CONTACT FORM ───────────────────────────────────────
  if (typeof emailjs !== 'undefined') {
    emailjs.init('V3-hIRVSWCVZWhKwC');
  }
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending…';
      formStatus.className = '';
      formStatus.textContent = '';
      try {
        await emailjs.send('service_p7fxuq2', 'template_198p0dl', {
          name:    contactForm.name.value,
          email:   contactForm.email.value,
          subject: contactForm.subject.value,
          message: contactForm.message.value
        });
        formStatus.className = 'success';
        formStatus.textContent = '✓ Message sent! I\'ll get back to you soon.';
        contactForm.reset();
      } catch {
        formStatus.className = 'error';
        formStatus.textContent = '✕ Something went wrong. Please email me directly.';
      }
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-send me-2"></i>Send Message';
    });
  }

  // ── 3D PROFILE TILT ────────────────────────────────────
  const card = document.getElementById('profile-card');
  if (card && typeof gsap !== 'undefined') {
    const MAX_TILT = 12;
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      gsap.to(card, { rotateY: x * MAX_TILT * 2, rotateX: -y * MAX_TILT * 2, duration: 0.3, ease: 'power1.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  }

})();
