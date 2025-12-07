# 🎮 Shoot It - Quick Start Guide

**Status:** Game Design Complete ✅ | Backend Ready ✅ | Smart Contract Written ✅

## What You Have Now

1. ✅ **Updated Game Design Document** (`docs/game-design-document.md`)
   - Simplified matchmaking (Find Match button)
   - Desktop + Mobile controls
   - No protocol fees (winner takes all)
   - Clear architecture and flow

2. ✅ **Backend Game Server** (`backend/`)
   - Socket.io server for real-time multiplayer
   - Matchmaking queue (FIFO)
   - Match state management
   - Kill tracking and winner determination

3. ✅ **Smart Contract** (`contracts/ShootItEscrow.sol`)
   - Simple winner-takes-all escrow
   - Both players deposit → Winner claims all
   - Server-authoritative (prevents cheating)
   - Ready to deploy via Remix

## Next Steps

### 1. Deploy the Smart Contract (10 mins)

```bash
# Get Base Sepolia testnet ETH first
# Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

# Then follow: contracts/DEPLOYMENT.md
# Use Remix IDE for quick deployment
```

### 2. Install Backend Dependencies (2 mins)

```bash
cd backend
npm install
cp .env.example .env

# Edit .env and add:
# PORT=3001
# FRONTEND_URL=http://localhost:3000

npm run dev
# Server runs on http://localhost:3001
```

### 3. Add Phaser.js to Frontend (5 mins)

```bash
# In main project directory
pnpm add phaser
```

### 4. Create Game Component

Create `components/Game/PhaserGame.tsx` for the game canvas (Phaser integration)

### 5. Connect Frontend to Backend

Update `.env.local`:
```bash
NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_ESCROW_CONTRACT=0xYourContractAddress
NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org
```

## Development Workflow

```bash
# Terminal 1: Backend server
cd backend
npm run dev

# Terminal 2: Frontend
pnpm dev

# Open: http://localhost:3000
```

## Key Implementation Files to Create

### Priority 1: Core Game
- [ ] `components/Game/PhaserGame.tsx` - Phaser canvas wrapper
- [ ] `app/game/page.tsx` - Game page
- [ ] `lib/phaser/scenes/GameScene.ts` - Main game scene
- [ ] `lib/phaser/scenes/Player.ts` - Player class with jetpack physics

### Priority 2: Blockchain
- [ ] `lib/contracts/escrow.ts` - Contract ABI and hooks
- [ ] `components/Game/DepositModal.tsx` - Entry fee deposit UI
- [ ] `components/Game/ClaimPrize.tsx` - Winner claim button

### Priority 3: Matchmaking
- [ ] `components/Game/MatchQueue.tsx` - Find match UI
- [ ] `lib/socket.ts` - Socket.io client wrapper

### Priority 4: Social
- [ ] `components/Leaderboard.tsx` - Redis-based leaderboard
- [ ] `app/api/leaderboard/route.ts` - Leaderboard API

## Testing Locally

1. Open two browser windows (incognito for 2nd player)
2. Connect different wallets
3. Both click "Find Match"
4. Game starts when matched
5. Play for 60 seconds or until 3 kills
6. Winner can claim prize

## Deployment (When Ready)

### Frontend
- Deploy to Vercel (already configured)
- Set environment variables in Vercel dashboard

### Backend
- Deploy to Railway.app or Render.com
- Update `FRONTEND_URL` in production .env
- Update frontend with production game server URL

## Resources

- **Game Design:** `docs/game-design-document.md`
- **Backend API:** `backend/README.md`
- **Contract Guide:** `contracts/README.md`
- **Deployment:** `contracts/DEPLOYMENT.md`

## Questions?

Refer to the GDD for gameplay mechanics, tech stack details, and architecture diagrams.

Good luck! 🚀

