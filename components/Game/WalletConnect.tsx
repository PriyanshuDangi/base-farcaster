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
    <div className="bg-gray-800 p-6 rounded-lg border-2 border-gray-700 max-w-md">
      <h3 className="text-white text-xl font-bold mb-4">Connect Wallet</h3>
      <p className="text-gray-400 mb-4 text-sm">
        Connect your wallet to enable deposits and prize claiming (optional for testing)
      </p>
      
      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isPending ? 'Connecting...' : `Connect with ${connector.name}`}
          </button>
        ))}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

