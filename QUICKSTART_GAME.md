# 🎮 Shoot It - Quick Start Guide

## What's Been Built

A fully playable **1v1 aerial combat game** with real-time multiplayer! 

**Phases 2-5 Complete:**
- ✅ Socket.io matchmaking
- ✅ Phaser.js 2D physics
- ✅ Player controls (movement + jetpack)
- ✅ Shooting mechanics with ammo/reload
- ✅ Real-time multiplayer synchronization
- ✅ Hit detection and health system

## 🚀 Quick Start (30 seconds)

### Option 1: Automated Startup
```bash
# Make script executable (first time only)
chmod +x START_GAME.sh

# Start everything at once
./START_GAME.sh
```

### Option 2: Manual Startup

**Terminal 1 - Game Server:**
```bash
cd backend
pnpm install
pnpm start
```

**Terminal 2 - Frontend:**
```bash
pnpm install
pnpm dev
```

## 🎯 How to Play

### 1. Open the Game
Navigate to: **`http://localhost:3000/game`**

### 2. Test Solo
- **Move**: Arrow Keys or WASD
- **Jetpack**: Hold Up Arrow or W (player glows orange)
- **Aim**: Move your mouse around
- **Shoot**: Click mouse or press Spacebar
- **Reload**: Press R (after 6 shots)

### 3. Test Multiplayer
**Window 1:**
1. Go to `http://localhost:3000/game`
2. Click **"Find Match"**
3. Wait for opponent...

**Window 2 (or Incognito):**
1. Go to `http://localhost:3000/game`
2. Click **"Find Match"**
3. Both matched! 🎉

**Now shoot each other!**
- You appear as **BLUE**
- Opponent appears as **RED**
- Your bullets are **YELLOW**
- Opponent's bullets are **RED**
- 4 hits to kill (25 damage each)

## 🎮 Controls Reference

| Action | Desktop | 
|--------|---------|
| Move Left | ← or A |
| Move Right | → or D |
| Jetpack | ↑ or W |
| Aim | Mouse cursor |
| Shoot | Left Click or Spacebar |
| Reload | R |

## 📋 Game Rules

- **Health**: 100 HP (starts full)
- **Damage**: 25 HP per bullet hit
- **Ammo**: 6 bullets before reload
- **Reload Time**: 1 second
- **Respawn**: 2 seconds after death
- **Invulnerability**: 1 second after respawn (flashing)

## 🔧 Troubleshooting

### Backend won't start?
```bash
cd backend
pnpm install
# Make sure nothing else is running on port 3001
```

### Frontend won't start?
```bash
pnpm install
# Make sure nothing else is running on port 3000
```

### Can't connect to game server?
1. Check backend terminal - should show "running on port 3001"
2. Check browser console for errors
3. Verify `.env.local` has: `NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001`

### Opponent not showing?
- Both players must click "Find Match" within ~5 seconds of each other
- Check backend terminal for "Match created" log
- Refresh both browsers and try again

## 📁 Key Files

```
app/game/page.tsx           # Main game page
components/Game/
  ├── MatchQueue.tsx        # Matchmaking UI
  └── PhaserGame.tsx        # Game canvas wrapper
lib/
  ├── socket.ts             # Socket.io client
  └── phaser/scenes/
      └── GameScene.ts      # All game logic here!
backend/server.js           # Game server
```

## 🎨 What You'll See

**Lobby:**
- Blue "Find Match" button
- Searching spinner when in queue
- Green checkmark when matched
- Opponent name and address

**In Game:**
- Sky blue background
- Gray platforms (1 ground + 3 floating)
- Blue rectangle = You
- Red rectangle = Opponent
- Green HP bar (top left)
- Ammo counter (top right)
- Red aiming line from player to mouse

**Combat:**
- Yellow bullets from you
- Red bullets from opponent
- Red flash when hit
- HP bar shrinks
- Death = transparent for 2 sec → respawn
- Flash effect = invulnerable

## 📊 Match Flow

1. Click "Find Match" → Wait for opponent
2. Match found → 3 second countdown
3. Game starts → Shoot and fly!
4. First to 3 kills OR 60 seconds wins
5. "Victory" or "Defeat" screen
6. Return to lobby

**Note:** Full match flow (timer, end screen) will be in Phase 8. Current version focuses on core combat mechanics.

## 🔍 What's Next?

The game is **playable** but needs:
- ⏱️ Match timer UI (Phase 8)
- 🏆 Proper end screen (Phase 8)
- 💰 Wallet connection (Phase 9)
- 💸 ETH deposits & prizes (Phase 9)
- 📱 Mobile controls (Phase 10+)
- 🎨 Better graphics (Phase 10+)

## 📚 More Info

- **Full Testing Guide**: See `GAME_TESTING.md`
- **Implementation Details**: See `docs/IMPLEMENTATION_SUMMARY.md`
- **Game Design**: See `docs/game-design-document.md`
- **Development Plan**: See `docs/game-plan.md`

## 🎉 Success!

If you can:
- ✅ Move around the map
- ✅ Shoot bullets
- ✅ See your opponent move
- ✅ Hit your opponent (HP decreases)
- ✅ Respawn after death

**Then everything is working!** 🎊

Now you're ready to add blockchain integration (Phase 9) or polish the game (Phase 10+).

---

**Happy Gaming!** 🚀

