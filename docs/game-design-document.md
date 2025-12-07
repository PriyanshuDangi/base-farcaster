# Game Design Document: Shoot It (Hackathon MVP)

## 1. Executive Summary
* **Title:** Shoot It
* **Concept:** A high-stakes, 1v1 aerial combat game inspired by "Mini Militia."
* **Platform:** Mobile Web (deployed as a Farcaster Mini-App / Frame v2).
* **Chain:** Base Sepolia (Testnet).
* **Unique Selling Point:** "Fly, Shoot, Earn." Players wager testnet funds in real-time aerial duels.

---

## 2. Gameplay Mechanics (The "Fun" Factor)

### 2.1 The Core Loop
1.  **Match:** User enters the Frame → Stakes Entry Fee (e.g., 0.001 ETH) → Match starts.
2.  **Fight:** 60-second timer. 1v1 duel in a confined "Cage" map.
3.  **Movement:** Jetpack flight is the primary mechanic. Players must manage verticality to dodge.
4.  **Win:** First to 3 kills *OR* player with most HP when time runs out.
5.  **Reward:** Winner signs a transaction to claim the full pot (winner takes all).

### 2.2 Controls (Mobile Touch Optimized)

#### Mobile (Primary Platform)
* **Left Thumb (Movement):** Virtual Joystick. Moving **UP** engages the Jetpack thrusters.
* **Right Thumb (Combat):**
    * **Drag:** Aims the weapon (360 degrees).
    * **Release:** Fires the weapon.
    * *(Simplification for Hackathon: Auto-fire when aiming is easier to code than a separate fire button).*

#### Desktop (Development/Testing)
* **Movement:** WASD or Arrow Keys. **W/Up** engages Jetpack thrusters.
* **Aim:** Mouse cursor position (360 degrees).
* **Fire:** Left Click or Spacebar.

### 2.3 Weapons & Physics
* **Weapon:** "The Peashooter" (Standard Rifle). Infinite ammo, needs reload after 6 shots.
* **Physics:** Low gravity. Players should feel "floaty" (like on the moon).
* **Health:** 100 HP. 4 hits to kill.
* **Jetpack Fuel:** Unlimited (simplified for MVP).

---

## 3. The "Wager" Architecture (Base Blockchain)

To keep this simple for a hackathon, we use a **"Winner-Takes-All" Escrow**.

### 3.1 The Flow
1.  **Pre-Game:** Both players send entry fee (e.g., 0.001 ETH) to the **Escrow Contract** when match starts.
2.  **Game Plays:** The game server tracks the match state and determines the winner.
3.  **Game End:** The Game Server (acting as a Referee) calls `declareWinner(matchId, winnerAddress)`.
4.  **Claim:** The Winner can call `claimPrize(matchId)` to withdraw the full pot to their wallet.

### 3.2 Matchmaking
* Simple "Find Match" button that pairs the first 2 players in queue (FIFO).
* When 2 players are matched, both deposit entry fee and game starts immediately.

*(Note: Server-authoritative winner declaration prevents client-side hacking).*

---

## 4. Farcaster & Social Features

### 4.1 Integration
* **Login:** Auto-login using Farcaster Auth (gets FID, PFP, and Username).
* **Share:** "I just won 0.05 ETH on Shoot It! Challenge me." (Generates a cast with a deep link to the specific match lobby).

### 4.2 Gamification
* **Leaderboard:** A simple list sorted by "Total ETH Won."
* **Badges (SBTs - Soulbound Tokens):**
    * *Pilot:* Played 1 match.
    * *Ace:* Won 3 matches in a row.
    * *Whale Hunter:* Defeated a player with a high rank.

---

## 5. Technical Stack

| Component | Technology | Status | Why? |
| :--- | :--- | :--- | :--- |
| **Game Engine** | **Phaser.js** (v3) | 🔴 To Add | Lightweight, standard for 2D web games. |
| **Game Server** | **Node.js + Socket.io + Express** | 🔴 To Add | Separate backend for real-time game logic. |
| **Frontend** | **Next.js 14** | ✅ Installed | React framework with Frame v2 support. |
| **Farcaster SDK** | **@farcaster/miniapp-sdk** | ✅ Installed | Mini-App integration & auth. |
| **Wallet/Web3** | **wagmi + viem + @reown/appkit** | ✅ Installed | Wallet connection & blockchain interactions. |
| **Smart Contract** | **Solidity (Remix)** | 📝 Written | Simple escrow contract for winner-takes-all. |
| **Database** | **Upstash Redis** | ✅ Installed | Cloud Redis for match state & leaderboard. |
| **Styling** | **Tailwind CSS** | ✅ Installed | Utility-first CSS for rapid UI development. |

