const API = localStorage.getItem('myspace_api') || 'https://my-workspace-2udm.onrender.com';

let S = { 
  tasks:[], projects:[], calEvents:[], files:[], notes:[], activity:[],
  goals:[], journal:[], writing:[], vault:[], timeline:[], travel:[], 
  career:{ journey:'', skills:[], resume:'', startup:[] }
};

let token = localStorage.getItem('ms_token') || '';
let currentUser = JSON.parse(localStorage.getItem('ms_user') || 'null');
let currentCalMonth = new Date();
let currentTaskTab = 'today';
let currentGoalTab = 'all';
let currentWritingTab = 'all';

// ══════════════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════════════

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-tab').forEach(t => { if (t.textContent.toLowerCase().includes(tab)) t.classList.add('active'); });
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!email || !password) return showAuthError('Email and password required');
  
  try {
    const res = await fetch(`${API}/api/login`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email, password}) });
    const json = await res.json();
    if (!json.ok) return showAuthError(json.error || 'Login failed');
    
    token = json.token;
    currentUser = json.user;
    localStorage.setItem('ms_token', token);
    localStorage.setItem('ms_user', JSON.stringify(currentUser));
    location.reload();
  } catch (err) { showAuthError(err.message); }
}

async function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  if (!email || !password || !name) return showAuthError('All fields required');
  if (password.length < 6) return showAuthError('Password must be 6+ characters');
  
  try {
    const res = await fetch(`${API}/api/register`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({name, email, password}) });
    const json = await res.json();
    if (!json.ok) return showAuthError(json.error || 'Registration failed');
    
    showAuthSuccess('Account created! Signing in...');
    setTimeout(() => { document.getElementById('login-email').value = email; doLogin(); }, 1000);
  } catch (err) { showAuthError(err.message); }
}

function doLogout() {
  localStorage.clear();
  location.reload();
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg;
  el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 5000);
}

function showAuthSuccess(msg) {
  const el = document.getElementById('auth-success');
  el.textContent = msg;
  el.style.display = 'block';
}

// ══════════════════════════════════════════════════════════════════
// INIT & SYNC
// ══════════════════════════════════════════════════════════════════

async function init() {
  if (!token) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('auth-page').style.display = 'flex';
    return;
  }
  
  document.getElementById('loader-msg').textContent = 'Loading your life...';
  
  try {
    const res = await fetch(`${API}/api/data`, { headers: {'Authorization':`Bearer ${token}`} });
    const json = await res.json();
    if (json.ok && json.data) {
      S = json.data;
    }
    
    setupUI();
    renderAll();
    startSync();
    updateClock();
    setInterval(updateClock, 1000);
    
    setTimeout(() => {
      document.getElementById('loader').style.display = 'none';
      document.getElementById('app').classList.add('visible');
    }, 300);
  } catch (err) {
    console.error(err);
    showAuthError('Failed to load data');
    setTimeout(() => location.reload(), 2000);
  }
}

async function saveData() {
  try {
    const res = await fetch(`${API}/api/data`, {
      method: 'POST',
      headers: {'Content-Type':'application/json', 'Authorization':`Bearer ${token}`},
      body: JSON.stringify({
        tasks: S.tasks, projects: S.projects, calEvents: S.calEvents,
        files: S.files, notes: S.notes, activity: S.activity,
        goals: S.goals, journal: S.journal, writing: S.writing,
        vault: S.vault, timeline: S.timeline, travel: S.travel,
        career: S.career
      })
    });
    const json = await res.json();
    if (json.ok) {
      updateSyncStatus('Synced', true);
      setTimeout(() => updateSyncStatus('Synced', false), 2000);
    }
  } catch (err) { console.error('Save error:', err); }
}

function startSync() {
  setInterval(saveData, 5000);
}

function updateSyncStatus(msg, isActive) {
  const dot = document.getElementById('sync-dot');
  const label = document.getElementById('sync-label');
  label.textContent = msg;
  dot.style.background = isActive ? 'var(--green)' : 'var(--text3)';
}

function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('clock').textContent = `${hours}:${mins}`;
}

function setupUI() {
  const avatar = currentUser.name.charAt(0).toUpperCase();
  document.getElementById('user-avatar').textContent = avatar;
  document.getElementById('user-name').textContent = currentUser.name;
  document.getElementById('user-email').textContent = currentUser.email;
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      navTo(page);
      closeSidebar();
    });
  });
}

