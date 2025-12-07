# Game Not Working Live - Troubleshooting

## Problem
Players connect and match is found, but the game doesn't work live:
- ❌ Can't see opponent move
- ❌ Bullets don't sync
- ❌ No real-time updates

## Root Cause
**Backend server is not running!**

The game needs **TWO servers** running simultaneously:
1. **Frontend** (Next.js) - Port 3000
2. **Backend** (Socket.io server) - Port 3001 ⚠️ **MISSING**

## Quick Fix

### Step 1: Check What's Running

Open browser dev tools (F12) → Console:
- ✅ If you see: `Connected to game server: xyz123`
- ❌ If you see: `Connection error: ...` or nothing

### Step 2: Start Backend Server

**Option A: Use the startup script**
```bash
chmod +x START_GAME.sh
./START_GAME.sh
```

**Option B: Manual (Recommended for debugging)**

**Terminal 1 - Backend:**
```bash
cd backend
pnpm install  # If first time
pnpm start
```

You should see:
```
🎮 Shoot It Game Server running on port 3001
```

**Terminal 2 - Frontend:**
```bash
pnpm dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
```

### Step 3: Verify Connection

1. Open `http://localhost:3000/game`
2. Open browser console (F12)
3. Look for: `✅ Connected to game server: [socket-id]`

If you see this, backend is working! ✅

---

## Common Issues & Solutions

### Issue 1: "Connection error" in console

**Problem:** Backend not running or wrong port

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3001/health

# Should return: {"status":"ok","activeMatches":0,"playersInQueue":0}
# If not, start backend in terminal
```

### Issue 2: Game loads but players don't sync

**Problem:** Socket connection dropped

**Solution:**
1. Check backend terminal for errors
2. Restart both servers
3. Hard refresh browser (Cmd+Shift+R)

### Issue 3: "CORS error"

**Problem:** Frontend/backend URL mismatch

**Check `backend/.env`:**
```env
FRONTEND_URL=http://localhost:3000
PORT=3001
```

**Restart backend after changing**

### Issue 4: Players match but game doesn't start

**Problem:** Phaser not loading or countdown stuck

**Solution:**
1. Check browser console for Phaser errors
2. Verify both players passed countdown
3. Check if controls are enabled (look for "GO!" message)

### Issue 5: Can move but can't see opponent

**Problem:** Socket events not being sent/received

**Debug in browser console:**
```javascript
// Check if socket is connected
window.phaserGame?.scene?.scenes[0]?.socket?.connected
// Should be: true

// Manually emit a test event
window.phaserGame?.scene?.scenes[0]?.socket?.emit('player-move', {x: 100, y: 100})
```

**Check backend logs:**
- Should see: "Player [id] looking for match"
- Should see: "Match created: match_xxx"
- Should see position updates

---

## Step-by-Step Debug Process

### 1. Start Backend First
```bash
cd backend
pnpm start
```

**Expected output:**
```
🎮 Shoot It Game Server running on port 3001
```

### 2. Test Backend Directly
```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{"status":"ok","activeMatches":0,"playersInQueue":0}
```

### 3. Start Frontend
```bash
pnpm dev
```

### 4. Test Connection
1. Open `http://localhost:3000/game`
2. Press F12 (dev tools)
3. Look at Console tab
4. Should see: `✅ Connected to game server`

### 5. Test Matchmaking

**Window 1:**
1. Click "Find Match"
2. Console should show: "Player [id] looking for match"

**Window 2 (incognito):**
1. Click "Find Match"
2. Both consoles show: "Match found!"
3. Backend terminal shows: "Match created: match_xxx"

### 6. Test Gameplay

Once in game:
1. Move player (WASD)
2. Check backend logs for "player-move" events
3. Check opponent window - should see movement
4. Try shooting - should see bullets in both windows

---

## What Should Be Working

### Before Match
- ✅ Socket connects on page load
- ✅ "Find Match" button enabled
- ✅ Click shows "Searching..."

### During Matchmaking
- ✅ Backend logs: "Player looking for match"
- ✅ When 2 players: "Match created"
- ✅ Both players get "Match found" event
- ✅ Opponent details shown

### During Countdown
- ✅ 3-2-1-GO! displays
- ✅ Controls disabled
- ✅ After "GO!", controls enabled

### During Game
- ✅ Player can move (WASD)
- ✅ Opponent sprite appears (red)
- ✅ Opponent moves in real-time
- ✅ Bullets appear for both players
- ✅ HP bars update
- ✅ Timer counts down
- ✅ Match ends properly

---

## Environment Check

### Backend Environment
**File: `backend/.env`**
```env
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment
**File: `.env.local`**
```env
NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001
```

**If these don't exist, create them!**

---

## Quick Diagnostic Commands

```bash
# 1. Check if backend running
lsof -i :3001

# 2. Check if frontend running
lsof -i :3000

# 3. Test backend health
curl http://localhost:3001/health

# 4. Kill stuck processes
kill -9 $(lsof -t -i:3001)  # Backend
kill -9 $(lsof -t -i:3000)  # Frontend
```

---

## Terminal Window Layout

Recommended setup:

```
┌─────────────────┬─────────────────┐
│  Terminal 1     │  Terminal 2     │
│  (Backend)      │  (Frontend)     │
│                 │                 │
│  cd backend     │  pnpm dev       │
│  pnpm start     │                 │
│                 │                 │
│  Backend logs   │  Frontend logs  │
│  appear here    │  appear here    │
└─────────────────┴─────────────────┘
```

---

## Success Checklist

Before playing, verify:

- [ ] Backend terminal shows: "🎮 Shoot It Game Server running on port 3001"
- [ ] Frontend terminal shows: "ready started server on 0.0.0.0:3000"
- [ ] Browser console shows: "✅ Connected to game server"
- [ ] No red errors in any terminal
- [ ] `curl http://localhost:3001/health` returns JSON

If all checked, game should work! ✅

---

## Still Not Working?

### Last Resort Steps:

1. **Kill everything:**
```bash
kill -9 $(lsof -t -i:3001)
kill -9 $(lsof -t -i:3000)
```

2. **Clean install:**
```bash
# Backend
cd backend
rm -rf node_modules
pnpm install

# Frontend
cd ..
rm -rf node_modules .next
pnpm install
```

3. **Restart from scratch:**
```bash
# Terminal 1
cd backend && pnpm start

# Terminal 2
pnpm dev
```

4. **Test with fresh browser:**
- Close all browser tabs
- Open incognito window
- Go to `http://localhost:3000/game`

---

## Getting Help

If still broken, check:
1. Backend terminal - any errors?
2. Frontend terminal - any errors?
3. Browser console - any red errors?
4. Network tab - WebSocket connected?

Share these details for faster debugging!

---

## Expected Behavior Summary

**Normal Flow:**
```
1. Backend starts → Logs "running on port 3001"
2. Frontend starts → Logs "ready on port 3000"
3. Open game page → Console: "Connected to game server"
4. Find match → Backend: "Player looking for match"
5. Second player joins → Backend: "Match created"
6. Both see countdown → 3-2-1-GO!
7. Game starts → Real-time sync works
8. Move/shoot → Opponent sees immediately
9. Match ends → Stats shown
```

**If any step fails, that's where to focus debugging!**

