'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import MatchQueue from '@/components/Game/MatchQueue';
import PhaserGame from '@/components/Game/PhaserGame';
import WalletConnect from '@/components/Game/WalletConnect';
import DepositModal from '@/components/Game/DepositModal';
import ClaimPrize from '@/components/Game/ClaimPrize';

export default function GamePage() {
  const [matchData, setMatchData] = useState<any>(null);
  const [isInGame, setIsInGame] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const { address, isConnected } = useAccount();

  const handleMatchFound = (data: any) => {
    console.log('Match found, starting game:', data);
    // Add player address to match data
    const enrichedData = {
      ...data,
      playerAddress: address || data.walletAddress
    };
    setMatchData(enrichedData);
    
    // For now, skip deposit modal and just start the game
    // Deposits can be enabled later when backend creates matches on-chain
    setIsInGame(true);
    
    // Show deposit modal if wallet is connected (DISABLED FOR NOW)
    // if (isConnected && address) {
    //   setShowDeposit(true);
    // } else {
    //   setIsInGame(true);
    // }
  };

  const handleDepositSuccess = () => {
    setShowDeposit(false);
    setIsInGame(true);
  };

  const handleDepositCancel = () => {
    setShowDeposit(false);
    setMatchData(null);
  };

  const handleReturnToLobby = () => {
    setMatchData(null);
    setIsInGame(false);
    setMatchResult(null);
  };

  // Check for match result from Phaser game
  useEffect(() => {
    if (typeof window === 'undefined' || !isInGame) return;
    
    const checkResult = setInterval(() => {
      const phaserGame = (window as any).phaserGame;
      if (phaserGame?.matchResult) {
        setMatchResult(phaserGame.matchResult);
        clearInterval(checkResult);
      }
    }, 1000);

    return () => clearInterval(checkResult);
  }, [isInGame]);

  // Generate player data from wallet or test data
  const playerData = isConnected && address ? {
    walletAddress: address,
    fid: 'fc_user',
    username: address.substring(0, 8)
  } : {
    walletAddress: '0x' + Math.random().toString(16).substring(2, 42),
    fid: 'test_fid',
    username: `Player${Math.floor(Math.random() * 1000)}`
  };

  const canClaimPrize = matchResult && matchResult.isWinner && isConnected && address;
  const prizeAmount = matchData?.config?.ENTRY_FEE ? 
    (parseFloat(matchData.config.ENTRY_FEE) * 2).toFixed(4) : '0.002';

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold text-white mb-4">Shoot It</h1>
      <p className="text-gray-400 mb-8">1v1 Aerial Combat on Base</p>
      
      {!isInGame ? (
        <div className="flex flex-col items-center space-y-4">
          {/* Wallet status */}
          <div className="bg-gray-800 px-6 py-3 rounded-lg">
            {isConnected && address ? (
              <p className="text-green-400">
                Connected: {address.substring(0, 6)}...{address.substring(38)}
              </p>
            ) : (
              <button
                onClick={() => setShowWallet(!showWallet)}
                className="text-blue-400 hover:text-blue-300"
              >
                Connect Wallet (Optional for testing)
              </button>
            )}
          </div>

          {showWallet && !isConnected && (
            <WalletConnect onClose={() => setShowWallet(false)} />
          )}
          
          <MatchQueue 
            onMatchFound={handleMatchFound}
            playerData={playerData}
          />

          <div className="bg-blue-900 border border-blue-600 px-4 py-3 rounded-lg max-w-md text-center">
            <p className="text-blue-200 text-sm">
              💡 <strong>Testing Mode:</strong> Deposits are currently disabled. 
              The game is fully playable without blockchain transactions.
              {!isConnected && " You can connect your wallet for future features."}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <div className="border-4 border-gray-700 rounded-lg overflow-hidden">
            <PhaserGame matchData={matchData} />
          </div>

          {/* Show claim prize button if won and wallet connected */}
          {canClaimPrize && (
            <ClaimPrize
              matchId={matchData.matchId}
              prizeAmount={prizeAmount}
              onSuccess={handleReturnToLobby}
            />
          )}
          
          <button
            onClick={handleReturnToLobby}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      )}

      {/* Deposit modal */}
      {showDeposit && matchData && (
        <DepositModal
          matchId={matchData.matchId}
          entryFee={matchData.config.ENTRY_FEE}
          onSuccess={handleDepositSuccess}
          onCancel={handleDepositCancel}
        />
      )}
    </div>
  );
}

