# Life OS - Architecture & File Structure

## Overview
Life OS has been reorganized into separate modular files for better maintainability and performance.

## File Structure

```
my-workspace/
├── index.html          (HTML - all markup & page structure)
├── styles.css          (CSS - all styling and themes)
├── app.js              (JavaScript - all logic & interactivity)
├── server.js           (Express backend - API & static serving)
├── package.json        (Dependencies)
├── .env                (Configuration: MONGO_URI, JWT_SECRET, PORT, ALLOWED_EMAILS)
├── node_modules/       (Dependencies)
└── [docs & other files]
```

## Key Features

### 1. **Separated Architecture**
- **index.html** - Contains only HTML structure (minimal, clean)
- **styles.css** - All CSS styling (~900 lines, organized by sections)
- **app.js** - All JavaScript logic (~1100 lines, fully modular)
- **server.js** - Express backend with MongoDB integration

### 2. **Frontend (Single Page App)**
- Index.html is loaded once and serves as the SPA shell
- Styles.css is linked externally (better caching)
- App.js handles all logic, routing, and API calls
- Automatic API detection: localhost:3000 in development, Render.com in production

### 3. **Backend (Express + MongoDB)**
- Single server.js serves both:
  - Static files (HTML, CSS, JS) - via `express.static()`
  - API routes (authentication, data sync)
- Fallback route ensures SPA routing works (`app.get('*')` serves index.html)
- MongoDB Atlas for persistent storage
- JWT authentication for secure data access

### 4. **Startup Sequence**
1. User visits http://localhost:3000
2. Server serves index.html
3. Browser loads styles.css and app.js
4. app.js initializes and checks for auth token
5. If no token → shows login/register page
6. If token exists → loads user data from MongoDB
7. Renders Life OS dashboard

### 5. **Data Sync**
- Auto-saves every 5 seconds to MongoDB
- LocalStorage backup for offline access
- Real-time sync status indicator in sidebar

## Running the App

### Development
```bash
cd /Users/rahulswami/my-workspace
npm install                 # Install dependencies
node server.js             # Start server
# Visit http://localhost:3000
```

### Configuration (.env)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
PORT=3000
ALLOWED_EMAILS=user@example.com
```

## 8 Life OS Sections

1. **Life Dashboard** - Daily focus, mission, top 3 priorities
2. **Life Goals** - 5-year, yearly, monthly, weekly goals with progress
3. **Personal Vault** - Private passwords, philosophy, decisions (encrypted UI)
4. **Daily Journal** - Reflections, mood tracking, learnings
5. **Writing Space** - Novel, poetry, ideas, drafts with editor
6. **Life Timeline** - Important moments, achievements, failures
7. **Travel Dreams** - Places to live, cultural learning goals
8. **Career + Startup** - Data engineer journey, skills roadmap, startup progress

Plus existing features:
- Daily Tasks, Projects, Calendar, Files, Notes

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/register | ✗ | Create new account |
| POST | /api/login | ✗ | Login & get token |
| GET | /api/data | ✓ | Get all user data |
| POST | /api/data | ✓ | Save all user data |
| POST | /api/change-password | ✓ | Update password |
| GET | / | ✗ | Health check |
| GET | * | ✗ | Serve index.html (SPA fallback) |

## Technologies

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Backend**: Express.js
- **Database**: MongoDB Atlas
- **Auth**: JWT tokens
- **Styling**: Custom CSS (no preprocessor)
- **Fonts**: Google Fonts (Clash Display, Cabinet Grotesk)

## File Sizes

- index.html: ~45 KB (all pages + modals)
- styles.css: 25 KB (all styling)
- app.js: 42 KB (all logic)
- Total transfer: ~112 KB (minified could be ~35-40 KB)

## Performance Optimizations

1. ✅ Separated CSS and JS for better caching
2. ✅ Static file serving via Express
3. ✅ Auto-save with debounce (5s interval)
4. ✅ LocalStorage fallback for offline mode
5. ✅ Minimal DOM manipulation
6. ✅ CSS variables for theming
7. ✅ Modular JavaScript functions

## Next Steps (Future Enhancements)

- [ ] Minify CSS & JS for production
- [ ] Add progressive web app (PWA) support
- [ ] Implement dark/light theme toggle
- [ ] Add file upload capability
- [ ] Real-time collaboration (WebSockets)
- [ ] Mobile app version (React Native)
- [ ] Data export (JSON, PDF)
- [ ] Backup & restore functionality

---

**Status**: ✅ Fully Functional on localhost:3000
**Last Updated**: April 26, 2026
