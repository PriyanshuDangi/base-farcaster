'use client';

import { useConnect, useAccount } from 'wagmi';

interface WalletConnectProps {
  onClose?: () => void;
}

export default function WalletConnect({ onClose }: WalletConnectProps) {
  const { connectors, connect, isPending } = useConnect();
  const { isConnected } = useAccount();

  if (isConnected && onClose) {
    onClose();
    return null;
  }

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-lg border-2 border-gray-700 max-w-md w-full mx-4">
      <h3 className="text-white text-lg sm:text-xl font-bold mb-3 sm:mb-4">Connect Wallet</h3>
      <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">
        Connect your wallet to enable deposits and prize claiming (optional for testing)
      </p>
      
      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base"
          >
            {isPending ? 'Connecting...' : `Connect with ${connector.name}`}
          </button>
        ))}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-3 sm:mt-4 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm sm:text-base"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

