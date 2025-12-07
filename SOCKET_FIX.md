# Socket Connection Fix - "xhr poll error"

## Problem
```
🔴 Connection error: xhr poll error
⚠️ Socket not connected, cannot send player-move
```

This means Socket.io **cannot connect** to the backend server due to CORS blocking.

## Root Cause
The Socket.io client tries to connect but the backend's CORS policy is too restrictive, blocking the polling transport.

## Solution Applied ✅

### 1. Updated Backend CORS (backend/server.js)
Made CORS more permissive for development:
- Allow all origins (`origin: '*'`)
- Allow all HTTP methods
- Enable both websocket and polling transports
- Add Engine.IO v3 compatibility

### 2. Updated Socket Client (lib/socket.ts)
Improved connection settings:
- Try websocket first, fall back to polling
- Increase reconnection attempts to 10
- Add timeout of 10 seconds
- Enable credentials

## How to Apply

**You MUST restart the backend server:**

```bash
# 1. Stop backend (in backend terminal)
Ctrl+C

# 2. Restart backend
cd backend
pnpm start

# 3. Also restart frontend for good measure
# (in frontend terminal)
Ctrl+C
pnpm dev
```

## Testing

After restarting both servers:

1. **Clear browser cache completely**
   - Open DevTools (F12)
   - Right-click refresh button
   - Click "Empty Cache and Hard Reload"
   - Or use Incognito window

2. **Open browser console**
   - Should see: `🔌 Connecting to game server: http://localhost:3001`
   - Should see: `✅ Connected to game server: [socket-id]`
   - Should NOT see: `🔴 Connection error`

3. **Test matchmaking**
   - Click "Find Match"
   - Should work without errors

4. **Test gameplay**
   - After countdown, press WASD
   - Backend should log: `player-move` events
   - No more warnings!

## Verification Checklist

After restarting:

- [ ] Backend shows: `🎮 Shoot It Game Server running on port 3001`
- [ ] Frontend shows: `ready started server on 0.0.0.0:3000`
- [ ] Browser console shows: `✅ Connected to game server`
- [ ] No `🔴 Connection error` messages
- [ ] No `⚠️ Socket not connected` warnings
- [ ] Backend logs show `player-move` events when playing

## If Still Not Working

### Test 1: Check Backend is Accessible
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","activeMatches":0,"playersInQueue":0}
```

If this fails, backend isn't running properly!

### Test 2: Check Network Tab
1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "WS" (WebSocket)
4. Refresh page
5. Look for connection to `localhost:3001`

**Should see:**
- Status: 101 (Switching Protocols) - WebSocket connected ✅
- OR polling requests succeeding ✅

**Should NOT see:**
- Status: Failed ❌
- CORS errors ❌

### Test 3: Try Different Port
If port 3001 is blocked, change it:

**backend/.env:**
```env
PORT=3002
```

**frontend .env.local:**
```env
NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3002
```

Restart both servers.

## Common Issues

### Issue 1: "Connection refused"
**Cause:** Backend not running  
**Fix:** Start backend with `cd backend && pnpm start`

### Issue 2: "CORS policy"
**Cause:** Old backend still running  
**Fix:** 
```bash
# Kill any process on port 3001
kill -9 $(lsof -t -i:3001)
# Restart backend
cd backend && pnpm start
```

### Issue 3: "ERR_CONNECTION_REFUSED"
**Cause:** Wrong URL or port  
**Fix:** Verify `.env.local` has `NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001`

### Issue 4: Still getting "xhr poll error"
**Cause:** Browser cache  
**Fix:**
1. Close ALL browser tabs
2. Quit browser completely
3. Reopen in incognito
4. Try again

## Production Note

⚠️ **For production deployment**, change CORS settings to:

```javascript
cors: {
  origin: process.env.FRONTEND_URL,  // Specific domain only
  methods: ["GET", "POST"],
  credentials: true
}
```

The current `origin: '*'` is **ONLY for development/testing**.

## Summary

**Problem:** CORS blocking Socket.io connection  
**Solution:** Made CORS permissive for development  
**Action Required:** **RESTART BACKEND SERVER** ⚠️  
**Expected Result:** Socket connects successfully ✅

---

**After restarting the backend, the game should work perfectly!** 🎮✅

