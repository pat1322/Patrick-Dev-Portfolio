'use strict';

const express = require('express');
const session = require('express-session');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const https = require('https');

const app        = express();
const PORT       = process.env.PORT       || 8080;
const ADMIN_PASS = process.env.ADMIN_PASS || '';
const SESSION_SECRET = process.env.SESSION_SECRET || 'pf-' + Math.random().toString(36).slice(2);

// ── Paths ─────────────────────────────────────────────────────────────
const ROOT        = __dirname;
const DATA_DIR    = path.join(ROOT, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const SEED_FILE   = path.join(ROOT, 'data-seed', 'config.json');

// Ensure runtime directories exist (volume may be empty on first boot)
[DATA_DIR, UPLOADS_DIR].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

// Seed config.json on first boot from the bundled seed copy
if (!fs.existsSync(CONFIG_FILE)) {
  if (fs.existsSync(SEED_FILE)) {
    fs.copyFileSync(SEED_FILE, CONFIG_FILE);
    console.log('First boot — seeded config.json from data-seed/');
  } else {
    fs.writeFileSync(CONFIG_FILE, '{}');
  }
}

// ── Multer ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename(req, file, cb) {
    const safe = file.originalname
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    const ok  = /^(jpeg|jpg|png|gif|webp|svg)$/.test(ext);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

// ── Middleware ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000, secure: false }
}));

// Static files — serve the whole project root (including data/uploads/ from volume)
app.use(express.static(ROOT));

// ── Auth middleware ────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session.isAdmin) return next();
  res.status(401).json({ error: 'Unauthorized' });
}

// ── API: Auth ──────────────────────────────────────────────────────────
app.post('/api/login', (req, res) => {
  if (!ADMIN_PASS) {
    return res.status(503).json({ error: 'ADMIN_PASS environment variable not set' });
  }
  if (req.body.password === ADMIN_PASS) {
    req.session.isAdmin = true;
    res.json({ ok: true });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

app.get('/api/auth', (req, res) => {
  res.json({ authenticated: !!req.session.isAdmin });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// ── API: Config ────────────────────────────────────────────────────────
app.get('/api/config', (req, res) => {
  try {
    res.type('json').send(fs.readFileSync(CONFIG_FILE, 'utf8'));
  } catch {
    res.json({});
  }
});

app.post('/api/config', requireAuth, (req, res) => {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(req.body, null, 2));
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: Image uploads ─────────────────────────────────────────────────
app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' });
  res.json({ url: `data/uploads/${req.file.filename}` });
});

app.delete('/api/upload/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename); // prevent path traversal
  const filepath = path.join(UPLOADS_DIR, filename);
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── API: Contact form (uses Resend HTTP API — no SMTP, works on Railway) ──────
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const apiKey  = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_EMAIL || 'patrickperez1322@gmail.com';

  if (!apiKey) {
    return res.status(503).json({
      error: 'Contact form not configured. Add RESEND_API_KEY to Railway environment variables (get a free key at resend.com).'
    });
  }

  const safeMsg = String(message).replace(/</g, '&lt;').replace(/\n/g, '<br>');
  const payload = JSON.stringify({
    from:     'Portfolio Contact <onboarding@resend.dev>',
    to:       [toEmail],
    reply_to: email,
    subject:  `[Portfolio] ${subject}`,
    html: `<h3 style="color:#C9A227;font-family:sans-serif">New message from your portfolio</h3>
           <p><strong>Name:</strong> ${name}</p>
           <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
           <p><strong>Subject:</strong> ${subject}</p>
           <hr style="border:none;border-top:1px solid #ccc;margin:1rem 0">
           <p>${safeMsg}</p>`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
  });

  const apiReq = https.request({
    hostname: 'api.resend.com',
    path:     '/emails',
    method:   'POST',
    headers:  {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (apiRes) => {
    let body = '';
    apiRes.on('data', chunk => { body += chunk; });
    apiRes.on('end', () => {
      if (apiRes.statusCode >= 200 && apiRes.statusCode < 300) {
        res.json({ ok: true });
      } else {
        let msg = body;
        try { msg = JSON.parse(body).message || body; } catch (_) {}
        console.error('Resend error', apiRes.statusCode, body);
        res.status(502).json({ error: `Email service error (${apiRes.statusCode}): ${msg}` });
      }
    });
  });

  apiReq.setTimeout(15000, () => {
    apiReq.destroy(new Error('Resend API request timed out after 15 s'));
  });
  apiReq.on('error', err => {
    console.error('Contact API error:', err.message);
    res.status(500).json({ error: err.message });
  });

  apiReq.write(payload);
  apiReq.end();
});

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Portfolio server on port ${PORT}`);
  if (!ADMIN_PASS) console.warn('WARNING: ADMIN_PASS is not set — admin API is locked out');
});