// ══════════════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════════════

function navTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(`page-${page}`).classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  
  document.querySelectorAll('.mob-nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-mob="${page}"]`)?.classList.add('active');
  
  renderPageContent(page);
}

function renderPageContent(page) {
  switch(page) {
    case 'life-dashboard': renderLifeDashboard(); break;
    case 'goals': renderGoals(); break;
    case 'vault': renderVault(); break;
    case 'journal': renderJournal(); break;
    case 'writing': renderWriting(); break;
    case 'timeline': renderTimelineView(); break;
    case 'travel': renderTravel(); break;
    case 'career': renderCareer(); break;
    case 'tasks': renderTasks(); break;
    case 'projects': renderProjects(); break;
    case 'calendar': renderCal(); break;
    case 'files': renderFiles(); break;
    case 'notes': renderNotes(); break;
  }
}

function openSidebar() { document.getElementById('sidebar').classList.add('mobile-open'); document.getElementById('sidebar-overlay').classList.add('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('mobile-open'); document.getElementById('sidebar-overlay').classList.remove('open'); }

// ══════════════════════════════════════════════════════════════════
// LIFE DASHBOARD
// ══════════════════════════════════════════════════════════════════

function renderLifeDashboard() {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  if (hour >= 12) greeting = 'Good afternoon';
  if (hour >= 17) greeting = 'Good evening';
  if (hour >= 21) greeting = 'Good night';
  
  document.getElementById('life-greeting').textContent = greeting + ' ✨';
  
  let topPriorities = '<div style="display:flex;flex-direction:column;gap:8px;">';
  for (let i = 1; i <= 3; i++) {
    topPriorities += `
      <div class="priority-box">
        <div class="priority-num">${i}</div>
        <div class="priority-text" id="priority-${i}">Your life priority #${i}</div>
      </div>
    `;
  }
  topPriorities += '</div>';
  document.getElementById('top-priorities').innerHTML = topPriorities;
  
  let lifeDir = '<div style="font-size:13px;line-height:1.6;color:var(--text2);">';
  lifeDir += '<p>✨ <strong>Vision:</strong> Become the best version of yourself while creating meaningful impact</p>';
  lifeDir += '<p style="margin-top:8px;">🎯 <strong>Current Focus:</strong> Building your personal operating system</p>';
  lifeDir += '<p style="margin-top:8px;">📈 <strong>Growth Areas:</strong> Skills, mindset, health, relationships</p>';
  lifeDir += '</div>';
  document.getElementById('life-direction').innerHTML = lifeDir;
}

function editMission() {
  const current = document.getElementById('current-mission').textContent;
  const newMission = prompt('Update your mission:', current);
  if (newMission) {
    document.getElementById('current-mission').textContent = newMission;
    toast('Mission updated');
  }
}

// ══════════════════════════════════════════════════════════════════
// GOALS
// ══════════════════════════════════════════════════════════════════

function renderGoals() {
  const filtered = currentGoalTab === 'all' ? S.goals : S.goals.filter(g => g.level === currentGoalTab);
  let html = '';
  
  if (filtered.length === 0) {
    html = '<div class="empty"><div class="empty-icon">🎯</div><p>No goals yet. Start building your vision!</p></div>';
  } else {
    filtered.forEach(goal => {
      html += `
        <div class="goal-item" onclick="editGoalModal('${goal.id}')">
          <div class="goal-level">${goal.level}</div>
          <div class="goal-title">${goal.title}</div>
          <div class="goal-desc">${goal.desc}</div>
          <div class="goal-progress">
            <div class="goal-fill" style="width:${goal.progress}%;"></div>
          </div>
          <div style="font-size:11px;color:var(--text3);margin-top:6px;">${goal.progress}% complete</div>
        </div>
      `;
    });
  }
  
  document.getElementById('goals-list').innerHTML = html;
}

function switchGoalTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  currentGoalTab = tab;
  renderGoals();
}

function openGoalModal() {
  document.getElementById('edit-goal-id').value = '';
  document.getElementById('goal-title').value = '';
  document.getElementById('goal-level').value = '5year';
  document.getElementById('goal-progress').value = '0';
  document.getElementById('goal-desc').value = '';
  openModal('modal-goal');
}

function editGoalModal(id) {
  const goal = S.goals.find(g => g.id === id);
  if (!goal) return;
  document.getElementById('edit-goal-id').value = id;
  document.getElementById('goal-title').value = goal.title;
  document.getElementById('goal-level').value = goal.level;
  document.getElementById('goal-progress').value = goal.progress;
  document.getElementById('goal-desc').value = goal.desc;
  openModal('modal-goal');
}

function saveGoal() {
  const id = document.getElementById('edit-goal-id').value;
  const title = document.getElementById('goal-title').value.trim();
  if (!title) return toast('Title required');
  
  const goal = {
    id: id || Date.now().toString(),
    title,
    level: document.getElementById('goal-level').value,
    progress: parseInt(document.getElementById('goal-progress').value),
    desc: document.getElementById('goal-desc').value
  };
  
  if (id) {
    S.goals = S.goals.map(g => g.id === id ? goal : g);
  } else {
    S.goals.push(goal);
  }
  
  saveData();
  closeModal('modal-goal');
  renderGoals();
  toast('Goal saved!');
}

// ══════════════════════════════════════════════════════════════════
// VAULT (PRIVATE)
// ══════════════════════════════════════════════════════════════════

function renderVault() {
  let passwords = '';
  let philosophy = '';
  let decisions = '';
  
  S.vault.forEach(item => {
    const html = `
      <div class="vault-item">
        <div class="vault-label">${item.type}</div>
        <div class="vault-title">${item.title}</div>
        <div class="vault-secure">🔒 Private • ${new Date(item.date).toLocaleDateString()}</div>
      </div>
    `;
    
    if (item.type === 'password') passwords += html;
    else if (item.type === 'philosophy') philosophy += html;
    else if (item.type === 'decision') decisions += html;
  });
  
  if (!passwords) passwords = '<div class="empty" style="padding:20px;"><p>No passwords saved</p></div>';
  if (!philosophy) philosophy = '<div class="empty" style="padding:20px;"><p>No philosophy saved</p></div>';
  if (!decisions) decisions = '<div class="empty" style="padding:20px;"><p>No decisions logged</p></div>';
  
  document.getElementById('vault-passwords').innerHTML = passwords;
  document.getElementById('vault-philosophy').innerHTML = philosophy;
  document.getElementById('vault-decisions').innerHTML = decisions;
}

function openVaultModal() {
  document.getElementById('edit-vault-id').value = '';
  document.getElementById('vault-type').value = 'password';
  document.getElementById('vault-title').value = '';
  document.getElementById('vault-content').value = '';
  openModal('modal-vault');
}

function saveVault() {
  const id = document.getElementById('edit-vault-id').value;
  const type = document.getElementById('vault-type').value;
  const title = document.getElementById('vault-title').value.trim();
  if (!title) return toast('Title required');
  
  const item = {
    id: id || Date.now().toString(),
    type,
    title,
    content: document.getElementById('vault-content').value,
    date: new Date()
  };
  
  if (id) {
    S.vault = S.vault.map(v => v.id === id ? item : v);
  } else {
    S.vault.push(item);
  }
  
  saveData();
  closeModal('modal-vault');
  renderVault();
  toast('Vault entry saved!');
}

// ══════════════════════════════════════════════════════════════════
// JOURNAL
// ══════════════════════════════════════════════════════════════════

function renderJournal() {
  let html = '';
  
  if (S.journal.length === 0) {
    html = '<div class="empty"><div class="empty-icon">📝</div><p>No journal entries yet. Start reflecting!</p></div>';
  } else {
    S.journal.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      html += `
        <div class="journal-entry" onclick="editJournalModal('${entry.id}')">
          <div class="journal-date">${date}</div>
          <div class="journal-mood">${entry.mood}</div>
          <div class="journal-preview">${entry.reflection.substring(0, 80)}...</div>
        </div>
      `;
    });
  }
  
  document.getElementById('journal-list').innerHTML = html;
}

