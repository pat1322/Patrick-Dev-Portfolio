/* ================================================================
   PORTFOLIO GATE  — security gate, role access, anti-scraping
   ----------------------------------------------------------------
   RECRUITER_CODE : 4-digit PIN printed at the bottom of the resume
   ADMIN_PASS     : admin panel password
   ================================================================ */
(function () {
  'use strict';

  /* ── EDIT THESE ────────────────────────────────────────────── */
  var RECRUITER_CODE = '2025';       // put this on your resume PDF
  var ADMIN_PASS     = 'PD@dmin25'; // change after first login
  var SESSION_KEY    = 'pf_role';
  /* ─────────────────────────────────────────────────────────── */

  /* ── Anti-scraping ─────────────────────────────────────────── */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('copy',  function (e) { e.preventDefault(); });
  document.addEventListener('cut',   function (e) { e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { e.preventDefault(); });
  document.addEventListener('selectstart', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });
  document.addEventListener('keydown', function (e) {
    var c = e.ctrlKey || e.metaKey;
    var k = e.key.toLowerCase();
    var blocked =
      (c && (k==='s'||k==='u'||k==='a'||k==='c'||k==='p')) ||
      e.key === 'F12' ||
      (c && e.shiftKey && (k==='i'||k==='j'||k==='c'));
    if (blocked) e.preventDefault();
  });

  /* ── Session check (skip gate if already logged in) ─────────── */
  var stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) { applyRole(stored); return; }

  /* ── Inject gate styles ─────────────────────────────────────── */
  var s = document.createElement('style');
  s.textContent = [
    '*{box-sizing:border-box}',
    /* overlay */
    '#pg-ov{position:fixed;inset:0;z-index:99999;background:#040302;',
      'display:flex;align-items:center;justify-content:center;',
      'font-family:"Raleway",sans-serif;transition:opacity .65s ease}',
    '#pg-ov.pg-out{opacity:0;pointer-events:none}',
    /* card */
    '.pg-c{background:#141210;border:1px solid rgba(201,162,39,.22);',
      'max-width:450px;width:90%;position:relative;',
      'box-shadow:0 40px 100px rgba(0,0,0,.85);',
      'animation:pgIn .55s cubic-bezier(.16,1,.3,1) forwards}',
    '@keyframes pgIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}',
    /* corner accents */
    '.pg-c::before,.pg-c::after{content:"";position:absolute;background:#C9A227}',
    '.pg-c::before{top:0;left:0;width:28px;height:1px}',
    '.pg-c::after{top:0;left:0;width:1px;height:28px}',
    /* header */
    '.pg-top{padding:2.5rem 2.5rem 1.7rem;text-align:center;',
      'border-bottom:1px solid rgba(201,162,39,.09)}',
    '.pg-eye{font-size:.48rem;letter-spacing:.44em;text-transform:uppercase;color:#C9A227;margin-bottom:.5rem}',
    '.pg-name{font-family:"Cormorant Garamond",serif;font-size:1.85rem;font-weight:300;',
      'color:#F0E6CC;letter-spacing:.06em;margin:0 0 .15rem}',
    '.pg-sub{font-size:.5rem;letter-spacing:.28em;text-transform:uppercase;color:#3e3427}',
    '.pg-hr{width:34px;height:1px;background:linear-gradient(90deg,transparent,#C9A227,transparent);',
      'margin:.95rem auto 0}',
    /* body */
    '.pg-body{padding:1.8rem 2.5rem 2.3rem}',
    '.pg-q{font-size:.55rem;letter-spacing:.2em;text-transform:uppercase;',
      'color:#5a4e3a;text-align:center;margin-bottom:1.6rem}',
    '.pg-step.pg-h{display:none}',
    /* role buttons */
    '.pg-row{display:flex;gap:.75rem;margin-bottom:.7rem}',
    '.pg-btn{flex:1;background:transparent;border:1px solid rgba(201,162,39,.14);',
      'padding:1.2rem .35rem;cursor:pointer;color:#4a4030;',
      'font-family:"Raleway",sans-serif;font-size:.5rem;letter-spacing:.22em;',
      'text-transform:uppercase;transition:all .3s;display:flex;',
      'flex-direction:column;align-items:center;gap:.48rem}',
    '.pg-btn i{font-size:.95rem;opacity:.4;transition:opacity .3s}',
    '.pg-btn:hover{border-color:rgba(201,162,39,.5);color:#C9A227;background:rgba(201,162,39,.05)}',
    '.pg-btn:hover i{opacity:1}',
    /* divider */
    '.pg-or{display:flex;align-items:center;gap:.7rem;margin:.1rem 0 .7rem}',
    '.pg-or::before,.pg-or::after{content:"";flex:1;height:1px;background:rgba(201,162,39,.07)}',
    '.pg-or span{font-size:.42rem;letter-spacing:.18em;color:#282018;text-transform:uppercase}',
    '.pg-btn-full{flex-direction:row;padding:.78rem 1rem;justify-content:center;gap:.5rem;width:100%}',
    /* back button */
    '.pg-back{background:none;border:none;color:#3e3427;font-size:.49rem;',
      'letter-spacing:.18em;text-transform:uppercase;cursor:pointer;',
      'display:inline-flex;align-items:center;gap:.33rem;margin-bottom:1.2rem;',
      'padding:0;transition:color .3s}',
    '.pg-back:hover{color:#C9A227}',
    '.pg-slbl{font-size:.52rem;letter-spacing:.26em;text-transform:uppercase;',
      'color:#5a4e3a;text-align:center;margin-bottom:1.35rem}',
    /* PIN */
    '.pg-pins{display:flex;gap:.65rem;justify-content:center;margin-bottom:1.1rem}',
    '.pg-pin{width:50px;height:56px;background:#0c0b09;border:1px solid rgba(201,162,39,.18);',
      'color:#F0E6CC;font-size:1.35rem;text-align:center;',
      'font-family:"Cormorant Garamond",serif;outline:none;',
      'caret-color:#C9A227;transition:border-color .3s;',
      '-webkit-appearance:none;appearance:none;border-radius:0}',
    '.pg-pin:focus{border-color:rgba(201,162,39,.6)}',
    '.pg-pin.shake{animation:pgShk .4s}',
    '@keyframes pgShk{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}',
      '40%{transform:translateX(5px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}',
    /* password */
    '.pg-pw{width:100%;background:#0c0b09;border:1px solid rgba(201,162,39,.18);',
      'color:#F0E6CC;font-size:.88rem;padding:.82rem 1rem;',
      'font-family:"Raleway",sans-serif;outline:none;letter-spacing:.07em;',
      'margin-bottom:1.2rem;transition:border-color .3s;',
      '-webkit-appearance:none;appearance:none;border-radius:0}',
    '.pg-pw:focus{border-color:rgba(201,162,39,.55)}',
    /* submit */
    '.pg-sub{width:100%;background:rgba(201,162,39,.07);',
      'border:1px solid rgba(201,162,39,.3);color:#C9A227;padding:.8rem;',
      'font-family:"Raleway",sans-serif;font-size:.55rem;letter-spacing:.25em;',
      'text-transform:uppercase;cursor:pointer;transition:all .3s;border-radius:0}',
    '.pg-sub:hover{background:rgba(201,162,39,.15);border-color:rgba(201,162,39,.6)}',
    /* error */
    '.pg-err{font-size:.52rem;color:#b84444;text-align:center;min-height:.85rem;',
      'margin-top:.65rem;letter-spacing:.05em}',
    /* ── Role-based styles applied to body ── */
    'body.role-guest .sensitive{',
      'filter:blur(6px);-webkit-filter:blur(6px);',
      'user-select:none;pointer-events:none}',
    'body.role-guest .sensitive-hide{display:none!important}',
    /* guest badge */
    'body.role-guest #pg-role-badge{display:flex!important}',
    '#pg-role-badge{display:none;position:fixed;bottom:1.4rem;right:1.4rem;',
      'z-index:9990;background:#141210;border:1px solid rgba(201,162,39,.25);',
      'padding:.45rem .9rem;font-family:"Raleway",sans-serif;',
      'font-size:.48rem;letter-spacing:.22em;text-transform:uppercase;',
      'color:#5a4e3a;cursor:pointer;transition:all .3s;align-items:center;gap:.5rem}',
    '#pg-role-badge:hover{border-color:rgba(201,162,39,.5);color:#C9A227}',
  ].join('');
  document.head.appendChild(s);

  /* ── Build overlay HTML ─────────────────────────────────────── */
  var ov = document.createElement('div');
  ov.id = 'pg-ov';
  ov.innerHTML =
    '<div class="pg-c">' +
      '<div class="pg-top">' +
        '<div class="pg-eye">Developer Portfolio</div>' +
        '<div class="pg-name">Patrick Perez</div>' +
        '<div class="pg-sub">Full Stack Developer</div>' +
        '<div class="pg-hr"></div>' +
      '</div>' +
      '<div class="pg-body">' +

        /* Step 1 — role selection */
        '<div class="pg-step" id="pg-s1">' +
          '<div class="pg-q">How are you visiting today?</div>' +
          '<div class="pg-row">' +
            '<button class="pg-btn" id="pg-g"><i class="bi bi-person"></i>Guest</button>' +
            '<button class="pg-btn" id="pg-r"><i class="bi bi-briefcase"></i>Recruiter</button>' +
          '</div>' +
          '<div class="pg-or"><span>or</span></div>' +
          '<button class="pg-btn pg-btn-full" id="pg-a"><i class="bi bi-shield-lock"></i>Admin Access</button>' +
        '</div>' +

        /* Step 2 — recruiter PIN */
        '<div class="pg-step pg-h" id="pg-s2">' +
          '<button class="pg-back" id="pg-bk2">← Back</button>' +
          '<div class="pg-slbl">Enter your 4-digit access code</div>' +
          '<div class="pg-pins">' +
            '<input class="pg-pin" maxlength="1" inputmode="numeric" />' +
            '<input class="pg-pin" maxlength="1" inputmode="numeric" />' +
            '<input class="pg-pin" maxlength="1" inputmode="numeric" />' +
            '<input class="pg-pin" maxlength="1" inputmode="numeric" />' +
          '</div>' +
          '<div class="pg-err" id="pg-re"></div>' +
        '</div>' +

        /* Step 3 — admin password */
        '<div class="pg-step pg-h" id="pg-s3">' +
          '<button class="pg-back" id="pg-bk3">← Back</button>' +
          '<div class="pg-slbl">Admin credentials</div>' +
          '<input type="password" class="pg-pw" id="pg-apw" placeholder="••••••••" autocomplete="off" />' +
          '<button class="pg-sub" id="pg-asub">Enter Admin Panel</button>' +
          '<div class="pg-err" id="pg-ae"></div>' +
        '</div>' +

      '</div>' +
    '</div>';
  document.body.appendChild(ov);

  /* "Guest" badge shown in corner while browsing as guest */
  var badge = document.createElement('div');
  badge.id = 'pg-role-badge';
  badge.innerHTML = '<i class="bi bi-person"></i> Viewing as Guest — click to upgrade';
  badge.addEventListener('click', function () {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  });
  document.body.appendChild(badge);

  /* ── Helpers ────────────────────────────────────────────────── */
  function q(sel) { return document.querySelector(sel); }

  function step(id) {
    ['pg-s1', 'pg-s2', 'pg-s3'].forEach(function (s) {
      document.getElementById(s).classList.toggle('pg-h', s !== id);
    });
  }

  function dismiss(role) {
    sessionStorage.setItem(SESSION_KEY, role);
    ov.classList.add('pg-out');
    setTimeout(function () { ov.remove(); }, 700);
    applyRole(role);
  }

  /* ── Guest ──────────────────────────────────────────────────── */
  q('#pg-g').addEventListener('click', function () { dismiss('guest'); });

  /* ── Recruiter ──────────────────────────────────────────────── */
  var pins = Array.from(document.querySelectorAll('.pg-pin'));

  q('#pg-r').addEventListener('click', function () { step('pg-s2'); pins[0].focus(); });
  q('#pg-bk2').addEventListener('click', function () {
    step('pg-s1');
    q('#pg-re').textContent = '';
    pins.forEach(function (p) { p.value = ''; });
  });

  pins.forEach(function (pin, i) {
    pin.addEventListener('input', function () {
      this.value = this.value.replace(/\D/g, '').slice(-1);
      if (this.value && i < 3) pins[i + 1].focus();
      if (i === 3 && this.value) checkPin();
    });
    pin.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !this.value && i > 0) pins[i - 1].focus();
    });
    pin.addEventListener('paste', function (e) {
      e.preventDefault();
      var d = (e.clipboardData || window.clipboardData).getData('text')
                .replace(/\D/g, '').slice(0, 4);
      pins.forEach(function (p, j) { p.value = d[j] || ''; });
      if (d.length === 4) checkPin();
    });
  });

  function checkPin() {
    var code = pins.map(function (p) { return p.value; }).join('');
    if (code === RECRUITER_CODE) {
      dismiss('recruiter');
    } else {
      pins.forEach(function (p) {
        p.classList.add('shake');
        setTimeout(function () { p.classList.remove('shake'); }, 450);
        p.value = '';
      });
      pins[0].focus();
      q('#pg-re').textContent = 'Incorrect code — check your copy of the resume.';
    }
  }

  /* ── Admin ──────────────────────────────────────────────────── */
  q('#pg-a').addEventListener('click', function () { step('pg-s3'); q('#pg-apw').focus(); });
  q('#pg-bk3').addEventListener('click', function () {
    step('pg-s1');
    q('#pg-apw').value = '';
    q('#pg-ae').textContent = '';
  });
  q('#pg-asub').addEventListener('click', checkAdmin);
  q('#pg-apw').addEventListener('keydown', function (e) { if (e.key === 'Enter') checkAdmin(); });

  function checkAdmin() {
    if (q('#pg-apw').value === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'admin');
      window.location.href = 'admin.html';
    } else {
      q('#pg-ae').textContent = 'Incorrect password.';
      q('#pg-apw').value = '';
    }
  }

  /* ── Apply role to body ─────────────────────────────────────── */
  function applyRole(role) {
    document.body.classList.add('role-' + role);
  }

})();
