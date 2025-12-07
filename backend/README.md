# Shoot It - Game Server

Real-time multiplayer game server for Shoot It using Socket.io.

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Run development server
npm run dev

# Run production server
npm start
```

## API Endpoints

- `GET /health` - Server health check
- `GET /matches/:matchId` - Get match details

## Socket.IO Events

### Client → Server

- `find-match` - Join matchmaking queue
- `player-move` - Update player position
- `player-shoot` - Fire weapon
- `player-hit` - Report damage taken

### Server → Client

- `waiting-for-opponent` - In queue, waiting
- `match-found` - Match created, game starting
- `opponent-move` - Opponent position update
- `opponent-shoot` - Opponent fired weapon
- `kill-event` - Player killed
- `match-ended` - Match finished with results
- `opponent-disconnected` - Opponent left

## Match Flow

1. Player connects and emits `find-match` with wallet address and Farcaster data
2. Server pairs 2 players and emits `match-found` to both
3. Players send real-time game events during 60-second match
4. Server tracks kills and HP
5. Match ends when:
   - A player reaches 3 kills, OR
   - 60-second timer expires (winner = most kills, then most HP)
6. Server emits `match-ended` with winner address for blockchain claim

