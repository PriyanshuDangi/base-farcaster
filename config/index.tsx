import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { baseSepolia } from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'dummy-project-id-for-build'

// Include Base Sepolia testnet for the game
export const networks = [baseSepolia]

// Initialize WagmiAdapter lazily to avoid SSR issues
let _wagmiAdapter: WagmiAdapter | null = null;

export const getWagmiAdapter = () => {
  if (!_wagmiAdapter && typeof window !== 'undefined') {
    _wagmiAdapter = new WagmiAdapter({
      ssr: true,
      projectId,
      networks
    })
  }
  return _wagmiAdapter;
}

// For backward compatibility - export a getter function instead of direct value
export const getConfig = () => {
  const adapter = getWagmiAdapter();
  return adapter?.wagmiConfig;
}