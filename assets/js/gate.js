/* ================================================================
   PORTFOLIO GATE — security gate, role access, anti-scraping
   Credentials are injected by docker-entrypoint.sh from Railway
   environment variables (RECRUITER_CODE and ADMIN_PASS).
   ================================================================ */
(function () {
  'use strict';

  /* ── Railway-injected credentials ─────────────────────────── */
  var RECRUITER_CODE = 'RECRUITER_CODE_PLACEHOLDER';
  var ADMIN_PASS     = 'ADMIN_PASS_PLACEHOLDER';
  var SESSION_KEY    = 'pf_role';
  /* ─────────────────────────────────────────────────────────── */

  /* ── Set gate-active flag IMMEDIATELY so other scripts see it ── */
  window.pfGateActive = true;
  document.documentElement.classList.add('gate-active');

  /* ── Anti-scraping ──────────────────────────────────────────── */
  document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  document.addEventListener('copy',        function (e) { e.preventDefault(); });
  document.addEventListener('cut',         function (e) { e.preventDefault(); });
  document.addEventListener('dragstart',   function (e) { e.preventDefault(); });
  document.addEventListener('selectstart', function (e) {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  });
  document.addEventListener('keydown', function (e) {
    var c = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
    if (
      (c && (k==='s'||k==='u'||k==='a'||k==='c'||k==='p')) ||
      e.key === 'F12' ||
      (c && e.shiftKey && (k==='i'||k==='j'||k==='c'))
    ) { e.preventDefault(); }
  });

  /* ── Session check — skip gate if already authenticated ────── */
  var stored = sessionStorage.getItem(SESSION_KEY);
  if (stored) {
    window.pfGateActive = false;
    document.documentElement.classList.remove('gate-active');
    applyRole(stored);
    return;
  }

  /* ── Inject styles (all scoped under #gx-ov to avoid conflicts) ─
     NOTE: golden-noir.css already uses .pg-* classes (lourine theme),
     so we use #gx-ov as our gate namespace to prevent any collisions. */
  var sty = document.createElement('style');
  sty.textContent = [
    /* Overlay */
    '#gx-ov{position:fixed;inset:0;z-index:99999;background:#040302;',
      'display:flex;align-items:center;justify-content:center;',
      'font-family:"Raleway",sans-serif;transition:opacity .65s ease}',
    '#gx-ov.gx-out{opacity:0;pointer-events:none}',

    /* Reset all children so golden-noir.css can't bleed in */
    '#gx-ov *{box-sizing:border-box;margin:0;padding:0;',
      'font-family:"Raleway",sans-serif;border-radius:0}',

    /* Card */
    '#gx-ov .gx-card{background:#141210;border:1px solid rgba(201,162,39,.22);',
      'max-width:450px;width:90%;position:relative;overflow:hidden;',
      'box-shadow:0 40px 100px rgba(0,0,0,.85);',
      'animation:gxIn .55s cubic-bezier(.16,1,.3,1) forwards}',
    '@keyframes gxIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}',
    '#gx-ov .gx-card::before{content:"";position:absolute;',
      'top:0;left:0;width:28px;height:1px;background:#C9A227;display:block}',
    '#gx-ov .gx-card::after{content:"";position:absolute;',
      'top:0;left:0;width:1px;height:28px;background:#C9A227;display:block}',

    /* Header */
    '#gx-ov .gx-top{padding:2.5rem 2.5rem 1.7rem;text-align:center;',
      'border-bottom:1px solid rgba(201,162,39,.09)}',
    '#gx-ov .gx-eye{display:block;font-size:.48rem;letter-spacing:.44em;',
      'text-transform:uppercase;color:#C9A227;margin-bottom:.5rem}',
    '#gx-ov .gx-name{display:block;font-family:"Cormorant Garamond",serif;',
      'font-size:1.85rem;font-weight:300;color:#F0E6CC;',
      'letter-spacing:.06em;margin-bottom:.15rem}',
    '#gx-ov .gx-sub{display:block;font-size:.5rem;letter-spacing:.28em;',
      'text-transform:uppercase;color:#3e3427}',
    '#gx-ov .gx-hr{display:block;width:34px;height:1px;',
      'background:linear-gradient(90deg,transparent,#C9A227,transparent);',
      'margin:.95rem auto 0}',

    /* Body */
    '#gx-ov .gx-body{padding:1.8rem 2.5rem 2.3rem}',
    '#gx-ov .gx-q{display:block;font-size:.55rem;letter-spacing:.2em;',
      'text-transform:uppercase;color:#5a4e3a;text-align:center;margin-bottom:1.6rem}',
    '#gx-ov .gx-step{display:block}',
    '#gx-ov .gx-step.gx-h{display:none!important}',

    /* Role buttons row */
    '#gx-ov .gx-row{display:flex;gap:.75rem;margin-bottom:.7rem}',
    '#gx-ov .gx-btn{flex:1;background:transparent;',
      'border:1px solid rgba(201,162,39,.14);padding:1.2rem .35rem;cursor:pointer;',
      'color:#4a4030;font-size:.5rem;letter-spacing:.22em;text-transform:uppercase;',
      'transition:all .3s;display:flex;flex-direction:column;',
      'align-items:center;gap:.48rem;outline:none}',
    '#gx-ov .gx-btn i{font-size:.95rem;opacity:.4;transition:opacity .3s;display:block}',
    '#gx-ov .gx-btn:hover{border-color:rgba(201,162,39,.5);',
      'color:#C9A227;background:rgba(201,162,39,.05)}',
    '#gx-ov .gx-btn:hover i{opacity:1}',

    /* "or" divider */
    '#gx-ov .gx-or{display:flex;align-items:center;gap:.7rem;margin:.1rem 0 .7rem}',
    '#gx-ov .gx-or::before,#gx-ov .gx-or::after{content:"";flex:1;height:1px;',
      'background:rgba(201,162,39,.07)}',
    '#gx-ov .gx-or span{font-size:.42rem;letter-spacing:.18em;',
      'color:#282018;text-transform:uppercase}',

    /* Admin row */
    '#gx-ov .gx-btn-full{flex-direction:row;padding:.78rem 1rem;',
      'justify-content:center;gap:.5rem;width:100%}',

    /* Back button */
    '#gx-ov .gx-back{background:none;border:none;color:#3e3427;font-size:.49rem;',
      'letter-spacing:.18em;text-transform:uppercase;cursor:pointer;',
      'display:inline-flex;align-items:center;gap:.33rem;',
      'margin-bottom:1.2rem;padding:0;transition:color .3s}',
    '#gx-ov .gx-back:hover{color:#C9A227}',

    /* Step sub-label */
    '#gx-ov .gx-slbl{display:block;font-size:.52rem;letter-spacing:.26em;',
      'text-transform:uppercase;color:#5a4e3a;text-align:center;margin-bottom:1.35rem}',

    /* PIN inputs */
    '#gx-ov .gx-pins{display:flex;gap:.65rem;justify-content:center;margin-bottom:1.1rem}',
    '#gx-ov .gx-pin{width:50px;height:56px;background:#0c0b09;',
      'border:1px solid rgba(201,162,39,.18);color:#F0E6CC;',
      'font-size:1.35rem;text-align:center;',
      'font-family:"Cormorant Garamond",serif;outline:none;',
      'caret-color:#C9A227;transition:border-color .3s;',
      '-webkit-appearance:none;appearance:none}',
    '#gx-ov .gx-pin:focus{border-color:rgba(201,162,39,.6)}',
    '#gx-ov .gx-pin.gx-shake{animation:gxShk .4s}',
    '@keyframes gxShk{0%,100%{transform:translateX(0)}',
      '20%{transform:translateX(-5px)}40%{transform:translateX(5px)}',
      '60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}',

    /* Password */
    '#gx-ov .gx-pw{width:100%;background:#0c0b09;',
      'border:1px solid rgba(201,162,39,.18);color:#F0E6CC;',
      'font-size:.88rem;padding:.82rem 1rem;outline:none;',
      'letter-spacing:.07em;margin-bottom:1.2rem;',
      'transition:border-color .3s;-webkit-appearance:none;appearance:none}',
    '#gx-ov .gx-pw:focus{border-color:rgba(201,162,39,.55)}',

    /* Submit */
    '#gx-ov .gx-sub{display:block;width:100%;background:rgba(201,162,39,.07);',
      'border:1px solid rgba(201,162,39,.3);color:#C9A227;padding:.8rem;',
      'font-size:.55rem;letter-spacing:.25em;text-transform:uppercase;',
      'cursor:pointer;transition:all .3s}',
    '#gx-ov .gx-sub:hover{background:rgba(201,162,39,.15);',
      'border-color:rgba(201,162,39,.6)}',

    /* Error text */
    '#gx-ov .gx-err{display:block;font-size:.52rem;color:#b84444;',
      'text-align:center;min-height:.85rem;margin-top:.65rem;letter-spacing:.05em}',

    /* ── Suppress splash and AOS while gate is active ── */
    'html.gate-active #splash-screen{display:none!important}',
    'html.gate-active [data-aos]{opacity:0!important;',
      'transform:translateY(20px)!important;transition:none!important}',
    'html.gate-active .typed-cursor{display:none!important}',

    /* ── Role-based blurring ── */
    'body.role-guest .sensitive{filter:blur(6px);-webkit-filter:blur(6px);',
      'user-select:none;pointer-events:none;transition:filter .4s}',
    'body.role-guest .sensitive-hide{display:none!important}',

    /* Guest re-auth badge */
    '#gx-badge{display:none;position:fixed;bottom:1.4rem;right:1.4rem;',
      'z-index:9990;background:#141210;border:1px solid rgba(201,162,39,.25);',
      'padding:.5rem 1rem;font-family:"Raleway",sans-serif;font-size:.48rem;',
      'letter-spacing:.22em;text-transform:uppercase;color:#5a4e3a;',
      'cursor:pointer;transition:all .3s;align-items:center;gap:.45rem}',
    '#gx-badge:hover{border-color:rgba(201,162,39,.5);color:#C9A227}',
    'body.role-guest #gx-badge{display:flex!important}',
  ].join('');
  document.head.appendChild(sty);

  /* ── Build overlay HTML ──────────────────────────────────────── */
  var ov = document.createElement('div');
  ov.id = 'gx-ov';
  ov.innerHTML =
    '<div class="gx-card">' +
      '<div class="gx-top">' +
        '<span class="gx-eye">Developer Portfolio</span>' +
        '<span class="gx-name">Patrick Perez</span>' +
        '<span class="gx-sub">Full Stack Developer</span>' +
        '<span class="gx-hr"></span>' +
      '</div>' +
      '<div class="gx-body">' +

        /* Step 1 — role selection */
        '<div class="gx-step" id="gx-s1">' +
          '<span class="gx-q">How are you visiting today?</span>' +
          '<div class="gx-row">' +
            '<button class="gx-btn" id="gx-guest"><i class="bi bi-person"></i>Guest</button>' +
            '<button class="gx-btn" id="gx-rec"><i class="bi bi-briefcase"></i>Recruiter</button>' +
          '</div>' +
          '<div class="gx-or"><span>or</span></div>' +
          '<button class="gx-btn gx-btn-full" id="gx-adm">' +
            '<i class="bi bi-shield-lock"></i>Admin Access' +
          '</button>' +
        '</div>' +

        /* Step 2 — recruiter PIN */
        '<div class="gx-step gx-h" id="gx-s2">' +
          '<button class="gx-back" id="gx-bk2">← Back</button>' +
          '<span class="gx-slbl">Enter your 4-digit access code</span>' +
          '<div class="gx-pins">' +
            '<input class="gx-pin" maxlength="1" inputmode="numeric" />' +
            '<input class="gx-pin" maxlength="1" inputmode="numeric" />' +
            '<input class="gx-pin" maxlength="1" inputmode="numeric" />' +
            '<input class="gx-pin" maxlength="1" inputmode="numeric" />' +
          '</div>' +
          '<span class="gx-err" id="gx-re"></span>' +
        '</div>' +

        /* Step 3 — admin password */
        '<div class="gx-step gx-h" id="gx-s3">' +
          '<button class="gx-back" id="gx-bk3">← Back</button>' +
          '<span class="gx-slbl">Admin credentials</span>' +
          '<input type="password" class="gx-pw" id="gx-pw" ' +
            'placeholder="••••••••" autocomplete="off" />' +
          '<button class="gx-sub" id="gx-asub">Enter Admin Panel</button>' +
          '<span class="gx-err" id="gx-ae"></span>' +
        '</div>' +

      '</div>' +
    '</div>';
  document.body.appendChild(ov);

  /* Guest re-auth badge */
  var badge = document.createElement('div');
  badge.id = 'gx-badge';
  badge.innerHTML = '<i class="bi bi-eye"></i> Guest View — click to upgrade access';
  badge.addEventListener('click', function () {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.reload();
  });
  document.body.appendChild(badge);

  /* ── Helpers ─────────────────────────────────────────────────── */
  function q(sel) { return document.querySelector(sel); }

  function showStep(id) {
    ['gx-s1', 'gx-s2', 'gx-s3'].forEach(function (s) {
      document.getElementById(s).classList.toggle('gx-h', s !== id);
    });
  }

  function dismiss(role) {
    sessionStorage.setItem(SESSION_KEY, role);

    /* Fade out gate */
    ov.classList.add('gx-out');
    setTimeout(function () { ov.remove(); }, 700);

    /* Clear gate-active — allows splash + AOS to proceed */
    window.pfGateActive = false;
    document.documentElement.classList.remove('gate-active');

    /* Reveal and start splash */
    var splash = document.getElementById('splash-screen');
    if (splash) {
      splash.style.removeProperty('display');
      setTimeout(function () {
        if (typeof window.dismissSplash === 'function') window.dismissSplash();
      }, 3200);
    }

    /* Signal all gate-aware scripts to initialize */
    document.dispatchEvent(new CustomEvent('gateDismissed', { detail: { role: role } }));

    applyRole(role);
  }

  /* ── Guest ───────────────────────────────────────────────────── */
  q('#gx-guest').addEventListener('click', function () { dismiss('guest'); });

  /* ── Recruiter ───────────────────────────────────────────────── */
  var pins = Array.from(document.querySelectorAll('.gx-pin'));

  q('#gx-rec').addEventListener('click', function () {
    showStep('gx-s2');
    pins[0].focus();
  });
  q('#gx-bk2').addEventListener('click', function () {
    showStep('gx-s1');
    q('#gx-re').textContent = '';
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
        p.classList.add('gx-shake');
        setTimeout(function () { p.classList.remove('gx-shake'); }, 450);
        p.value = '';
      });
      pins[0].focus();
      q('#gx-re').textContent = 'Incorrect code — check your copy of the resume.';
    }
  }

  /* ── Admin ───────────────────────────────────────────────────── */
  q('#gx-adm').addEventListener('click', function () {
    showStep('gx-s3');
    q('#gx-pw').focus();
  });
  q('#gx-bk3').addEventListener('click', function () {
    showStep('gx-s1');
    q('#gx-pw').value = '';
    q('#gx-ae').textContent = '';
  });
  q('#gx-asub').addEventListener('click', checkAdmin);
  q('#gx-pw').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') checkAdmin();
  });

  function checkAdmin() {
    if (q('#gx-pw').value === ADMIN_PASS) {
      sessionStorage.setItem(SESSION_KEY, 'admin');
      window.pfGateActive = false;
      document.documentElement.classList.remove('gate-active');
      window.location.href = 'admin.html';
    } else {
      q('#gx-ae').textContent = 'Incorrect password.';
      q('#gx-pw').value = '';
    }
  }

  /* ── Apply role + admin-configurable sensitivity ─────────────── */
  function applyRole(role) {
    document.body.classList.add('role-' + role);
    if (role === 'guest') {
      /* Apply any extra blurring configured via the admin panel */
      document.addEventListener('DOMContentLoaded', function () {
        try {
          var saved = JSON.parse(localStorage.getItem('pfAdminState') || '{}');
          var vis   = (saved.state && saved.state.guestVis) || {};
          var map   = {
            github:   '[data-sensitive="github"]',
            location: '[data-sensitive="location"]',
            facebook: '[data-sensitive="facebook"]',
            contact:  '[data-sensitive="contact"]',
          };
          Object.keys(map).forEach(function (key) {
            if (vis[key]) {
              document.querySelectorAll(map[key]).forEach(function (el) {
                el.classList.add('sensitive');
              });
            }
          });
        } catch (e) {}
      });
    }
  }

})();