function openJournalModal() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('edit-journal-id').value = '';
  document.getElementById('journal-date').value = today;
  document.getElementById('journal-mood').value = '😊';
  document.getElementById('journal-learned').value = '';
  document.getElementById('journal-felt').value = '';
  document.getElementById('journal-reflection').value = '';
  openModal('modal-journal');
}

function editJournalModal(id) {
  const entry = S.journal.find(j => j.id === id);
  if (!entry) return;
  document.getElementById('edit-journal-id').value = id;
  document.getElementById('journal-date').value = entry.date.split('T')[0];
  document.getElementById('journal-mood').value = entry.mood;
  document.getElementById('journal-learned').value = entry.learned;
  document.getElementById('journal-felt').value = entry.felt;
  document.getElementById('journal-reflection').value = entry.reflection;
  openModal('modal-journal');
}

function saveJournal() {
  const id = document.getElementById('edit-journal-id').value;
  const reflection = document.getElementById('journal-reflection').value.trim();
  if (!reflection) return toast('Reflection required');
  
  const entry = {
    id: id || Date.now().toString(),
    date: document.getElementById('journal-date').value,
    mood: document.getElementById('journal-mood').value,
    learned: document.getElementById('journal-learned').value,
    felt: document.getElementById('journal-felt').value,
    reflection
  };
  
  if (id) {
    S.journal = S.journal.map(j => j.id === id ? entry : j);
  } else {
    S.journal.push(entry);
  }
  
  saveData();
  closeModal('modal-journal');
  renderJournal();
  toast('Entry saved!');
}

