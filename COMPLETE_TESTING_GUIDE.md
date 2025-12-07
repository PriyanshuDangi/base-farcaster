# 🧪 Complete Testing Guide - Shoot It

## Quick Start

```bash
# Terminal 1 - Backend
cd backend && pnpm install && pnpm start

# Terminal 2 - Frontend  
pnpm install && pnpm dev

# Open http://localhost:3000/game
```

---

## Test Suite

### Test 1: Basic Matchmaking ✅
**Goal:** Verify two players can find each other

**Steps:**
1. Open `http://localhost:3000/game` in Browser 1
2. Click "Find Match"
3. See "Searching for opponent..."
4. Open `http://localhost:3000/game` in Browser 2 (incognito)
5. Click "Find Match"

**Expected:**
- Both windows show "Match Found!"
- Opponent username displayed
- 3-second countdown starts

**Pass Criteria:**
- ✅ Both players paired
- ✅ Countdown completes
- ✅ Game canvas appears

---

### Test 2: Player Controls ✅
**Goal:** Verify all controls work

**Steps:**
1. In game, press Arrow Keys / WASD
2. Hold Up / W key
3. Move mouse around
4. Click mouse or Spacebar
5. Fire 6 shots
6. Press R key

**Expected:**
- Left/Right: Player moves horizontally
- Up/W: Player flies up (orange glow)
- Mouse: Aim line follows cursor
- Click/Space: Yellow bullet fires
- After 6 shots: Can't shoot
- R key: "Reloading..." then ammo refills

**Pass Criteria:**
- ✅ All movement responsive
- ✅ Jetpack visual feedback
- ✅ Aim line accurate
- ✅ Bullets spawn correctly
- ✅ Reload works

---

### Test 3: Match Timer ✅
**Goal:** Verify timer counts down and changes color

**Steps:**
1. Start a match
2. Observe timer at top center
3. Wait 30 seconds
4. Wait 50 seconds
5. Wait until 0:00

**Expected:**
- Timer starts at "1:00"
- Counts down: 0:59, 0:58, etc.
- At 0:30 → turns yellow
- At 0:10 → turns red
- At 0:00 → match ends

**Pass Criteria:**
- ✅ Timer displays correctly
- ✅ Colors change at thresholds
- ✅ Match ends at 0:00

---

### Test 4: Combat & Damage ✅
**Goal:** Verify shooting and HP system

**Steps:**
1. Two players in match
2. Player 1 shoots Player 2
3. Hit Player 2 four times
4. Observe respawn

**Expected:**
- Bullet hits: Red flash on Player 2
- HP bar decreases: 100→75→50→25→0
- At 0 HP: Player becomes transparent
- After 2s: Player respawns at new position
- Respawned player flashes (invulnerable)
- After 1s: Normal state

**Pass Criteria:**
- ✅ Hit detection works
- ✅ HP updates correctly
- ✅ 4 hits = death
- ✅ Respawn system works
- ✅ Invulnerability period

---

### Test 5: Multiplayer Sync ✅
**Goal:** Verify real-time synchronization

**Steps:**
1. Two players in match
2. Player 1 moves around
3. Player 2 shoots bullets
4. Both players use jetpack

**Expected:**
- Window 1: See opponent (red) move in real-time
- Window 2: See opponent (blue) move in real-time
- Bullets appear instantly
- Jetpack glow syncs
- Position updates smooth

**Pass Criteria:**
- ✅ Movement syncs <100ms
- ✅ Bullets sync instantly
- ✅ No major desync
- ✅ Smooth interpolation

---

### Test 6: Kill Feed & End Screen ✅
**Goal:** Verify match end flow

**Steps:**
1. Play match to completion
2. Get 3 kills OR wait 60 seconds
3. Observe end screen

**Expected:**
- Kill feed shows: "X eliminated Y"
- At 3 kills: Match ends immediately
- At 0:00: Match ends with timer
- End screen shows:
  - "VICTORY!" or "DEFEAT"
  - Your stats (kills/deaths)
  - Opponent stats
  - Match duration
- Controls disabled

**Pass Criteria:**
- ✅ Kill feed displays
- ✅ Match ends correctly
- ✅ Stats are accurate
- ✅ Can't move after end

---

### Test 7: Wallet Connection ✅
**Goal:** Verify wallet integration

**Steps:**
1. Open game page
2. Click "Connect Wallet"
3. Select connector (MetaMask)
4. Approve connection

**Expected:**
- Wallet modal appears
- Shows available connectors
- Connection successful
- Address displayed: "0x1234...5678"
- Green "Connected" status

**Pass Criteria:**
- ✅ Wallet connects
- ✅ Address shown
- ✅ Status updates

---

### Test 8: Deposit Flow ✅
**Goal:** Verify entry fee deposit

**Requirements:**
- Wallet connected
- Base Sepolia testnet ETH

**Steps:**
1. Connect wallet
2. Click "Find Match"
3. Get matched
4. Deposit modal appears
5. Click "Confirm Deposit"
6. Approve in MetaMask
7. Wait for confirmation

**Expected:**
- Modal shows: "Deposit 0.001 ETH to play"
- Total pot: "Winner takes 0.002 ETH"
- MetaMask popup appears
- Transaction confirms
- Modal closes
- Game starts after confirmation

**Pass Criteria:**
- ✅ Deposit modal shows
- ✅ Transaction sent
- ✅ Confirmation detected
- ✅ Game starts

---

### Test 9: Prize Claiming ✅
**Goal:** Verify winner can claim prize

**Requirements:**
- Wallet connected
- Deposited entry fee
- Won the match

