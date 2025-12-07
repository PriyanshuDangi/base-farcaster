# Game Testing Guide - Shoot It

## Overview
Phases 2-5 have been completed! This guide will help you test the game.

## What's Been Implemented

### ✅ Phase 2: Socket.io Connection
- **Socket client utility** (`lib/socket.ts`) - Singleton socket connection to game server
- **Match Queue component** (`components/Game/MatchQueue.tsx`) - UI for finding matches
- **Socket events**: `find-match`, `waiting-for-opponent`, `match-found`

### ✅ Phase 3: Basic Phaser Game Scene
- **PhaserGame wrapper** (`components/Game/PhaserGame.tsx`) - React component for Phaser
- **GameScene** (`lib/phaser/scenes/GameScene.ts`) - Main game scene
- **Platforms**: Ground (full width) + 3 floating platforms
- **Player sprite**: Blue rectangle with physics
- **Gravity**: Low gravity (300) for moon-like feel

### ✅ Phase 4: Player Controls
- **Horizontal movement**: Arrow keys (Left/Right) or WASD (A/D)
- **Jetpack**: Up Arrow or W key for vertical thrust
- **Visual feedback**: Player glows orange when jetpack is active
- **Sprite flipping**: Player faces direction of movement

### ✅ Phase 5: Shooting Mechanics
- **Aiming system**: Red line from player to mouse cursor
- **Shooting**: Left click or Spacebar to fire
- **Bullets**: Yellow bullets travel at 400 speed
- **Ammo system**: 6 bullets, reload with R key (1 second reload time)
- **Bullet lifetime**: Auto-destroy after 2 seconds

## How to Test

### Step 1: Start the Backend Server
```bash
cd backend
pnpm install
pnpm start
```

The server should start on `http://localhost:3001`

### Step 2: Configure Environment Variables
Ensure you have `.env.local` in the project root with:
```env
NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001
```

### Step 3: Start the Frontend
In a new terminal:
```bash
pnpm install
pnpm dev
```

The frontend should start on `http://localhost:3000`

### Step 4: Test Single Player Mechanics
1. Navigate to `http://localhost:3000/game`
2. Test the following:

**Movement Tests:**
- [ ] Press Left Arrow or A - player moves left
- [ ] Press Right Arrow or D - player moves right
- [ ] Player sprite flips to face direction
- [ ] Release keys - player stops moving

**Jetpack Tests:**
- [ ] Hold Up Arrow or W - player flies upward
- [ ] Player glows orange/red when jetpack active
- [ ] Release Up - player falls back down
- [ ] Can fly continuously while holding

**Shooting Tests:**
- [ ] Move mouse around - red aiming line follows cursor
- [ ] Click mouse or press Spacebar - yellow bullet fires
- [ ] Bullet travels in aimed direction
- [ ] Fire 6 shots - ammo counter shows "6/6" to "0/6"
- [ ] Try to fire 7th shot - nothing happens
- [ ] Press R key - see "Reloading..." message
- [ ] After 1 second - ammo back to "6/6"

**Physics Tests:**
- [ ] Player falls and lands on ground platform
- [ ] Player collides with 3 floating platforms
- [ ] Player doesn't fall through platforms
- [ ] Bullets disappear when hitting platforms

### Step 5: Test Multiplayer (Matchmaking)
Open **two browser windows** (or one normal + one incognito):

**Window 1:**
1. Navigate to `http://localhost:3000/game`
2. Click "Find Match" button
3. Should see "Searching for opponent..."

**Window 2:**
1. Navigate to `http://localhost:3000/game`
2. Click "Find Match" button

**Both Windows:**
- [ ] Both show "Match Found!" message
- [ ] Opponent username is displayed
- [ ] After 3 seconds, game canvas appears
- [ ] Each player sees themselves as blue
- [ ] Each player sees opponent as red

### Step 6: Test Multiplayer Gameplay
With both windows in a match:

