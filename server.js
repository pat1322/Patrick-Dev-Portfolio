'use strict';

const express = require('express');
const session = require('express-session');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const nodemailer = require('nodemailer');

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

// ── API: Contact form ──────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return res.status(503).json({
      error: 'Email not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in Railway environment variables.'
    });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPass }
  });

  try {
    await transporter.sendMail({
      from:     `"Portfolio Contact" <${gmailUser}>`,
      replyTo:  `"${name}" <${email}>`,
      to:       gmailUser,
      subject:  `[Portfolio] ${subject}`,
      html: `<h3 style="color:#C9A227">New message from your portfolio</h3>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
             <p><strong>Subject:</strong> ${subject}</p>
             <hr style="border-color:#C9A227;opacity:.3">
             <p>${message.replace(/\n/g, '<br>')}</p>`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('Contact email error:', err.message);
    res.status(500).json({ error: 'Failed to send: ' + err.message });
  }
});

// ── Start ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Portfolio server on port ${PORT}`);
  if (!ADMIN_PASS) console.warn('WARNING: ADMIN_PASS is not set — admin API is locked out');
});