**Steps:**
1. Win match with wallet connected
2. End screen appears
3. "Claim Prize" button visible
4. Click "Claim Prize"
5. Approve in MetaMask
6. Wait for confirmation

**Expected:**
- Gold "Claim Prize" button
- Shows: "Prize Pool: 0.002 ETH"
- MetaMask popup
- Transaction confirms
- Success message: "Prize Claimed!"
- Trophy emoji 🏆

**Pass Criteria:**
- ✅ Button appears for winner
- ✅ Transaction sent
- ✅ ETH received in wallet
- ✅ Success feedback

---

### Test 10: Play Without Wallet ✅
**Goal:** Verify game works without blockchain

**Steps:**
1. Open game
2. DO NOT connect wallet
3. Click "Find Match"
4. Play complete match

**Expected:**
- No deposit modal
- Game starts immediately
- All gameplay works
- No blockchain transactions
- End screen shows normally
- No "Claim Prize" button

**Pass Criteria:**
- ✅ Can play without wallet
- ✅ Full gameplay functional
- ✅ No errors
- ✅ Good UX for testing

---

## Edge Case Tests

### Edge 1: Opponent Disconnect
1. Start match
2. Close one browser tab
3. Remaining player sees: "Opponent Disconnected"
4. Match ends
5. Can return to lobby

### Edge 2: Reload During Match
1. Start match
2. Refresh browser (F5)
3. Connection lost
4. Opponent sees disconnect message
5. Clean reconnection to lobby

### Edge 3: Shooting While Reloading
1. Fire 6 bullets
2. Press R to reload
3. Try to shoot during reload
4. Nothing happens (blocked)
5. After reload, can shoot again

### Edge 4: Multiple Rapid Clicks
1. Click mouse very fast
2. Bullets fire according to ammo
3. No extra bullets spawn
4. No errors in console

### Edge 5: Movement During Countdown
1. Match found
2. 3-2-1 countdown
3. Try to move/shoot
4. Controls blocked
5. After "GO!", controls work

---

## Performance Tests

### FPS Test
**Goal:** Verify smooth 60 FPS

1. Open browser dev tools
2. Performance tab
3. Play match
4. Check FPS counter
5. Should stay at 60 FPS

### Memory Test
**Goal:** No memory leaks

1. Play 5 matches in a row
2. Return to lobby each time
3. Check memory usage (Task Manager)
4. Should not continuously increase

### Network Test
**Goal:** Reasonable bandwidth usage

1. Open Network tab
2. Play match
3. Observe WebSocket traffic
4. Should be <100 KB/s per player

---

## Regression Tests

After any code changes, run these quick tests:

1. ✅ Can find match
2. ✅ 3-2-1 countdown works
3. ✅ Can move player
4. ✅ Can shoot bullets
5. ✅ HP decreases on hit
6. ✅ Timer counts down
7. ✅ Match ends at 0:00
8. ✅ End screen appears
9. ✅ Can return to lobby
10. ✅ Can start new match

---

## Browser Compatibility

### Tested Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)
- ✅ Brave (latest)

### Mobile Browsers
- ⚠️ Not optimized (desktop controls only)
- Future: Add touch controls

---

## Debug Checklist

### If matchmaking fails:
- [ ] Backend running on port 3001?
- [ ] Frontend running on port 3000?
- [ ] Check browser console for errors
- [ ] Check backend terminal for logs
- [ ] Try refreshing both browsers

### If bullets don't appear:
- [ ] Check console for errors
- [ ] Verify ammo > 0
- [ ] Check aim line is visible
- [ ] Try reloading (R key)

### If HP doesn't update:
- [ ] Verify bullet hit opponent
- [ ] Check socket connection
- [ ] Look for red flash on hit
- [ ] Check backend logs

### If wallet won't connect:
- [ ] MetaMask installed?
- [ ] On Base Sepolia network?
- [ ] Wallet unlocked?
- [ ] Try refreshing page

### If deposit fails:
- [ ] Enough ETH in wallet?
- [ ] On correct network (Base Sepolia)?
- [ ] Contract address correct?
- [ ] Check MetaMask for error

---

## Success Criteria Summary

| Feature | Test | Status |
|---------|------|--------|
| Matchmaking | Find opponent | ✅ |
| Countdown | 3-2-1-GO! | ✅ |
| Controls | Move/Shoot | ✅ |
| Combat | Hit detection | ✅ |
| HP System | Damage/Death | ✅ |
| Respawn | After death | ✅ |
| Timer | Countdown | ✅ |
| Kill Feed | Messages | ✅ |
| End Screen | Stats | ✅ |
| Wallet | Connection | ✅ |
| Deposit | Entry fee | ✅ |
| Prize | Claiming | ✅ |

---

## Automated Testing (Future)

Consider adding:
- Unit tests for game logic
- Integration tests for socket events
- E2E tests with Playwright
- Contract tests with Hardhat

---

## Test Results Template

```markdown
## Test Session: [Date]

### Environment
- Backend: Running ✅ / Not Running ❌
- Frontend: Running ✅ / Not Running ❌
- Network: Local / Deployed

### Tests Run
1. Matchmaking: PASS / FAIL
2. Controls: PASS / FAIL
3. Combat: PASS / FAIL
4. Timer: PASS / FAIL
5. Wallet: PASS / FAIL
6. Deposit: PASS / FAIL
7. Prize: PASS / FAIL

### Issues Found
- [Issue 1]
- [Issue 2]

### Notes
- [Any observations]
```

---

**Happy Testing!** 🧪✅

All tests passing = **Production Ready** 🚀

