'use client';

import { useState } from 'react';
import { useDepositEntryFee } from '@/lib/hooks/useEscrowContract';

interface DepositModalProps {
  matchId: string;
  entryFee: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepositModal({ matchId, entryFee, onSuccess, onCancel }: DepositModalProps) {
  const { deposit, isPending, isConfirming, isSuccess, error } = useDepositEntryFee();
  const [hasDeposited, setHasDeposited] = useState(false);

  const handleDeposit = async () => {
    try {
      await deposit(matchId, entryFee);
      setHasDeposited(true);
    } catch (err) {
      console.error('Deposit failed:', err);
    }
  };

  // Auto-close on success
  if (isSuccess && hasDeposited) {
    setTimeout(onSuccess, 1000);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg border-2 border-gray-600 max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Match Entry Fee</h2>
        
        {!hasDeposited ? (
          <>
            <div className="bg-gray-900 p-4 rounded-lg mb-6">
              <p className="text-gray-400 mb-2">Entry Fee:</p>
              <p className="text-3xl font-bold text-white">{entryFee} ETH</p>
              <p className="text-sm text-gray-500 mt-2">Winner takes all!</p>
            </div>

            <p className="text-gray-300 mb-6">
              Deposit {entryFee} ETH to enter this match. The winner will receive the total pot ({(parseFloat(entryFee) * 2).toFixed(4)} ETH).
            </p>

            {error && (
              <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-4">
                <p className="text-sm">Error: {(error as any).message || 'Transaction failed'}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={handleDeposit}
                disabled={isPending || isConfirming}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
              >
                {isPending || isConfirming ? 'Confirming...' : 'Confirm Deposit'}
              </button>
              <button
                onClick={onCancel}
                disabled={isPending || isConfirming}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              * This is a test transaction on Base Sepolia testnet
            </p>
          </>
        ) : (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <p className="text-xl text-white font-bold mb-2">Deposit Confirmed!</p>
            <p className="text-gray-400">Starting match...</p>
          </div>
        )}
      </div>
    </div>
  );
}