// ══════════════════════════════════════════════════════════════════
// WRITING
// ══════════════════════════════════════════════════════════════════

function renderWriting() {
  const filtered = currentWritingTab === 'all' ? S.writing : S.writing.filter(w => w.type === currentWritingTab);
  let html = '';
  
  if (filtered.length === 0) {
    html = '<div class="empty"><div class="empty-icon">✍️</div><p>No writing pieces yet. Start creating!</p></div>';
  } else {
    filtered.forEach(piece => {
      html += `
        <div class="card" onclick="editWritingModal('${piece.id}')" style="cursor:pointer;">
          <div class="card-title">${piece.type}</div>
          <div style="font-size:15px;font-weight:600;margin-bottom:8px;">${piece.title}</div>
          <div style="font-size:12px;color:var(--text2);margin-bottom:8px;">${piece.content.substring(0, 100)}...</div>
          <div style="font-size:11px;color:var(--text3);">${piece.content.split(' ').length} words</div>
        </div>
      `;
    });
  }
  
  document.getElementById('writing-list').innerHTML = html;
}

function switchWritingTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  currentWritingTab = tab;
  renderWriting();
}

function openWritingModal() {
  document.getElementById('edit-writing-id').value = '';
  document.getElementById('writing-title').value = '';
  document.getElementById('writing-type').value = 'draft';
  document.getElementById('writing-content').value = '';
  openModal('modal-writing');
}

function editWritingModal(id) {
  const piece = S.writing.find(w => w.id === id);
  if (!piece) return;
  document.getElementById('edit-writing-id').value = id;
  document.getElementById('writing-title').value = piece.title;
  document.getElementById('writing-type').value = piece.type;
  document.getElementById('writing-content').value = piece.content;
  openModal('modal-writing');
}

function saveWriting() {
  const id = document.getElementById('edit-writing-id').value;
  const title = document.getElementById('writing-title').value.trim();
  const content = document.getElementById('writing-content').value.trim();
  if (!title || !content) return toast('Title and content required');
  
  const piece = {
    id: id || Date.now().toString(),
    title,
    type: document.getElementById('writing-type').value,
    content,
    date: new Date()
  };
  
  if (id) {
    S.writing = S.writing.map(w => w.id === id ? piece : w);
  } else {
    S.writing.push(piece);
  }
  
  saveData();
  closeModal('modal-writing');
  renderWriting();
  toast('Writing saved!');
}

// ══════════════════════════════════════════════════════════════════
// TIMELINE
// ══════════════════════════════════════════════════════════════════

function renderTimelineView() {
  let html = '';
  
  if (S.timeline.length === 0) {
    html = '<div class="empty"><div class="empty-icon">⏳</div><p>Your life story begins here. Add important moments!</p></div>';
  } else {
    S.timeline.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach((item, i) => {
      const colors = { achievement: 'var(--green)', failure: 'var(--red)', decision: 'var(--blue)', moment: 'var(--accent)' };
      html += `
        <div class="timeline-item">
          <div class="timeline-side">
            <div class="timeline-dot" style="background:${colors[item.type] || 'var(--accent)'};" onclick="editTimelineModal('${item.id}')"></div>
            ${i < S.timeline.length - 1 ? '<div class="timeline-line"></div>' : ''}
          </div>
          <div class="timeline-body">
            <div class="timeline-time">${new Date(item.date).toLocaleDateString()}</div>
            <div class="timeline-text"><strong>${item.title}</strong></div>
            <div style="font-size:12px;color:var(--text2);margin-top:4px;">${item.story}</div>
          </div>
        </div>
      `;
    });
  }
  
  document.getElementById('timeline-list').innerHTML = html;
}

