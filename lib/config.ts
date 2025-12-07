/**
 * Centralized configuration for Shoot It game
 * Provides type-safe access to environment variables
 */

// Frontend environment variables (must be prefixed with NEXT_PUBLIC_)
export const config = {
  // Game server configuration
  gameServer: {
    url: process.env.NEXT_PUBLIC_GAME_SERVER_URL || 'http://localhost:3001',
  },

  // Blockchain configuration (Base Sepolia Testnet)
  blockchain: {
    chainId: 84532, // Base Sepolia
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
    escrowContract: process.env.NEXT_PUBLIC_ESCROW_CONTRACT || '0xCCe5Ef96204Fa5cf8bB23830bAF16D84172d8e2C',
    explorerUrl: 'https://base-sepolia.blockscout.com',
  },

  // Game settings
  game: {
    matchDuration: 60, // seconds
    maxKills: 3,
    entryFee: '0.001', // ETH
    initialHP: 100,
  },
} as const;

/**
 * Validate that all required environment variables are set
 * Call this on app initialization
 */
export function validateConfig(): void {
  const required = [
    'NEXT_PUBLIC_GAME_SERVER_URL',
    'NEXT_PUBLIC_ESCROW_CONTRACT',
    'NEXT_PUBLIC_BASE_SEPOLIA_RPC',
  ];

  const missing = required.filter(
    (key) => !process.env[key]
  );

  if (missing.length > 0) {
    console.warn(
      `⚠️  Missing environment variables: ${missing.join(', ')}\n` +
      `   Using default values. Check your .env.local file.`
    );
  }

  // Log configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Game Configuration:');
    console.log(`   Game Server: ${config.gameServer.url}`);
    console.log(`   Chain: Base Sepolia (${config.blockchain.chainId})`);
    console.log(`   Contract: ${config.blockchain.escrowContract}`);
    console.log(`   RPC: ${config.blockchain.rpcUrl}`);
  }
}

// Export individual configs for convenience
export const { gameServer, blockchain, game } = config;

