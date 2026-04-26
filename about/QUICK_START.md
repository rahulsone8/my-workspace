# Life OS - Quick Start Guide

## 🚀 Running the App

### Option 1: Already Running (on port 3000)
Just open your browser and go to: **http://localhost:3000**

### Option 2: Start Fresh
```bash
cd /Users/rahulswami/my-workspace
npm install
node server.js
# Then visit http://localhost:3000
```

## 🔐 Login Credentials
- **Email**: swamirahul209@gmail.com
- **Password**: (use the one you set up)

## 📁 Main Files Separated

| File | Size | Purpose |
|------|------|---------|
| `index.html` | 11 KB | HTML structure (214 lines) |
| `styles.css` | 25 KB | All CSS styling (364 lines) |
| `app.js` | 42 KB | JavaScript logic (1,133 lines) |
| `server.js` | 6.6 KB | Express backend (161 lines) |
| **Total** | **85 KB** | Complete working app |

## 🎯 Features You Get

### 8 New Life OS Sections
1. **Life Dashboard** - Your mission & priorities
2. **Life Goals** - 5-year, yearly, monthly goals
3. **Personal Vault** - Private notes & thoughts
4. **Daily Journal** - Mood tracking & reflections
5. **Writing Space** - Novel, poetry, ideas
6. **Life Timeline** - Important moments
7. **Travel Dreams** - Places you want to go
8. **Career + Startup** - Skills & progress tracking

### Plus Original Features
- Daily Tasks
- Projects
- Calendar
- Files
- Notes

## ⚙️ Configuration

Edit `.env` file:
```
MONGO_URI=mongodb+srv://...  # MongoDB connection
JWT_SECRET=your_secret_here
PORT=3000                     # Change if port is in use
ALLOWED_EMAILS=your@email.com # Who can register
```

## 🌟 Key Features

✅ **Separated Architecture** - HTML, CSS, JS are independent files
✅ **Premium UI** - Notion-like dark theme with animations  
✅ **Mobile Responsive** - Works on all devices
✅ **Auto-Save** - Syncs every 5 seconds to MongoDB
✅ **Offline Mode** - Works offline with local storage
✅ **Secure Auth** - JWT tokens + password hashing
✅ **All Persistent** - Data stored in MongoDB Atlas

## 🔧 Development

### Modifying Files

**index.html** - Add new page sections here
**styles.css** - Update colors, fonts, layout
**app.js** - Add new functions or features
**server.js** - Add new API endpoints

### Common Tasks

**Add a new page section:**
```html
<!-- In index.html -->
<div class="page" id="page-yourpage">
  <div class="page-head"><h2>Your Page</h2></div>
  <!-- Your content -->
</div>
```

**Add styling:**
```css
/* In styles.css */
#page-yourpage { /* your styles */ }
```

**Add logic:**
```javascript
// In app.js
function renderYourPage() {
  // Your logic here
}
```

## 🐛 Troubleshooting

**Port 3000 already in use?**
- Find process: `lsof -ti:3000` (get the number)
- Kill it: `kill -9 [NUMBER]`
- Restart: `node server.js`

**MongoDB connection error?**
- Check MONGO_URI in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure connection string is correct

**Styles not loading?**
- Clear browser cache (Cmd+Shift+Delete on Mac)
- Hard refresh (Cmd+Shift+R)

**JavaScript not working?**
- Check browser console (Cmd+Option+I)
- Look for 404 errors on app.js
- Verify API endpoint in browser console

## 📊 Deployment

### To Deploy to Render.com

1. Update app.js - API will auto-detect production
2. Push code to GitHub
3. Connect to Render.com
4. Set environment variables
5. Deploy!

The app automatically detects localhost vs production.

## 💾 Backup Your Data

Data is in MongoDB with automatic backups. Export in browser console:
```javascript
JSON.stringify(S, null, 2)  // Copy all user data
```

## 📚 Documentation

- **ARCHITECTURE.md** - Technical details & file structure
- **FINAL_VERIFICATION.md** - Complete checklist
- **QUICK_START.md** - This file
- **.env** - Configuration reference

---

**Status**: ✅ Ready to use
**Running on**: http://localhost:3000
**Database**: MongoDB Atlas (automatic backup)

Enjoy your Life OS! 🚀
