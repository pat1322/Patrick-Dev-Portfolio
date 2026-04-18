const express = require('express');
const session = require('express-session');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const DATA_FILE  = path.join(__dirname, 'data', 'portfolio.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// ── BOOTSTRAP DIRS & SEED DATA ────────────────────────────
['data', UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

if (!fs.existsSync(DATA_FILE)) {
  const seed = path.join(__dirname, 'portfolio.json');
  if (fs.existsSync(seed)) {
    fs.copyFileSync(seed, DATA_FILE);
    console.log('📋 Seeded data/portfolio.json');
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  }
}

// ── MULTER ────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, Date.now() + '-' + safe);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|gif|webp|svg/.test(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

// ── MIDDLEWARE ────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'patrick-portfolio-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// ── AUTH MIDDLEWARE ───────────────────────────────────────
const requireAuth = (req, res, next) =>
  req.session.authenticated ? next() : res.status(401).json({ error: 'Unauthorized' });

// ── DATA HELPERS ──────────────────────────────────────────
const readData  = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const writeData = data => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ── PAGE ROUTES ───────────────────────────────────────────
app.get('/',      (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ── AUTH ROUTES ───────────────────────────────────────────
app.post('/api/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Incorrect password' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.get('/api/auth-check', (req, res) =>
  res.json({ authenticated: !!req.session.authenticated })
);

// ── DATA ROUTES ───────────────────────────────────────────
app.get('/api/data', (req, res) => res.json(readData()));

app.post('/api/data', requireAuth, (req, res) => {
  try {
    writeData({ ...readData(), ...req.body });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Patch individual top-level fields
['skills', 'services', 'experience', 'education', 'projects'].forEach(field => {
  app.patch(`/api/data/${field}`, requireAuth, (req, res) => {
    try {
      const data = readData();
      data[field] = req.body[field];
      writeData(data);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
});

// ── FILE UPLOAD ───────────────────────────────────────────
app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ success: true, url: '/uploads/' + req.file.filename });
});

app.delete('/api/upload/:filename', requireAuth, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(UPLOADS_DIR, filename);
  try {
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── START ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Portfolio  → http://localhost:${PORT}`);
  console.log(`🔐 Admin      → http://localhost:${PORT}/admin`);
  console.log(`🔑 Password: ${ADMIN_PASSWORD === 'admin123' ? 'admin123 (set ADMIN_PASSWORD env var)' : '(custom)'}`);
});
