// Game-related TypeScript type definitions

export interface PlayerData {
  walletAddress: string;
  fid?: string;
  username: string;
  socketId?: string;
}

export interface MatchConfig {
  DURATION: number;
  ENTRY_FEE: string;
  MAX_KILLS: number;
  INITIAL_HP: number;
}

export interface MatchFoundData {
  matchId: string;
  opponent: PlayerData;
  playerNumber: number;
  config: MatchConfig;
}

export interface MatchEndData {
  matchId: string;
  winner: string;
  player1: {
    walletAddress: string;
    kills: number;
    deaths: number;
  };
  player2: {
    walletAddress: string;
    kills: number;
    deaths: number;
  };
  duration: number;
}

export interface PlayerMoveData {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  flipX: boolean;
  timestamp?: number;
}

export interface PlayerShootData {
  x: number;
  y: number;
  angle: number;
  velocityX: number;
  velocityY: number;
}

export interface KillEventData {
  killer: string;
  victim: string;
}

