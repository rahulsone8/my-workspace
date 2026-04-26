require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE'], allowedHeaders: ['Content-Type','Authorization'] }));

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname)));

// ─── DB CONNECTION ───────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─── SCHEMAS ─────────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  name:     { type: String, default: 'User' },
  createdAt:{ type: Date, default: Date.now },
});

const dataSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  tasks:     { type: Array, default: [] },
  projects:  { type: Array, default: [] },
  calEvents: { type: Array, default: [] },
  files:     { type: Array, default: [] },
  notes:     { type: Array, default: [] },
  activity:  { type: Array, default: [] },
  goals:     { type: Array, default: [] },
  journal:   { type: Array, default: [] },
  writing:   { type: Array, default: [] },
  vault:     { type: Array, default: [] },
  timeline:  { type: Array, default: [] },
  travel:    { type: Array, default: [] },
  career:    { type: Object, default: { journey: '', skills: [], resume: '', startup: [] } },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const WorkspaceData = mongoose.model('WorkspaceData', dataSchema);

// ─── AUTH MIDDLEWARE ──────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ ok: false, error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

// ─── ROUTES ──────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => res.json({ ok: true, msg: 'MySpace API running' }));

// REGISTER
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });

    // Allowlist check (optional — set ALLOWED_EMAILS in .env)
    const allowed = process.env.ALLOWED_EMAILS;
    if (allowed) {
      const list = allowed.split(',').map(e => e.trim().toLowerCase());
      if (!list.includes(email.toLowerCase())) {
        return res.status(403).json({ ok: false, error: 'This email is not authorized to register.' });
      }
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ ok: false, error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, password: hash, name: name || email.split('@')[0] });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ ok: false, error: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, token, user: { id: user._id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET workspace data
app.get('/api/data', auth, async (req, res) => {
  try {
    let data = await WorkspaceData.findOne({ userId: req.user.id });
    if (!data) data = await WorkspaceData.create({ userId: req.user.id });
    res.json({ ok: true, data });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// SAVE workspace data (full replace)
app.post('/api/data', auth, async (req, res) => {
  try {
    const { tasks, projects, calEvents, files, notes, activity, goals, journal, writing, vault, timeline, travel, career } = req.body;
    const data = await WorkspaceData.findOneAndUpdate(
      { userId: req.user.id },
      { tasks, projects, calEvents, files, notes, activity, goals, journal, writing, vault, timeline, travel, career, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true, updatedAt: data.updatedAt });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Change password
app.post('/api/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(401).json({ ok: false, error: 'Current password is wrong' });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
