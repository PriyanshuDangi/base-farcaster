# Shoot It - Architecture & Progress

## Implementation Progress

### Phase 1: Environment Setup ✅

#### Step 1.1: Install Backend Dependencies ✅
- **Status:** Complete
- **Details:**
  - Installed dependencies using `pnpm install` in `backend/` directory
  - Created `.env` file with:
    - `PORT=3001`
    - `FRONTEND_URL=http://localhost:3000`
  - Started development server with `pnpm run dev`
  - Server running on port 3001

**Test Results:**
- ✅ Backend server accessible at `http://localhost:3001`
- ✅ Health endpoint returns: `{ status: 'ok', activeMatches: 0, playersInQueue: 0 }`
- ✅ Console shows: "🎮 Shoot It Game Server running on port 3001"

#### Step 1.2: Install Frontend Dependencies ✅
- **Status:** Complete
- **Details:**
  - Installed `phaser@^3.90.0` - Game engine for 2D gameplay
  - Installed `socket.io-client@^4.8.1` - Real-time communication with backend
  - Added to `package.json` dependencies
  - Started frontend dev server with `pnpm run dev`
  - Frontend running on port 3002 (3000 and 3001 were in use)

**Test Results:**
- ✅ `phaser` listed in `package.json` dependencies
- ✅ `socket.io-client` listed in `package.json` dependencies
- ✅ Frontend server starts without errors
- ✅ Next.js 14.2.6 running at `http://localhost:3002`

---

## Current System Architecture

### Running Services
1. **Backend Game Server** (Port 3001)
   - Node.js + Express + Socket.io
   - Handles matchmaking, game state, real-time sync
   - Located in `/backend/` directory

2. **Frontend App** (Port 3002)
   - Next.js 14 + React
   - Phaser.js for game rendering
   - Socket.io client for server communication
   - Located in root directory

### Tech Stack Summary
| Component | Technology | Version | Status |
|-----------|-----------|---------|--------|
| Game Engine | Phaser.js | 3.90.0 | ✅ Installed |
| Real-time Comms | Socket.io | 4.8.1 | ✅ Installed |
| Backend Server | Node.js + Express | 4.22.1 | ✅ Running |
| Frontend Framework | Next.js | 14.2.6 | ✅ Running |
| Wallet Integration | wagmi + viem | 2.15.5 / 2.23.0 | ✅ Installed |
| Farcaster SDK | @farcaster/miniapp-sdk | 0.2.0 | ✅ Installed |
| Database | Upstash Redis | 1.35.1 | ✅ Installed |

---

## Next Steps

### Completed: Phase 1.3 & 1.4 ✅
- [x] Deploy Smart Contract to Base Sepolia
- [x] Configure environment variables for contract integration

### Upcoming: Phase 2
- [ ] Create Socket.io client utility (`lib/socket.ts`)
- [ ] Build MatchQueue component
- [ ] Test matchmaking flow

---

## Development Notes

### Backend Structure
The backend (`backend/server.js`) includes:
- Health check endpoint: `GET /health`
- Match query endpoint: `GET /matches/:matchId`
- Socket.io event handlers:
  - `find-match` - Join matchmaking queue
  - `player-move` - Sync player position
  - `player-shoot` - Sync shooting events
  - `player-hit` - Update health/damage
  - `disconnect` - Handle disconnections

### Frontend Dependencies
Key packages added:
- `phaser` - 2D game engine with physics, sprites, scenes
- `socket.io-client` - WebSocket communication for multiplayer

### Environment Configuration
Backend `.env` file created with:
- Port 3001 for game server
- CORS configured for localhost:3000

**Note:** Frontend `.env.local` will be created in Step 1.4 after contract deployment.

---

#### Step 1.3: Deploy Smart Contract ✅
- **Status:** Complete
- **Details:**
  - Contract deployed to Base Sepolia testnet
  - Contract Address: `0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C`
  - Verified on BlockScout: https://base-sepolia.blockscout.com/address/0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C
  - Network: Base Sepolia (Chain ID: 84532)

**Test Results:**
- ✅ Contract visible on Base Sepolia BlockScout
- ✅ Contract creation transaction successful
- ✅ Contract verified and readable on explorer

#### Step 1.4: Configure Environment Variables ✅
- **Status:** Complete
- **Details:**
  - Created `.env.local` in project root with:
    - `NEXT_PUBLIC_GAME_SERVER_URL=http://localhost:3001`
    - `NEXT_PUBLIC_ESCROW_CONTRACT=0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C`
    - `NEXT_PUBLIC_BASE_SEPOLIA_RPC=https://sepolia.base.org`
    - `NEXT_PUBLIC_CHAIN_ID=84532`
  - Updated `backend/.env` with:
    - `ESCROW_CONTRACT_ADDRESS=0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C`
    - `BASE_SEPOLIA_RPC=https://sepolia.base.org`
    - `CHAIN_ID=84532`
  - Created `lib/config.ts` for centralized, type-safe configuration
  - Created `lib/contracts/escrow-abi.ts` with complete contract ABI

**Test Results:**
- ✅ Environment files created successfully
- ✅ Configuration is accessible via `lib/config.ts`
- ✅ Contract ABI ready for wagmi hooks
- ✅ Type-safe access to all configuration values
- ✅ Validation function warns of missing env vars in development

---

## Smart Contract Details

### Deployed Contract
- **Address:** `0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C`
- **Network:** Base Sepolia Testnet (Chain ID: 84532)
- **Explorer:** https://base-sepolia.blockscout.com/address/0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C
- **RPC URL:** https://sepolia.base.org
- **Contract Type:** ShootItEscrow (Winner-takes-all escrow)

### Contract Features
- ✅ Entry fee deposits (0.001 ETH per player)
- ✅ Match creation and tracking
- ✅ Server-authoritative winner declaration
- ✅ Prize claiming for winners
- ✅ Prevents double-claiming and unauthorized access
- ✅ Event emissions for frontend tracking

### Contract Functions
**Read Functions:**
- `getMatch(matchId)` - Get full match details
- `isMatchFunded(matchId)` - Check if both players deposited
- `getMatchStatus(matchId)` - Get match status (funded, winner, claimed)
- `matches(matchId)` - Direct mapping access
- `matchCount()` - Total matches created
- `gameServer()` - Current game server address

**Write Functions (Players):**
- `deposit(matchId)` - Deposit entry fee (payable)
- `claimPrize(matchId)` - Claim prize if winner

**Write Functions (Game Server Only):**
- `createMatch(matchId, player1, player2, entryFee)` - Create new match
- `declareWinner(matchId, winner)` - Declare match winner
- `updateGameServer(newServer)` - Update game server address

---

## Configuration Files

### Frontend Configuration (`lib/config.ts`)
Type-safe configuration with validation:
- Game server URL
- Blockchain settings (chain ID, RPC, contract address)
- Game constants (match duration, kills, entry fee, HP)
- Development logging for debugging

### Contract ABI (`lib/contracts/escrow-abi.ts`)
Complete ABI export including:
- All contract events
- All read/write functions
- Custom error types
- Typed for use with wagmi/viem

---

**Last Updated:** Phase 1 Complete (All Steps 1.1-1.4) ✅