function openTimelineModal() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('edit-timeline-id').value = '';
  document.getElementById('timeline-title').value = '';
  document.getElementById('timeline-date').value = today;
  document.getElementById('timeline-type').value = 'moment';
  document.getElementById('timeline-story').value = '';
  openModal('modal-timeline');
}

function editTimelineModal(id) {
  const item = S.timeline.find(t => t.id === id);
  if (!item) return;
  document.getElementById('edit-timeline-id').value = id;
  document.getElementById('timeline-title').value = item.title;
  document.getElementById('timeline-date').value = item.date;
  document.getElementById('timeline-type').value = item.type;
  document.getElementById('timeline-story').value = item.story;
  openModal('modal-timeline');
}

function saveTimeline() {
  const id = document.getElementById('edit-timeline-id').value;
  const title = document.getElementById('timeline-title').value.trim();
  if (!title) return toast('Title required');
  
  const item = {
    id: id || Date.now().toString(),
    title,
    date: document.getElementById('timeline-date').value,
    type: document.getElementById('timeline-type').value,
    story: document.getElementById('timeline-story').value
  };
  
  if (id) {
    S.timeline = S.timeline.map(t => t.id === id ? item : t);
  } else {
    S.timeline.push(item);
  }
  
  saveData();
  closeModal('modal-timeline');
  renderTimelineView();
  toast('Timeline event saved!');
}

// ══════════════════════════════════════════════════════════════════
// TRAVEL
// ══════════════════════════════════════════════════════════════════

function renderTravel() {
  let html = '';
  
  if (S.travel.length === 0) {
    html = '<div class="empty"><div class="empty-icon">✈️</div><p>Dream your next adventure!</p></div>';
  } else {
    S.travel.forEach(place => {
      html += `
        <div class="travel-card" onclick="editTravelModal('${place.id}')">
          <div class="travel-city">📍 ${place.city}</div>
          <div class="travel-stay">${place.duration}</div>
          <div class="travel-goal">${place.why}</div>
        </div>
      `;
    });
  }
  
  document.getElementById('travel-list').innerHTML = html;
}

function openTravelModal() {
  document.getElementById('edit-travel-id').value = '';
  document.getElementById('travel-place').value = '';
  document.getElementById('travel-duration').value = '1-2 years';
  document.getElementById('travel-timeline').value = '';
  document.getElementById('travel-why').value = '';
  document.getElementById('travel-learn').value = '';
  openModal('modal-travel');
}

function editTravelModal(id) {
  const place = S.travel.find(t => t.id === id);
  if (!place) return;
  document.getElementById('edit-travel-id').value = id;
  document.getElementById('travel-place').value = place.city;
  document.getElementById('travel-duration').value = place.duration;
  document.getElementById('travel-timeline').value = place.timeline;
  document.getElementById('travel-why').value = place.why;
  document.getElementById('travel-learn').value = place.learn;
  openModal('modal-travel');
}

function saveTravel() {
  const id = document.getElementById('edit-travel-id').value;
  const city = document.getElementById('travel-place').value.trim();
  if (!city) return toast('City/Country required');
  
  const place = {
    id: id || Date.now().toString(),
    city,
    duration: document.getElementById('travel-duration').value,
    timeline: document.getElementById('travel-timeline').value,
    why: document.getElementById('travel-why').value,
    learn: document.getElementById('travel-learn').value
  };
  
  if (id) {
    S.travel = S.travel.map(t => t.id === id ? place : t);
  } else {
    S.travel.push(place);
  }
  
  saveData();
  closeModal('modal-travel');
  renderTravel();
  toast('Travel dream saved!');
}

// ══════════════════════════════════════════════════════════════════
// CAREER
// ══════════════════════════════════════════════════════════════════

