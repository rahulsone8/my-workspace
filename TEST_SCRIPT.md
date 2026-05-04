# Life OS - Full Test Run

## Current Status: ✅ RUNNING

**Server**: http://localhost:3000
**Database**: MongoDB Atlas (Connected)
**Frontend**: Working (HTML, CSS, JS all serving)
**Backend**: Express API responding

---

## Complete Test Flow

### Step 1: Open in Browser
```
Visit: http://localhost:3000
You should see: Life OS Login/Register Page
```

### Step 2: Create a New Account
```
Email: swamirahul209@gmail.com (already exists)
Or use a different test email

Allowed emails only: swamirahul209@gmail.com
```

### Step 3: Test Features After Login

**Test 1 - Life Dashboard**
- [ ] Page loads with welcome greeting
- [ ] See "Who I am becoming" section
- [ ] See "Current mission" section
- [ ] See "Top 3 priorities" section

**Test 2 - Create Task**
- [ ] Click "+ Add" button
- [ ] Fill in task name
- [ ] Click save
- [ ] Task appears in Daily Tasks
- [ ] Refresh page - task still there

**Test 3 - Create Goal**
- [ ] Navigate to "Life Goals"
- [ ] Click add goal
- [ ] Fill goal details
- [ ] Save goal
- [ ] See it in 5-year goals section

**Test 4 - Create Journal Entry**
- [ ] Navigate to "Journal"
- [ ] Click add entry
- [ ] Write something
- [ ] Add mood
- [ ] Save
- [ ] Entry appears in journal

**Test 5 - Personal Vault**
- [ ] Navigate to "Personal Vault"
- [ ] Add a note/password
- [ ] Save
- [ ] Verify it's in vault

**Test 6 - Data Persistence**
- [ ] Create some content
- [ ] Refresh page (Cmd+R)
- [ ] All content should still be there

**Test 7 - Sync Indicator**
- [ ] Look at bottom left sidebar
- [ ] You should see a sync dot
- [ ] When saving, it should show "Syncing..."
- [ ] Then "Synced"

**Test 8 - Mobile View**
- [ ] Press F12 (open dev tools)
- [ ] Click device toggle (mobile view)
- [ ] Sidebar should hide
- [ ] Bottom navigation should show
- [ ] All features should work

---

## Expected Behavior

✅ **On First Visit:**
- Loader animation
- Auth page appears
- Can register or login

✅ **After Login:**
- Life Dashboard loads
- All 8 sections visible in sidebar
- Can navigate between pages
- Data auto-saves every 5 seconds

✅ **Creating Content:**
- Modal opens when clicking "+" or section add buttons
- Form validates input
- Saves to MongoDB
- Appears immediately on page
- Persists after refresh

✅ **Offline Mode:**
- Data stored in localStorage
- Works even if MongoDB is down
- Syncs when connection restored

✅ **API Endpoints:**
- POST /api/register → Creates user
- POST /api/login → Returns JWT token
- GET /api/data → Fetches user's data (requires token)
- POST /api/data → Saves user's data (requires token)
- POST /api/change-password → Changes password

---

## File Structure

```
/Users/rahulswami/my-workspace/
├── public/
│   ├── index.html       (214 lines)
│   ├── styles.css       (364 lines)
│   └── app.js           (1,133 lines)
├── server/
│   └── server.js        (162 lines)
├── .env                 (config)
├── package.json         (dependencies)
├── package-lock.json
├── ARCHITECTURE.md      (documentation)
├── QUICK_START.md       (setup guide)
└── TEST_SCRIPT.md       (this file)
```

---

## Troubleshooting

**Issue: Can't login**
- Check email is in ALLOWED_EMAILS in .env
- Create new account first
- Check password is correct

**Issue: Data not saving**
- Check MongoDB connection (shown in server logs)
- Check sync indicator in sidebar
- Try refreshing page
- Check browser console for errors (F12)

**Issue: Styles not loading**
- Hard refresh (Cmd+Shift+R on Mac)
- Clear browser cache
- Check curl can reach styles.css

**Issue: JavaScript not working**
- Check browser console for errors (F12)
- Check curl can reach app.js
- Restart server

---

## Quick Commands

```bash
# Start server
cd /Users/rahulswami/my-workspace
node server/server.js

# Stop server
# Press Ctrl+C

# Check if running
curl http://localhost:3000

# Check MongoDB
# Look for "✅ MongoDB connected" in server logs
```

---

## Success Criteria (All Must Pass)

- [ ] Can visit http://localhost:3000
- [ ] Can create/login account
- [ ] Can create tasks
- [ ] Can create goals
- [ ] Can create journal entries
- [ ] Can navigate all 8 sections
- [ ] Data persists after refresh
- [ ] No errors in browser console
- [ ] Sync indicator shows status
- [ ] Mobile view works

**If all above pass: ✅ READY FOR DEPLOYMENT**