**Movement Sync:**
- [ ] Move player in Window 1 - opponent moves in Window 2
- [ ] Move player in Window 2 - opponent moves in Window 1
- [ ] Movements are smooth (no major lag)
- [ ] Jetpack visual (orange glow) syncs

**Shooting Sync:**
- [ ] Fire bullet in Window 1 - Window 2 sees red bullet
- [ ] Fire bullet in Window 2 - Window 1 sees red bullet
- [ ] Bullets travel in correct direction
- [ ] Bullets appear instantly (real-time)

**Hit Detection:**
- [ ] Shoot opponent in Window 1
- [ ] Window 2's player flashes red briefly
- [ ] HP bar decreases (100 → 75 → 50 → 25 → 0)
- [ ] After 4 hits, player becomes transparent
- [ ] After 2 seconds, player respawns at new position
- [ ] Respawned player flashes for 1 second (invulnerable)
- [ ] HP resets to 100

**Kill Tracking:**
- [ ] Kill counter increments when opponent dies
- [ ] Console shows kill events
- [ ] Match ends after 3 kills OR 60 seconds
- [ ] Winner sees "VICTORY!" message
- [ ] Loser sees "DEFEAT" message

### Step 7: Test Backend Health Endpoint
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "activeMatches": 0,
  "playersInQueue": 0
}
```

## Known Limitations (Future Phases)

These features are planned but NOT yet implemented:
- ❌ Wallet connection (Phase 9)
- ❌ Smart contract deposits (Phase 9)
- ❌ Prize claiming (Phase 9)
- ❌ Leaderboard (Future)
- ❌ Farcaster social features (Future)
- ❌ Mobile touch controls (Future)
- ❌ Proper sprites and animations (Future)

## Troubleshooting

### "Cannot connect to game server"
- Make sure backend is running on port 3001
- Check backend terminal for errors
- Verify `NEXT_PUBLIC_GAME_SERVER_URL` in `.env.local`

### "Phaser not loading"
- Check browser console for errors
- Make sure you're on the `/game` route
- Try hard refresh (Cmd+Shift+R)

### "Opponent not showing"
- Both players must click "Find Match" within a few seconds
- Check backend terminal - should log "Match created: match_..."
- Open browser dev tools Network tab - look for WebSocket connection

### "Bullets not hitting"
- Hit detection uses physics overlap
- Bullets are small (8px) - aim carefully!
- Each hit does 25 damage (4 hits to kill)

## File Structure Created

```
base-farcaster/
├── app/
│   └── game/
│       └── page.tsx              # Game page with queue & canvas
├── components/
│   └── Game/
│       ├── MatchQueue.tsx        # Matchmaking UI
│       └── PhaserGame.tsx        # Phaser wrapper component
├── lib/
│   ├── socket.ts                 # Socket.io client
│   └── phaser/
│       └── scenes/
│           └── GameScene.ts      # Main game scene
└── types/
    └── game.ts                   # TypeScript game types
```

## Next Steps

To complete the full game (Phases 6-9):
1. **Phase 6**: Improve multiplayer sync (interpolation, lag compensation)
2. **Phase 7**: Complete health system (visual HP bars, death animations)
3. **Phase 8**: Match flow (timer UI, match start countdown, end screen)
4. **Phase 9**: Blockchain integration (wallet connect, deposits, prize claiming)

## Success Criteria ✅

The following core mechanics are now working:
- ✅ Real-time matchmaking via Socket.io
- ✅ 2D platformer physics with Phaser
- ✅ Player movement (WASD + Arrow keys)
- ✅ Jetpack flight mechanics
- ✅ 360-degree aiming system
- ✅ Bullet shooting with ammo/reload
- ✅ Multiplayer position synchronization
- ✅ Opponent bullet visualization
- ✅ Basic hit detection
- ✅ HP tracking and respawn

The game is **playable** but needs blockchain integration and polish for full production readiness.