function renderCareer() {
  let journey = S.career?.journey || 'Update your journey...';
  let skillsHtml = '';
  
  if (S.career?.skills && S.career.skills.length > 0) {
    S.career.skills.forEach(skill => {
      skillsHtml += `
        <div class="skill-item">
          <div class="skill-status ${skill.status === 'done' ? 'done' : 'learning'}">
            ${skill.status === 'done' ? '✓' : '◐'}
          </div>
          <div class="skill-name">${skill.name}</div>
          <div class="skill-pct">${skill.pct}%</div>
        </div>
      `;
    });
  } else {
    skillsHtml = '<div style="font-size:12px;color:var(--text2);">No skills added yet</div>';
  }
  
  let startupHtml = '<div style="font-size:12px;color:var(--text2);">No startup progress yet</div>';
  if (S.career?.startup && S.career.startup.length > 0) {
    startupHtml = '';
    S.career.startup.forEach(item => {
      startupHtml += `<div style="padding:10px 0;border-bottom:1px solid var(--border);"><strong>${item.idea}</strong><br><span style="font-size:12px;color:var(--text2);">${item.status}</span></div>`;
    });
  }
  
  document.getElementById('career-journey').innerHTML = `<div style="font-size:13px;color:var(--text2);">${journey}</div>`;
  document.getElementById('career-skills').innerHTML = skillsHtml;
  document.getElementById('startup-progress').innerHTML = startupHtml;
}

function openCareerModal() {
  document.getElementById('career-journey-text').value = S.career?.journey || '';
  document.getElementById('career-skill-next').value = '';
  document.getElementById('career-resume').value = '';
  openModal('modal-career');
}

function saveCareer() {
  S.career = S.career || {};
  S.career.journey = document.getElementById('career-journey-text').value;
  
  saveData();
  closeModal('modal-career');
  renderCareer();
  toast('Career updated!');
}

function openStartupModal() {
  document.getElementById('startup-idea').value = '';
  document.getElementById('startup-status').value = '';
  document.getElementById('startup-pct').value = '0';
  openModal('modal-startup');
}

function saveStartup() {
  S.career = S.career || {};
  S.career.startup = S.career.startup || [];
  
  const idea = document.getElementById('startup-idea').value.trim();
  if (!idea) return toast('Idea required');
  
  S.career.startup.push({
    idea,
    status: document.getElementById('startup-status').value,
    pct: parseInt(document.getElementById('startup-pct').value)
  });
  
  saveData();
  closeModal('modal-startup');
  renderCareer();
  toast('Startup progress saved!');
}

// ══════════════════════════════════════════════════════════════════
// TASKS (EXISTING)
// ══════════════════════════════════════════════════════════════════

function renderTasks() {
  const filter = document.getElementById('task-filter')?.value.toLowerCase() || '';
  let list = S.tasks;
  
  if (currentTaskTab === 'today') {
    const today = new Date().toISOString().split('T')[0];
    list = list.filter(t => t.due === today);
  } else if (currentTaskTab === 'done') {
    list = list.filter(t => t.done);
  }
  
  if (filter) list = list.filter(t => t.name.toLowerCase().includes(filter));
  
  let html = '';
  if (list.length === 0) {
    html = '<div class="empty"><div class="empty-icon">✨</div><p>All caught up!</p></div>';
  } else {
    list.forEach(task => {
      html += `
        <div class="task-item ${task.done ? 'done' : ''}">
          <div class="task-cb ${task.done ? 'checked' : ''}" onclick="toggleTask('${task.id}')"></div>
          <div class="task-body">
            <div class="task-name">${task.name}</div>
            <div class="task-meta-row">
              ${task.due ? `<span class="badge badge-date">${task.due}</span>` : ''}
              ${task.priority ? `<span class="badge badge-${task.priority}">${task.priority}</span>` : ''}
              ${task.category ? `<span class="task-cat">${task.category}</span>` : ''}
            </div>
          </div>
          <div class="task-actions">
            <button class="btn-icon" onclick="editTaskModal('${task.id}')">✎</button>
            <button class="btn-icon" onclick="deleteTask('${task.id}')">✕</button>
          </div>
        </div>
      `;
    });
  }
  
  document.getElementById('task-list').innerHTML = html;
  updateTaskBadge();
}

function toggleTask(id) {
  const task = S.tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveData();
    renderTasks();
  }
}

