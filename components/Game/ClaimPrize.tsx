'use client';

import { useState } from 'react';
import { useClaimPrize } from '@/lib/hooks/useEscrowContract';

interface ClaimPrizeProps {
  matchId: string;
  prizeAmount: string;
  onSuccess?: () => void;
}

export default function ClaimPrize({ matchId, prizeAmount, onSuccess }: ClaimPrizeProps) {
  const { claimPrize, isPending, isConfirming, isSuccess, error } = useClaimPrize();
  const [hasClaimed, setHasClaimed] = useState(false);

  const handleClaim = async () => {
    try {
      await claimPrize(matchId);
      setHasClaimed(true);
      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      console.error('Claim failed:', err);
    }
  };

  if (isSuccess && hasClaimed) {
    return (
      <div className="bg-green-900 border-2 border-green-500 p-6 rounded-lg text-center">
        <div className="text-green-400 text-6xl mb-4">🏆</div>
        <p className="text-2xl font-bold text-white mb-2">Prize Claimed!</p>
        <p className="text-green-300">{prizeAmount} ETH sent to your wallet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border-2 border-yellow-500 p-6 rounded-lg">
      <h3 className="text-2xl font-bold text-yellow-400 mb-4">🏆 Claim Your Prize!</h3>
      
      <div className="bg-gray-900 p-4 rounded-lg mb-4">
        <p className="text-gray-400 mb-1">Prize Pool:</p>
        <p className="text-4xl font-bold text-yellow-400">{prizeAmount} ETH</p>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
          <p className="text-sm">Error: {(error as any).message || 'Transaction failed'}</p>
          <p className="text-xs mt-1">You can try again.</p>
        </div>
      )}

      <button
        onClick={handleClaim}
        disabled={isPending || isConfirming || hasClaimed}
        className="w-full px-6 py-4 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold text-lg rounded-lg transition-colors"
      >
        {isPending || isConfirming ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Claiming...
          </span>
        ) : 'Claim Prize'}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Claiming will transfer {prizeAmount} ETH to your connected wallet
      </p>
    </div>
  );
}

