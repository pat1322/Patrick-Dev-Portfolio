/* ═══════════════════════════════════════════════════════
   ADMIN PANEL — admin.js
═══════════════════════════════════════════════════════ */

(async function () {
  'use strict';

  // ── AUTH CHECK ─────────────────────────────────────────
  try {
    const r = await fetch('/api/auth-check');
    const { authenticated } = await r.json();
    if (authenticated) showDashboard();
  } catch (e) {
    console.error(e);
  }

  // ── LOGIN ──────────────────────────────────────────────
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const togglePw = document.getElementById('toggle-pw');
  const pwInput = document.getElementById('login-password');

  togglePw.addEventListener('click', () => {
    const show = pwInput.type === 'password';
    pwInput.type = show ? 'text' : 'password';
    togglePw.innerHTML = show ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
  });

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Signing in…';
    loginError.classList.add('hidden');
    try {
      const r = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwInput.value })
      });
      if (r.ok) {
        showDashboard();
      } else {
        loginError.textContent = 'Incorrect password. Please try again.';
        loginError.classList.remove('hidden');
      }
    } catch {
      loginError.textContent = 'Network error. Is the server running?';
      loginError.classList.remove('hidden');
    }
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-box-arrow-in-right me-2"></i>Sign In';
  });

  // ── LOGOUT ─────────────────────────────────────────────
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    pwInput.value = '';
  });

  // ── SHOW DASHBOARD ─────────────────────────────────────
  let data = {};
  async function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    data = await loadData();
    populateProfile(data);
    renderSkills(data.skills || []);
    renderExperience(data.experience || []);
    renderEducation(data.education || []);
    renderProjects(data.projects || []);
    renderServices(data.services || []);
  }

  async function loadData() {
    const r = await fetch('/api/data');
    return r.json();
  }

  // ── SIDEBAR & TABS ─────────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabHeading = document.getElementById('tab-heading');
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarClose = document.getElementById('sidebar-close');

  navItems.forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const tab = item.dataset.tab;
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`tab-${tab}`).classList.add('active');
      tabHeading.textContent = item.querySelector('span').textContent;
      sidebar.classList.remove('open');
    });
  });

  menuToggle.addEventListener('click', () => sidebar.classList.add('open'));
  sidebarClose.addEventListener('click', () => sidebar.classList.remove('open'));
  document.addEventListener('click', e => {
    if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // ── TOAST ──────────────────────────────────────────────
  function toast(msg, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<i class="bi ${type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // ── IMAGE UPLOAD HELPER ────────────────────────────────
  async function uploadFile(file) {
    const fd = new FormData();
    fd.append('file', file);
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!r.ok) throw new Error('Upload failed');
    const { url } = await r.json();
    return url;
  }

  function wireUploadInput(inputId, previewId, urlInputId) {
    document.getElementById(inputId).addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const url = await uploadFile(file);
        document.getElementById(previewId).src = url;
        document.getElementById(urlInputId).value = url;
        toast('Image uploaded');
      } catch {
        toast('Upload failed', 'error');
      }
    });
    document.getElementById(urlInputId).addEventListener('input', e => {
      document.getElementById(previewId).src = e.target.value;
    });
  }
  wireUploadInput('upload-static', 'preview-static', 'p-profile-image');
  wireUploadInput('upload-gif', 'preview-gif', 'p-profile-gif');

  // ── PROFILE TAB ────────────────────────────────────────
  function populateProfile(d) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('p-name', d.name);
    set('p-title', d.title);
    set('p-tagline', d.tagline);
    set('p-bio', d.bio);
    set('p-location', d.location);
    set('p-email', d.email);
    set('p-website', d.website);
    set('p-resume', d.resumeUrl);
    set('p-profile-image', d.profileImage);
    set('p-profile-gif', d.profileGif);
    set('p-typed-roles', (d.typedRoles || []).join(', '));
    set('p-github', d.social?.github);
    set('p-linkedin', d.social?.linkedin);
    set('p-facebook', d.social?.facebook);
    set('p-twitter', d.social?.twitter);
    set('p-instagram', d.social?.instagram);
    if (d.profileImage) document.getElementById('preview-static').src = d.profileImage;
    if (d.profileGif)   document.getElementById('preview-gif').src   = d.profileGif;
  }

  document.getElementById('save-profile').addEventListener('click', async () => {
    const payload = {
      name:         document.getElementById('p-name').value,
      title:        document.getElementById('p-title').value,
      tagline:      document.getElementById('p-tagline').value,
      bio:          document.getElementById('p-bio').value,
      location:     document.getElementById('p-location').value,
      email:        document.getElementById('p-email').value,
      website:      document.getElementById('p-website').value,
      resumeUrl:    document.getElementById('p-resume').value,
      profileImage: document.getElementById('p-profile-image').value,
      profileGif:   document.getElementById('p-profile-gif').value,
      typedRoles:   document.getElementById('p-typed-roles').value.split(',').map(s => s.trim()).filter(Boolean),
      social: {
        github:    document.getElementById('p-github').value,
        linkedin:  document.getElementById('p-linkedin').value,
        facebook:  document.getElementById('p-facebook').value,
        twitter:   document.getElementById('p-twitter').value,
        instagram: document.getElementById('p-instagram').value,
      }
    };
    await saveData(payload);
  });

  async function saveData(payload) {
    try {
      const r = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (r.ok) toast('Saved successfully');
      else toast('Save failed', 'error');
    } catch {
      toast('Network error', 'error');
    }
  }

  async function patchField(field, value) {
    try {
      const r = await fetch(`/api/data/${field}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (r.ok) toast('Saved successfully');
      else toast('Save failed', 'error');
    } catch {
      toast('Network error', 'error');
    }
  }

  // ── SKILLS TAB ─────────────────────────────────────────
  let skills = [];
  function renderSkills(items) {
    skills = items;
    const list = document.getElementById('skills-list');
    list.innerHTML = '';
    skills.forEach((s, i) => list.appendChild(buildSkillCard(s, i)));
  }

  function buildSkillCard(s, i) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <img src="${s.icon || ''}" alt="" class="skill-icon-preview" onerror="this.style.opacity='.2'">
        <span class="item-card-title">${s.name || 'New Skill'}</span>
        <span class="item-card-badge">${s.category || ''}</span>
        <div class="item-card-actions">
          <button class="btn-danger delete-btn"><i class="bi bi-trash"></i></button>
        </div>
        <i class="bi bi-chevron-down item-card-chevron"></i>
      </div>
      <div class="item-card-body">
        <div class="form-row">
          <div class="field-group"><label>Name</label><input type="text" class="sk-name" value="${esc(s.name)}"></div>
          <div class="field-group">
            <label>Category</label>
            <select class="sk-category">
              ${['Backend','Frontend','Database','DevOps','Other'].map(c =>
                `<option${c === s.category ? ' selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field-group"><label>Icon URL</label><input type="text" class="sk-icon" value="${esc(s.icon)}"></div>
      </div>`;
    wireItemCard(card, i, skills, 'sk-name', (el, d) => {
      d.name     = el.querySelector('.sk-name').value;
      d.category = el.querySelector('.sk-category').value;
      d.icon     = el.querySelector('.sk-icon').value;
      el.querySelector('.item-card-title').textContent = d.name || 'New Skill';
      el.querySelector('.item-card-badge').textContent = d.category;
      const img = el.querySelector('.skill-icon-preview');
      img.src = d.icon;
      img.style.opacity = '1';
    });
    return card;
  }

  document.getElementById('add-skill').addEventListener('click', () => {
    const s = { name: '', category: 'Backend', icon: '' };
    skills.push(s);
    const card = buildSkillCard(s, skills.length - 1);
    document.getElementById('skills-list').appendChild(card);
    card.classList.add('expanded');
  });
  document.getElementById('save-skills').addEventListener('click', () => patchField('skills', skills));

  // ── EXPERIENCE TAB ─────────────────────────────────────
  let experience = [];
  function renderExperience(items) {
    experience = items;
    const list = document.getElementById('experience-list');
    list.innerHTML = '';
    experience.forEach((e, i) => list.appendChild(buildExpCard(e, i)));
  }

  function buildExpCard(e, i) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-title">${e.title || 'New Entry'}</span>
        <span class="item-card-badge">${e.period || ''}</span>
        <div class="item-card-actions">
          <button class="btn-danger delete-btn"><i class="bi bi-trash"></i></button>
        </div>
        <i class="bi bi-chevron-down item-card-chevron"></i>
      </div>
      <div class="item-card-body">
        <div class="field-group"><label>Job Title</label><input type="text" class="ex-title" value="${esc(e.title)}"></div>
        <div class="form-row">
          <div class="field-group"><label>Company</label><input type="text" class="ex-company" value="${esc(e.company)}"></div>
          <div class="field-group"><label>Location</label><input type="text" class="ex-location" value="${esc(e.location)}"></div>
        </div>
        <div class="field-group"><label>Period</label><input type="text" class="ex-period" value="${esc(e.period)}" placeholder="Jan 2022 – Present"></div>
        <div class="field-group"><label>Description</label><textarea class="ex-desc" rows="2">${esc(e.description)}</textarea></div>
        <div class="field-group">
          <label>Highlights (one per line)</label>
          <textarea class="ex-highlights" rows="4">${(e.highlights || []).join('\n')}</textarea>
        </div>
      </div>`;
    wireItemCard(card, i, experience, 'ex-title', (el, d) => {
      d.title       = el.querySelector('.ex-title').value;
      d.company     = el.querySelector('.ex-company').value;
      d.location    = el.querySelector('.ex-location').value;
      d.period      = el.querySelector('.ex-period').value;
      d.description = el.querySelector('.ex-desc').value;
      d.highlights  = el.querySelector('.ex-highlights').value.split('\n').map(s => s.trim()).filter(Boolean);
      el.querySelector('.item-card-title').textContent = d.title || 'New Entry';
      el.querySelector('.item-card-badge').textContent = d.period;
    });
    return card;
  }

  document.getElementById('add-exp').addEventListener('click', () => {
    const e = { title: '', company: '', location: '', period: '', description: '', highlights: [] };
    experience.push(e);
    const card = buildExpCard(e, experience.length - 1);
    document.getElementById('experience-list').appendChild(card);
    card.classList.add('expanded');
  });
  document.getElementById('save-experience').addEventListener('click', () => patchField('experience', experience));

  // ── EDUCATION TAB ──────────────────────────────────────
  let education = [];
  function renderEducation(items) {
    education = items;
    const list = document.getElementById('education-list');
    list.innerHTML = '';
    education.forEach((e, i) => list.appendChild(buildEduCard(e, i)));
  }

  function buildEduCard(e, i) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-title">${e.degree || 'New Entry'}</span>
        <span class="item-card-badge">${e.period || ''}</span>
        <div class="item-card-actions">
          <button class="btn-danger delete-btn"><i class="bi bi-trash"></i></button>
        </div>
        <i class="bi bi-chevron-down item-card-chevron"></i>
      </div>
      <div class="item-card-body">
        <div class="field-group"><label>Degree / Program</label><input type="text" class="ed-degree" value="${esc(e.degree)}"></div>
        <div class="form-row">
          <div class="field-group"><label>School</label><input type="text" class="ed-school" value="${esc(e.school)}"></div>
          <div class="field-group"><label>Location</label><input type="text" class="ed-location" value="${esc(e.location)}"></div>
        </div>
        <div class="field-group"><label>Period</label><input type="text" class="ed-period" value="${esc(e.period)}" placeholder="2018 – 2022"></div>
        <div class="field-group"><label>Description</label><textarea class="ed-desc" rows="2">${esc(e.description)}</textarea></div>
        <div class="field-group">
          <label>Highlights (one per line)</label>
          <textarea class="ed-highlights" rows="3">${(e.highlights || []).join('\n')}</textarea>
        </div>
      </div>`;
    wireItemCard(card, i, education, 'ed-degree', (el, d) => {
      d.degree      = el.querySelector('.ed-degree').value;
      d.school      = el.querySelector('.ed-school').value;
      d.location    = el.querySelector('.ed-location').value;
      d.period      = el.querySelector('.ed-period').value;
      d.description = el.querySelector('.ed-desc').value;
      d.highlights  = el.querySelector('.ed-highlights').value.split('\n').map(s => s.trim()).filter(Boolean);
      el.querySelector('.item-card-title').textContent = d.degree || 'New Entry';
      el.querySelector('.item-card-badge').textContent = d.period;
    });
    return card;
  }

  document.getElementById('add-edu').addEventListener('click', () => {
    const e = { degree: '', school: '', location: '', period: '', description: '', highlights: [] };
    education.push(e);
    const card = buildEduCard(e, education.length - 1);
    document.getElementById('education-list').appendChild(card);
    card.classList.add('expanded');
  });
  document.getElementById('save-education').addEventListener('click', () => patchField('education', education));

  // ── PROJECTS TAB ───────────────────────────────────────
  let projects = [];
  function renderProjects(items) {
    projects = items;
    const list = document.getElementById('projects-list');
    list.innerHTML = '';
    projects.forEach((p, i) => list.appendChild(buildProjectCard(p, i)));
  }

  function buildProjectCard(p, i) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-card-title">${p.title || 'New Project'}</span>
        <span class="item-card-badge">${p.category || ''}</span>
        <div class="item-card-actions">
          <button class="btn-danger delete-btn"><i class="bi bi-trash"></i></button>
        </div>
        <i class="bi bi-chevron-down item-card-chevron"></i>
      </div>
      <div class="item-card-body">
        <div class="form-row">
          <div class="field-group"><label>Project ID</label><input type="text" class="pr-id" value="${esc(p.id)}" placeholder="my-project-slug"></div>
          <div class="field-group">
            <label>Category</label>
            <select class="pr-category">
              ${['webapp','mobapp','iot'].map(c =>
                `<option value="${c}"${c === p.category ? ' selected' : ''}>${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="field-group"><label>Title</label><input type="text" class="pr-title" value="${esc(p.title)}"></div>
        <div class="field-group"><label>Description</label><textarea class="pr-desc" rows="3">${esc(p.description)}</textarea></div>
        <div class="field-group"><label>Thumbnail URL</label>
          <input type="text" class="pr-thumb" value="${esc(p.thumbnail)}" placeholder="/assets/img/portfolio/...">
        </div>
        <div class="form-row">
          <div class="field-group"><label>Live URL</label><input type="url" class="pr-url" value="${esc(p.url)}"></div>
          <div class="field-group"><label>URL Label</label><input type="text" class="pr-url-label" value="${esc(p.urlLabel)}" placeholder="Vercel, GitHub..."></div>
        </div>
        <div class="form-row">
          <div class="field-group"><label>Client</label><input type="text" class="pr-client" value="${esc(p.client)}"></div>
          <div class="field-group"><label>Date</label><input type="text" class="pr-date" value="${esc(p.date)}" placeholder="January, 2025"></div>
        </div>
        <div class="field-group">
          <label>Tags (comma-separated)</label>
          <input type="text" class="pr-tags" value="${(p.tags || []).join(', ')}">
        </div>
        <div class="field-group">
          <label>Upload Thumbnail</label>
          <input type="file" class="pr-thumb-upload" accept="image/*">
        </div>
      </div>`;

    // Thumbnail upload
    card.querySelector('.pr-thumb-upload').addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const url = await uploadFile(file);
        card.querySelector('.pr-thumb').value = url;
        toast('Thumbnail uploaded');
      } catch { toast('Upload failed', 'error'); }
    });

    wireItemCard(card, i, projects, 'pr-title', (el, d) => {
      d.id          = el.querySelector('.pr-id').value;
      d.title       = el.querySelector('.pr-title').value;
      d.category    = el.querySelector('.pr-category').value;
      d.description = el.querySelector('.pr-desc').value;
      d.thumbnail   = el.querySelector('.pr-thumb').value;
      d.url         = el.querySelector('.pr-url').value;
      d.urlLabel    = el.querySelector('.pr-url-label').value;
      d.client      = el.querySelector('.pr-client').value;
      d.date        = el.querySelector('.pr-date').value;
      d.tags        = el.querySelector('.pr-tags').value.split(',').map(s => s.trim()).filter(Boolean);
      el.querySelector('.item-card-title').textContent = d.title || 'New Project';
      el.querySelector('.item-card-badge').textContent = d.category;
    });
    return card;
  }

  document.getElementById('add-project').addEventListener('click', () => {
    const p = { id: '', title: '', category: 'webapp', description: '', thumbnail: '', url: '', urlLabel: '', client: '', date: '', tags: [] };
    projects.push(p);
    const card = buildProjectCard(p, projects.length - 1);
    document.getElementById('projects-list').appendChild(card);
    card.classList.add('expanded');
  });
  document.getElementById('save-projects').addEventListener('click', () => patchField('projects', projects));

  // ── SERVICES TAB ───────────────────────────────────────
  let services = [];
  function renderServices(items) {
    services = items;
    const list = document.getElementById('services-list');
    list.innerHTML = '';
    services.forEach((s, i) => list.appendChild(buildServiceCard(s, i)));
  }

  function buildServiceCard(s, i) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <div class="item-card-header">
        <i class="bi ${s.icon || 'bi-stars'}" style="font-size:1.1rem;color:var(--accent)"></i>
        <span class="item-card-title">${s.title || 'New Service'}</span>
        <div class="item-card-actions">
          <button class="btn-danger delete-btn"><i class="bi bi-trash"></i></button>
        </div>
        <i class="bi bi-chevron-down item-card-chevron"></i>
      </div>
      <div class="item-card-body">
        <div class="form-row">
          <div class="field-group"><label>Title</label><input type="text" class="sv-title" value="${esc(s.title)}"></div>
          <div class="field-group"><label>Icon class</label><input type="text" class="sv-icon" value="${esc(s.icon)}" placeholder="bi-code-slash"></div>
        </div>
        <div class="field-group"><label>Description</label><textarea class="sv-desc" rows="3">${esc(s.description)}</textarea></div>
      </div>`;
    wireItemCard(card, i, services, 'sv-title', (el, d) => {
      d.title       = el.querySelector('.sv-title').value;
      d.icon        = el.querySelector('.sv-icon').value;
      d.description = el.querySelector('.sv-desc').value;
      el.querySelector('.item-card-title').textContent = d.title || 'New Service';
      const iconEl = el.querySelector('.item-card-header > .bi');
      iconEl.className = `bi ${d.icon || 'bi-stars'}`;
    });
    return card;
  }

  document.getElementById('add-service').addEventListener('click', () => {
    const s = { icon: 'bi-stars', title: '', description: '' };
    services.push(s);
    const card = buildServiceCard(s, services.length - 1);
    document.getElementById('services-list').appendChild(card);
    card.classList.add('expanded');
  });
  document.getElementById('save-services').addEventListener('click', () => patchField('services', services));

  // ── ITEM CARD WIRING ────────────────────────────────────
  function wireItemCard(card, index, arr, titleClass, syncFn) {
    const header = card.querySelector('.item-card-header');
    const deleteBtn = card.querySelector('.delete-btn');

    // Expand/collapse on header click (not on action buttons)
    header.addEventListener('click', e => {
      if (e.target.closest('.item-card-actions')) return;
      card.classList.toggle('expanded');
    });

    // Delete
    deleteBtn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = arr.indexOf(arr[index]);
      arr.splice(idx, 1);
      card.remove();
    });

    // Live sync on input change inside body
    card.querySelector('.item-card-body').addEventListener('input', () => {
      syncFn(card, arr[index]);
    });
  }

  // ── UTILITY ────────────────────────────────────────────
  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

})();