function openTaskModal() {
  document.getElementById('edit-task-id').value = '';
  document.getElementById('task-name').value = '';
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-due').value = '';
  document.getElementById('task-category').value = '';
  document.getElementById('task-notes').value = '';
  openModal('modal-task');
}

function editTaskModal(id) {
  const task = S.tasks.find(t => t.id === id);
  if (!task) return;
  document.getElementById('edit-task-id').value = id;
  document.getElementById('task-name').value = task.name;
  document.getElementById('task-priority').value = task.priority;
  document.getElementById('task-due').value = task.due;
  document.getElementById('task-category').value = task.category;
  document.getElementById('task-notes').value = task.notes;
  openModal('modal-task');
}

function saveTask() {
  const id = document.getElementById('edit-task-id').value;
  const name = document.getElementById('task-name').value.trim();
  if (!name) return toast('Task name required');
  
  const task = {
    id: id || Date.now().toString(),
    name,
    priority: document.getElementById('task-priority').value,
    due: document.getElementById('task-due').value,
    category: document.getElementById('task-category').value,
    notes: document.getElementById('task-notes').value,
    done: false
  };
  
  if (id) {
    S.tasks = S.tasks.map(t => t.id === id ? {...t, ...task} : t);
  } else {
    S.tasks.push(task);
  }
  
  saveData();
  closeModal('modal-task');
  renderTasks();
  toast('Task saved!');
}

function deleteTask(id) {
  if (confirm('Delete task?')) {
    S.tasks = S.tasks.filter(t => t.id !== id);
    saveData();
    renderTasks();
  }
}

function switchTaskTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  currentTaskTab = tab;
  renderTasks();
}

function updateTaskBadge() {
  const today = new Date().toISOString().split('T')[0];
  const count = S.tasks.filter(t => t.due === today && !t.done).length;
  const badge = document.getElementById('tasks-badge');
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'block';
  } else {
    badge.style.display = 'none';
  }
}

// ══════════════════════════════════════════════════════════════════
// PROJECTS, CALENDAR, FILES, NOTES (EXISTING)
// ══════════════════════════════════════════════════════════════════

function renderProjects() {
  let html = '';
  if (S.projects.length === 0) {
    html = '<div class="empty"><div class="empty-icon">🚀</div><p>No projects yet</p></div>';
  } else {
    S.projects.forEach(proj => {
      html += `<div class="card" style="cursor:pointer;" onclick="editProjectModal('${proj.id}')"><div class="card-title">${proj.name}</div><div style="font-size:13px;margin-bottom:10px;">${proj.desc}</div><div style="height:4px;background:var(--bg4);border-radius:2px;overflow:hidden;"><div style="height:100%;background:${proj.color};width:${proj.progress}%;"></div></div></div>`;
    });
  }
  document.getElementById('project-grid').innerHTML = html;
}

function openProjectModal() {
  document.getElementById('edit-proj-id').value = '';
  document.getElementById('proj-name').value = '';
  document.getElementById('proj-desc').value = '';
  document.getElementById('proj-start').value = '';
  document.getElementById('proj-end').value = '';
  openModal('modal-project');
}

function editProjectModal(id) {
  const proj = S.projects.find(p => p.id === id);
  if (!proj) return;
  document.getElementById('edit-proj-id').value = id;
  document.getElementById('proj-name').value = proj.name;
  document.getElementById('proj-desc').value = proj.desc;
  document.getElementById('proj-start').value = proj.start;
  document.getElementById('proj-end').value = proj.end;
  openModal('modal-project');
}

function saveProject() {
  const id = document.getElementById('edit-proj-id').value;
  const name = document.getElementById('proj-name').value.trim();
  if (!name) return toast('Project name required');
  
  const proj = {
    id: id || Date.now().toString(),
    name,
    desc: document.getElementById('proj-desc').value,
    start: document.getElementById('proj-start').value,
    end: document.getElementById('proj-end').value,
    color: '#6c63ff',
    progress: 0
  };
  
  if (id) {
    S.projects = S.projects.map(p => p.id === id ? proj : p);
  } else {
    S.projects.push(proj);
  }
  
  saveData();
  closeModal('modal-project');
  renderProjects();
  toast('Project saved!');
}

