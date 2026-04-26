# Life OS - Setup & Running Locally

## ✅ What's Running

### **Frontend Server**
- **URL:** http://localhost:8000
- **Port:** 8000
- **Serves:** HTML, CSS, JavaScript
- **Process:** Node.js simple HTTP server

### **Backend API Server**
- **URL:** http://localhost:3000
- **Port:** 3000
- **Framework:** Express.js
- **Database:** MongoDB (Atlas - Cloud)
- **Features:** Auth, data sync, all Life OS endpoints

## 📋 File Structure

```
/Users/rahulswami/my-workspace/
├── index.html          ← Updated with Life OS UI
├── script.js           ← New Life OS JavaScript
├── server.js           ← Updated MongoDB schema
├── package.json        ← Dependencies
├── .env               ← MongoDB credentials
├── index.html.backup  ← Original backup
└── SETUP.md          ← This file
```

## 🚀 Quick Start

### Start Backend (if not running)
```bash
cd /Users/rahulswami/my-workspace
PORT=3000 npm start
```

### Start Frontend (if not running)
```bash
node /tmp/serve.js
```

### Access Application
```
http://localhost:8000
```

## 🎯 Features Implemented

### Life OS Sections
1. ✅ Life Dashboard - Mission & priorities
2. ✅ Life Goals - 5-year to monthly hierarchy
3. ✅ Personal Vault - Encrypted secrets storage
4. ✅ Daily Journal - Mood tracking & reflections
5. ✅ Writing Space - Novel, poetry, ideas, drafts
6. ✅ Life Timeline - Life events with visual timeline
7. ✅ Travel Dreams - Places to live, cultural learning
8. ✅ Career + Startup - Skills roadmap, startup tracking

### UI Enhancements
- Premium dark theme (Notion-like)
- Reorganized sidebar (Life → Tracking → Work → Archive)
- Hero banners and mission cards
- Smooth animations & transitions
- Mobile responsive design

### Backend
- MongoDB integration for all 8 sections
- JWT authentication
- Data persistence & sync
- Auto-save every 5 seconds

## 📊 Database Schema

Extended to include:
- `goals[]` - Goal entries by level
- `journal[]` - Daily journal entries
- `writing[]` - Writing pieces
- `vault[]` - Private entries
- `timeline[]` - Life events
- `travel[]` - Travel dreams
- `career{}` - Career & startup info

## 🔧 Configuration

**MongoDB** (in .env):
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
PORT=3000
```

**Frontend API URL** (in script.js):
```javascript
const API = 'http://localhost:3000'
```

Update this if backend runs on different port/host.

## 🧪 Testing

1. Open http://localhost:8000
2. Register with authorized email (check .env ALLOWED_EMAILS)
3. Create account & explore all 8 new sections
4. Try:
   - Add goal → see it in Life Goals
   - Write journal entry → appears in Journal
   - Save writing piece → shows in Writing Space
   - Add travel dream → appears in Travel
   - Create life event → shows in Timeline

## 📝 Notes

- All data syncs automatically to MongoDB
- Frontend caches data locally via `localStorage`
- Changes save every 5 seconds
- JWT tokens expire in 30 days
- App starts with "Life Dashboard" as default page

## 🛠️ Troubleshooting

**Port already in use?**
```bash
lsof -i :3000  # Check what's using port
```

**MongoDB connection error?**
- Check .env MONGO_URI is correct
- Ensure network access is enabled in MongoDB Atlas
- Verify credentials

**Frontend not loading?**
- Check http://localhost:8000 is accessible
- Verify all files copied correctly
- Check browser console for JS errors

---
**Last Updated:** 2026-04-26
**Version:** Life OS v1.0
