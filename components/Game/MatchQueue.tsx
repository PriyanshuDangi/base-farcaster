'use client';

import { useState, useEffect } from 'react';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

interface MatchQueueProps {
  onMatchFound?: (matchData: MatchFoundData) => void;
  playerData?: {
    walletAddress: string;
    fid?: string;
    username?: string;
  };
}

interface MatchFoundData {
  matchId: string;
  opponent: {
    walletAddress: string;
    fid?: string;
    username: string;
  };
  playerNumber: number;
  config: {
    DURATION: number;
    ENTRY_FEE: string;
    MAX_KILLS: number;
    INITIAL_HP: number;
  };
}

export default function MatchQueue({ onMatchFound, playerData }: MatchQueueProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [matchData, setMatchData] = useState<MatchFoundData | null>(null);

  useEffect(() => {
    const socketInstance = getSocket();
    setSocket(socketInstance);
    
    console.log('MatchQueue: Socket instance:', socketInstance.id, 'Connected:', socketInstance.connected);

    // Listen for waiting status
    socketInstance.on('waiting-for-opponent', (data: { position: number }) => {
      console.log('Waiting for opponent, position:', data.position);
      setQueuePosition(data.position);
    });

    // Listen for match found
    socketInstance.on('match-found', (data: MatchFoundData) => {
      console.log('Match found!', data);
      console.log('Socket ID at match found:', socketInstance.id);
      setMatchData(data);
      setIsSearching(false);
      setQueuePosition(null);
      
      if (onMatchFound) {
        onMatchFound(data);
      }
    });

    return () => {
      // Don't remove listeners, they're needed for the game
      // socketInstance.off('waiting-for-opponent');
      // socketInstance.off('match-found');
    };
  }, [onMatchFound]);

  const handleFindMatch = () => {
    if (!socket) {
      console.error('Socket not connected');
      return;
    }

    const player = playerData || {
      walletAddress: '0x' + Math.random().toString(16).substring(2, 42),
      fid: 'test_fid',
      username: `Player${Math.floor(Math.random() * 1000)}`
    };

    console.log('Finding match with player data:', player);
    socket.emit('find-match', player);
    setIsSearching(true);
  };

  const handleCancelQueue = () => {
    setIsSearching(false);
    setQueuePosition(null);
    // Note: Server doesn't have cancel-queue event yet, just reset UI
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 p-4 sm:p-6 md:p-8 bg-gray-900 rounded-lg border-2 border-gray-700 w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-white text-center">Match Queue</h2>
      
      {!isSearching && !matchData && (
        <button
          onClick={handleFindMatch}
          className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg sm:text-xl rounded-lg transition-colors w-full max-w-xs"
        >
          Find Match
        </button>
      )}

      {isSearching && !matchData && (
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-white text-base sm:text-lg text-center">Searching for opponent...</p>
          {queuePosition !== null && (
            <p className="text-gray-400 text-sm sm:text-base">Queue position: {queuePosition}</p>
          )}
          <button
            onClick={handleCancelQueue}
            className="px-4 sm:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      )}

      {matchData && (
        <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full">
          <div className="text-green-500 text-4xl sm:text-6xl">✓</div>
          <p className="text-white text-xl sm:text-2xl font-bold text-center">Match Found!</p>
          <div className="bg-gray-800 p-3 sm:p-4 rounded-lg w-full">
            <p className="text-white text-sm sm:text-base text-center sm:text-left">
              Opponent: <span className="text-blue-400 font-semibold">{matchData.opponent.username}</span>
            </p>
            <p className="text-gray-400 text-xs sm:text-sm truncate text-center sm:text-left">
              Address: {matchData.opponent.walletAddress.substring(0, 10)}...
            </p>
            <p className="text-yellow-400 mt-2 text-sm sm:text-base text-center sm:text-left">
              Entry Fee: {matchData.config.ENTRY_FEE} ETH
            </p>
          </div>
          <p className="text-gray-400 text-xs sm:text-sm text-center">Match starting soon...</p>
        </div>
      )}
    </div>
  );
}

