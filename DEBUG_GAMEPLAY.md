# Debug Gameplay Issues

## Current Situation
✅ Backend running on port 3001  
✅ Players connecting  
✅ Match being created  
❌ No gameplay events (player-move, player-shoot)

## Debugging Steps

### Step 1: Check Browser Console

After refreshing and starting a game, check browser console for these messages:

**Expected logs in order:**
```
1. ✅ Connected to game server: [socket-id]
2. Match found, starting game: {...}
3. GameScene created
4. 🔌 Socket initialized: Connected
5. 🔌 Socket ID: [socket-id]
6. 🔌 Socket connected: true
7. [3-2-1 countdown]
8. ✅ Match started! Controls enabled: true
9. 🔌 Socket status at match start: true
```

**What you might see (problems):**
```
❌ Socket initialized: Not connected
❌ Socket ID: undefined
❌ Socket connected: false
❌ ⚠️ Socket not connected, cannot send player-move
```

### Step 2: Test in Browser Console

Once game is loaded, run these in browser console (F12):

```javascript
// 1. Check if socket exists
window.phaserGame?.scene?.scenes[0]?.socket

// 2. Check if socket is connected
window.phaserGame?.scene?.scenes[0]?.socket?.connected

// 3. Check if controls are enabled
window.phaserGame?.scene?.scenes[0]?.controlsEnabled

// 4. Manually send a test event
window.phaserGame?.scene?.scenes[0]?.socket?.emit('player-move', {
  x: 100, 
  y: 100, 
  velocityX: 0, 
  velocityY: 0, 
  flipX: false
})
```

### Step 3: Check What You See

After the commands above, tell me:
1. **Socket exists?** true/false
2. **Socket connected?** true/false  
3. **Controls enabled?** true/false
4. **Manual emit worked?** (check backend logs)

---

## Common Issues & Fixes

### Issue A: Socket ID Changes Between Matchmaking and Game

**Problem:** MatchQueue uses one socket, GameScene creates another

**Check:**
- Console during matchmaking: "Connected: ABC123"
- Console during game: "Connected: XYZ789"
- Different IDs = different sockets!

**Fix:** Update GameScene to reuse existing socket

### Issue B: Socket Not Connected When Game Starts

**Problem:** Game scene loads before socket connection completes

**Symptoms:**
- `socket.connected = false`
- Warning: "Socket not connected"

**Fix:** Wait for socket connection before starting game

### Issue C: Controls Not Enabled

**Problem:** Countdown never calls `startMatch()`

**Check console for:**
- "Match started! Controls enabled: true"
- If missing, countdown is stuck

**Fix:** Check countdown timer logic

### Issue D: Player Position Not Updating

**Problem:** Update loop not running

**Check:**
- Move player with WASD
- Look for console warnings
- If no warnings, events ARE being sent

---

## Quick Fixes to Try

### Fix 1: Hard Refresh Both Windows

```bash
# In each browser window:
1. Cmd+Shift+R (Mac) or Ctrl+Shift+F5 (Windows)
2. Go to http://localhost:3000/game
3. Open console (F12)
4. Click "Find Match"
```

### Fix 2: Restart Frontend Only

```bash
# In frontend terminal:
Ctrl+C  # Stop
pnpm dev  # Restart
```

### Fix 3: Restart Both Servers

```bash
# Backend terminal:
Ctrl+C
cd backend && pnpm start

# Frontend terminal:
Ctrl+C
pnpm dev
```

---

## What Backend Should Show

When game is working correctly:

```
Player connected: ABC123
Player ABC123 looking for match: {...}
Player connected: XYZ789
Player XYZ789 looking for match: {...}
Match created: match_xxx

# After countdown (every 50ms):
[Should see position updates continuously]

# Example:
player-move from ABC123
player-move from XYZ789
player-move from ABC123
player-move from XYZ789
...

# When shooting:
player-shoot from ABC123
player-shoot from XYZ789
```

**If you DON'T see player-move or player-shoot events**, the socket isn't sending from frontend!

---

## Detailed Debug Output

### Run This Test

**Window 1:**
1. Open `http://localhost:3000/game`
2. Open console (F12)
3. Click "Find Match"

**Window 2 (Incognito):**
1. Open `http://localhost:3000/game`
2. Open console (F12)  
3. Click "Find Match"

**Wait for countdown to finish, then:**

**In Window 1 console, run:**
```javascript
const scene = window.phaserGame?.scene?.scenes[0];
console.log('Scene exists:', !!scene);
console.log('Socket exists:', !!scene?.socket);
console.log('Socket connected:', scene?.socket?.connected);
console.log('Socket ID:', scene?.socket?.id);
console.log('Controls enabled:', scene?.controlsEnabled);
console.log('Match ended:', scene?.matchEnded);
console.log('Player exists:', !!scene?.player);
```

**Copy the output and share it!**

---

## Expected vs Actual

### Expected Behavior

**Backend logs after match starts:**
```
Match created: match_xxx
[50ms later]
player-move received
player-move received  
player-move received
[continuous stream of events]
```

**Browser console:**
```
✅ Connected to game server: ABC123
Match found!
GameScene created
🔌 Socket initialized: Connected
🔌 Socket ID: ABC123
🔌 Socket connected: true
3
2
1
GO!
✅ Match started! Controls enabled: true
🔌 Socket status at match start: true
```

### What You're Seeing

**Backend logs:**
```
Match created: match_xxx
[silence - no events]
```

**Browser console:**
```
[Need to see your actual console output]
```

---

## Next Steps

1. **Refresh browser and start a new match**
2. **Check browser console for the logs I added**
3. **Tell me what you see:**
   - Socket initialized: ?
   - Socket connected: ?
   - Controls enabled: ?
   - Any warnings?

4. **Run the debug commands in console**
5. **Share the output**

Then I can pinpoint the exact issue! 🔍

---

## Most Likely Issue

Based on the symptoms, I suspect:

**Socket is getting disconnected or replaced when game scene loads**

This would explain:
- ✅ Matchmaking works (socket connected)
- ✅ Match created (backend receives request)
- ❌ No gameplay events (socket disconnected in game scene)

Let me know what the debug logs show!