---

## 6. Architecture Overview

### 6.1 System Flow
```
Player 1 (Mobile Browser)     Player 2 (Mobile Browser)
         |                              |
         |------ Socket.io -------------|
         |                              |
         +----------- v ----------------+
                     |
            Game Server (Node.js)
         (Match Logic + State Sync)
                     |
         +-----------+-----------+
         |                       |
    Redis Cache         Base Sepolia Blockchain
  (Leaderboard)          (ShootItEscrow Contract)
```

### 6.2 Match Flow
1. **Queue:** Player clicks "Find Match" → Frontend sends wallet address to Game Server
2. **Pairing:** Game Server pairs 2 players (FIFO) → Creates match in Redis
3. **Deposit:** Game Server calls `createMatch()` on contract → Both players deposit entry fee
4. **Game:** Real-time gameplay via Socket.io (60 seconds)
5. **End:** Game Server declares winner → Calls `declareWinner()` on contract
6. **Claim:** Winner's client prompts `claimPrize()` → Funds sent to winner's wallet

---

## 7. Hackathon Asset List (MVP)

Do not over-scope art. Use placeholders or simple pixel art.

1.  **Map:** Single screen "Industrial Box" with 3 floating platforms.
2.  **Sprite:** One Soldier (Blue team / Red team tint). Simple standing sprite for testing.
3.  **UI:**
    * Health Bar.
    * "Connect Wallet" Overlay.
    * "Find Match" button.
    * Kill counter & timer.

---

## 8. Development Roadmap (24-Hour Plan)

### Phase 1: Infrastructure (Hours 1-6)
- [x] Setup Game Design Document
- [x] Create backend Node.js server with Socket.io
- [x] Write smart contract (ShootItEscrow.sol)
- [ ] Deploy contract to Base Sepolia via Remix
- [ ] Setup Phaser.js in Next.js frontend
- [ ] Basic player sprite and map

### Phase 2: Core Gameplay (Hours 7-12)
- [ ] Implement jetpack physics (low gravity, vertical movement)
- [ ] Add shooting mechanics (aim and fire)
- [ ] Socket.io real-time state sync between players
- [ ] Hit detection and HP tracking
- [ ] Kill counter and respawn logic

### Phase 3: Blockchain Integration (Hours 13-18)
- [ ] Connect wagmi/viem to contract
- [ ] Implement deposit flow (both players)
- [ ] Add "Claim Prize" button on win
- [ ] Integrate Farcaster login (@farcaster/miniapp-sdk)
- [ ] Store leaderboard in Upstash Redis

### Phase 4: Polish & Deploy (Hours 19-24)
- [ ] Mobile touch controls (virtual joystick)
- [ ] UI/UX polish (health bars, timers, kill feed)
- [ ] Farcaster Frame v2 metadata
- [ ] "Share to Cast" functionality
- [ ] Mobile responsiveness testing
- [ ] Deploy to Vercel + Railway/Render

---

## 9. File Structure

```
base-farcaster/
├── app/                          # Next.js pages
│   ├── page.tsx                  # Home/lobby
│   ├── game/
│   │   └── page.tsx              # Game canvas (Phaser)
│   └── api/
│       └── leaderboard/
│           └── route.ts          # Redis leaderboard API
├── components/
│   ├── Game/
│   │   ├── PhaserGame.tsx       # Phaser wrapper component
│   │   ├── MatchQueue.tsx       # Find match button
│   │   └── ClaimPrize.tsx       # Winner claim UI
│   └── farcaster-provider.tsx   # Farcaster auth
├── backend/                      # Game server (separate)
│   ├── server.js                 # Socket.io server
│   ├── package.json
│   └── README.md
├── contracts/
│   ├── ShootItEscrow.sol        # Escrow smart contract
│   ├── README.md
│   └── DEPLOYMENT.md
└── docs/
    └── game-design-document.md   # This file
```