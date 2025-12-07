const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Game state
const matchQueue = [];
const activeMatches = new Map();
const playerSockets = new Map();

// Match configuration
const MATCH_CONFIG = {
  DURATION: 60000, // 60 seconds
  ENTRY_FEE: '0.001', // ETH
  MAX_KILLS: 3,
  INITIAL_HP: 100
};

// API Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeMatches: activeMatches.size,
    playersInQueue: matchQueue.length 
  });
});

app.get('/matches/:matchId', (req, res) => {
  const match = activeMatches.get(req.params.matchId);
  if (!match) {
    return res.status(404).json({ error: 'Match not found' });
  }
  res.json(match);
});

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Player joins queue
  socket.on('find-match', (playerData) => {
    console.log(`Player ${socket.id} looking for match:`, playerData);
    
    // Store player info
    playerSockets.set(socket.id, {
      ...playerData,
      socketId: socket.id
    });

    // Add to queue
    matchQueue.push(socket.id);

    // Try to create a match if we have 2+ players
    if (matchQueue.length >= 2) {
      const player1Id = matchQueue.shift();
      const player2Id = matchQueue.shift();
      
      const player1 = playerSockets.get(player1Id);
      const player2 = playerSockets.get(player2Id);

      if (player1 && player2) {
        createMatch(player1, player2);
      }
    } else {
      socket.emit('waiting-for-opponent', { position: matchQueue.length });
    }
  });

  // Player movement update
  socket.on('player-move', (data) => {
    const match = findMatchByPlayer(socket.id);
    if (match) {
      // Broadcast movement to opponent
      const opponentId = getOpponentId(match, socket.id);
      if (opponentId) {
        io.to(opponentId).emit('opponent-move', data);
      }
    }
  });

  // Player shoots
  socket.on('player-shoot', (data) => {
    const match = findMatchByPlayer(socket.id);
    if (match) {
      const opponentId = getOpponentId(match, socket.id);
      if (opponentId) {
        io.to(opponentId).emit('opponent-shoot', data);
      }
    }
  });

  // Player hit
  socket.on('player-hit', (data) => {
    const match = findMatchByPlayer(socket.id);
    if (!match) return;

    const isPlayer1 = match.player1.socketId === socket.id;
    const playerKey = isPlayer1 ? 'player1' : 'player2';
    
    // Update HP
    match[playerKey].hp = Math.max(0, data.newHp);

    // Check if player died
    if (match[playerKey].hp <= 0) {
      match[playerKey].deaths += 1;
      const opponentKey = isPlayer1 ? 'player2' : 'player1';
      match[opponentKey].kills += 1;

      // Broadcast kill
      io.to(match.player1.socketId).emit('kill-event', {
        killer: match[opponentKey].walletAddress,
        victim: match[playerKey].walletAddress
      });
      io.to(match.player2.socketId).emit('kill-event', {
        killer: match[opponentKey].walletAddress,
        victim: match[playerKey].walletAddress
      });

      // Respawn player
      match[playerKey].hp = MATCH_CONFIG.INITIAL_HP;

      // Check win condition
      if (match[opponentKey].kills >= MATCH_CONFIG.MAX_KILLS) {
        endMatch(match, match[opponentKey]);
      }
    }
  });

  // Player disconnects
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    
    // Remove from queue
    const queueIndex = matchQueue.indexOf(socket.id);
    if (queueIndex > -1) {
      matchQueue.splice(queueIndex, 1);
    }

    // Handle match disconnect
    const match = findMatchByPlayer(socket.id);
    if (match) {
      const opponentId = getOpponentId(match, socket.id);
      if (opponentId) {
        io.to(opponentId).emit('opponent-disconnected');
      }
      activeMatches.delete(match.id);
    }

    playerSockets.delete(socket.id);
  });
});

// Helper Functions
function createMatch(player1, player2) {
  const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const match = {
    id: matchId,
    player1: {
      ...player1,
      hp: MATCH_CONFIG.INITIAL_HP,
      kills: 0,
      deaths: 0
    },
    player2: {
      ...player2,
      hp: MATCH_CONFIG.INITIAL_HP,
      kills: 0,
      deaths: 0
    },
    startTime: Date.now(),
    status: 'active',
    winner: null
  };

  activeMatches.set(matchId, match);

  // Notify both players
  io.to(player1.socketId).emit('match-found', {
    matchId,
    opponent: {
      walletAddress: player2.walletAddress,
      fid: player2.fid,
      username: player2.username
    },
    playerNumber: 1,
    config: MATCH_CONFIG
  });

  io.to(player2.socketId).emit('match-found', {
    matchId,
    opponent: {
      walletAddress: player1.walletAddress,
      fid: player1.fid,
      username: player1.username
    },
    playerNumber: 2,
    config: MATCH_CONFIG
  });

  // Set match timer
  setTimeout(() => {
    const currentMatch = activeMatches.get(matchId);
    if (currentMatch && currentMatch.status === 'active') {
      // Determine winner by kills, then by HP
      const winner = currentMatch.player1.kills > currentMatch.player2.kills
        ? currentMatch.player1
        : currentMatch.player1.kills < currentMatch.player2.kills
        ? currentMatch.player2
        : currentMatch.player1.hp > currentMatch.player2.hp
        ? currentMatch.player1
        : currentMatch.player2;
      
      endMatch(currentMatch, winner);
    }
  }, MATCH_CONFIG.DURATION);

  console.log(`Match created: ${matchId}`);
}

function findMatchByPlayer(socketId) {
  for (const match of activeMatches.values()) {
    if (match.player1.socketId === socketId || match.player2.socketId === socketId) {
      return match;
    }
  }
  return null;
}

function getOpponentId(match, socketId) {
  return match.player1.socketId === socketId 
    ? match.player2.socketId 
    : match.player1.socketId;
}

function endMatch(match, winner) {
  match.status = 'completed';
  match.winner = winner.walletAddress;
  match.endTime = Date.now();

  // Notify both players
  const matchResult = {
    matchId: match.id,
    winner: winner.walletAddress,
    player1: {
      walletAddress: match.player1.walletAddress,
      kills: match.player1.kills,
      deaths: match.player1.deaths
    },
    player2: {
      walletAddress: match.player2.walletAddress,
      kills: match.player2.kills,
      deaths: match.player2.deaths
    },
    duration: match.endTime - match.startTime
  };

  io.to(match.player1.socketId).emit('match-ended', matchResult);
  io.to(match.player2.socketId).emit('match-ended', matchResult);

  console.log(`Match ended: ${match.id}, Winner: ${winner.walletAddress}`);

  // Clean up after 30 seconds
  setTimeout(() => {
    activeMatches.delete(match.id);
  }, 30000);
}

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🎮 Shoot It Game Server running on port ${PORT}`);
});

