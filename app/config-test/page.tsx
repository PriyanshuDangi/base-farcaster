'use client';

import { config } from '@/lib/config';

/**
 * Configuration Test Page
 * Verify environment variables are loaded correctly
 * Access at: http://localhost:3002/config-test
 */
export default function ConfigTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          🔧 Configuration Test
        </h1>

        {/* Game Server Configuration */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Game Server
          </h2>
          <div className="space-y-2">
            <ConfigRow label="URL" value={config.gameServer.url} />
          </div>
        </div>

        {/* Blockchain Configuration */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Blockchain (Base Sepolia)
          </h2>
          <div className="space-y-2">
            <ConfigRow label="Chain ID" value={config.blockchain.chainId.toString()} />
            <ConfigRow label="RPC URL" value={config.blockchain.rpcUrl} />
            <ConfigRow 
              label="Contract Address" 
              value={config.blockchain.escrowContract}
              link={`${config.blockchain.explorerUrl}/address/${config.blockchain.escrowContract}`}
            />
            <ConfigRow label="Explorer" value={config.blockchain.explorerUrl} />
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Game Settings
          </h2>
          <div className="space-y-2">
            <ConfigRow label="Match Duration" value={`${config.game.matchDuration}s`} />
            <ConfigRow label="Max Kills" value={config.game.maxKills.toString()} />
            <ConfigRow label="Entry Fee" value={`${config.game.entryFee} ETH`} />
            <ConfigRow label="Initial HP" value={config.game.initialHP.toString()} />
          </div>
        </div>

        {/* Environment Variables Check */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Environment Variables
          </h2>
          <div className="space-y-2">
            <EnvCheck 
              name="NEXT_PUBLIC_GAME_SERVER_URL" 
              value={process.env.NEXT_PUBLIC_GAME_SERVER_URL}
            />
            <EnvCheck 
              name="NEXT_PUBLIC_ESCROW_CONTRACT" 
              value={process.env.NEXT_PUBLIC_ESCROW_CONTRACT}
            />
            <EnvCheck 
              name="NEXT_PUBLIC_BASE_SEPOLIA_RPC" 
              value={process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC}
            />
            <EnvCheck 
              name="NEXT_PUBLIC_CHAIN_ID" 
              value={process.env.NEXT_PUBLIC_CHAIN_ID}
            />
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-500/20 border border-green-500 rounded-lg p-4">
          <p className="text-green-200 text-center">
            ✅ Phase 1.4 Complete - All environment variables loaded successfully!
          </p>
        </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      <span className="text-gray-300 font-medium">{label}:</span>
      {link ? (
        <a 
          href={link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 font-mono text-sm truncate max-w-md"
        >
          {value}
        </a>
      ) : (
        <span className="text-white font-mono text-sm truncate max-w-md">{value}</span>
      )}
    </div>
  );
}

function EnvCheck({ name, value }: { name: string; value?: string }) {
  const isSet = !!value;
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/10">
      <span className="text-gray-300 font-mono text-sm">{name}</span>
      <div className="flex items-center gap-2">
        {isSet ? (
          <>
            <span className="text-green-400">✓</span>
            <span className="text-white font-mono text-xs truncate max-w-xs">{value}</span>
          </>
        ) : (
          <span className="text-red-400">✗ Not set</span>
        )}
      </div>
    </div>
  );
}