function renderCal() {
  const year = currentCalMonth.getFullYear();
  const month = currentCalMonth.getMonth();
  document.getElementById('cal-label').textContent = currentCalMonth.toLocaleDateString('en-US', {month:'long', year:'numeric'});
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  let html = '';
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  days.forEach(d => html += `<div class="cal-dname">${d}</div>`);
  
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-cell other-m"></div>';
  
  const today = new Date();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === today.toISOString().split('T')[0];
    const eventsForDay = S.calEvents.filter(e => e.date === dateStr);
    
    html += `<div class="cal-cell ${isToday ? 'today' : ''}"><div class="cal-num">${d}</div>`;
    eventsForDay.slice(0, 2).forEach(e => html += `<div class="cal-ev">• ${e.title}</div>`);
    html += '</div>';
  }
  
  document.getElementById('cal-grid').innerHTML = html;
}

function calPrev() { currentCalMonth.setMonth(currentCalMonth.getMonth() - 1); renderCal(); }
function calNext() { currentCalMonth.setMonth(currentCalMonth.getMonth() + 1); renderCal(); }
function calNow() { currentCalMonth = new Date(); renderCal(); }

function renderFiles() {
  let html = '';
  const search = document.getElementById('file-search')?.value.toLowerCase() || '';
  let files = S.files.filter(f => f.name.toLowerCase().includes(search));
  
  if (files.length === 0) {
    html = '<div class="empty"><div class="empty-icon">📁</div><p>No files yet</p></div>';
  } else {
    files.forEach(file => {
      html += `<div class="file-item"><div class="file-icon">📄</div><div class="file-name">${file.name}</div></div>`;
    });
  }
  
  document.getElementById('file-list').innerHTML = html;
}

function renderNotes() {
  let html = '';
  const search = document.getElementById('note-search')?.value.toLowerCase() || '';
  let notes = S.notes.filter(n => n.title.toLowerCase().includes(search));
  
  if (notes.length === 0) {
    html = '<div class="empty"><div class="empty-icon">📝</div><p>No notes yet</p></div>';
  } else {
    notes.forEach(note => {
      html += `<div class="card"><div class="card-title">${note.tag || 'Note'}</div><div style="font-size:14px;font-weight:600;">${note.title}</div><div style="font-size:12px;color:var(--text2);margin-top:8px;">${note.content.substring(0, 60)}...</div></div>`;
    });
  }
  
  document.getElementById('notes-grid').innerHTML = html;
}

function openNoteModal() {
  document.getElementById('edit-note-id').value = '';
  document.getElementById('note-title').value = '';
  document.getElementById('note-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('note-tag').value = '';
  document.getElementById('note-content').value = '';
  openModal('modal-note');
}

function saveNote() {
  const id = document.getElementById('edit-note-id').value;
  const title = document.getElementById('note-title').value.trim();
  if (!title) return toast('Note title required');
  
  const note = {
    id: id || Date.now().toString(),
    title,
    tag: document.getElementById('note-tag').value,
    content: document.getElementById('note-content').value,
    date: document.getElementById('note-date').value
  };
  
  if (id) {
    S.notes = S.notes.map(n => n.id === id ? note : n);
  } else {
    S.notes.push(note);
  }
  
  saveData();
  closeModal('modal-note');
  renderNotes();
  toast('Note saved!');
}

function openCalModal() {
  document.getElementById('ev-title').value = '';
  document.getElementById('ev-date').value = new Date().toISOString().split('T')[0];
  document.getElementById('ev-type').value = 'task';
  document.getElementById('ev-start').value = '';
  document.getElementById('ev-end').value = '';
  document.getElementById('ev-notes').value = '';
  openModal('modal-cal');
}

function saveCalEvent() {
  const title = document.getElementById('ev-title').value.trim();
  if (!title) return toast('Event title required');
  
  const event = {
    id: Date.now().toString(),
    title,
    date: document.getElementById('ev-date').value,
    type: document.getElementById('ev-type').value,
    start: document.getElementById('ev-start').value,
    end: document.getElementById('ev-end').value,
    notes: document.getElementById('ev-notes').value
  };
  
  S.calEvents.push(event);
  saveData();
  closeModal('modal-cal');
  renderCal();
  toast('Event saved!');
}

// ══════════════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════════════

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

function globalSearch(query) {
  if (!query) return;
  console.log('Searching for:', query);
}

function renderAll() {
  renderTasks();
  renderProjects();
  renderCal();
  renderFiles();
  renderNotes();
}

document.addEventListener('DOMContentLoaded', init);
