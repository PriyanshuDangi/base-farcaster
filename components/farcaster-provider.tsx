import type { Context } from '@farcaster/miniapp-sdk'
import sdk from '@farcaster/miniapp-sdk'
import { useQuery } from '@tanstack/react-query'
import { type ReactNode, createContext, useContext } from 'react'

interface FrameContextValue {
  context: Context.MiniAppContext | undefined
  isLoading: boolean
  isSDKLoaded: boolean
  isEthProviderAvailable: boolean
  actions: typeof sdk.actions | undefined
  isDevMode: boolean
}

const FrameProviderContext = createContext<FrameContextValue | undefined>(
  undefined,
)

export function useFrame() {
  const context = useContext(FrameProviderContext)
  if (context === undefined) {
    throw new Error('useFrame must be used within a FrameProvider')
  }
  return context
}

interface FrameProviderProps {
  children: ReactNode
}

// Check if we're in development mode
const isDevMode =
  process.env.NEXT_PUBLIC_DEV_MODE === 'true' ||
  process.env.NODE_ENV === 'development'

// Mock context for development
const mockContext = {
  user: {
    fid: 12345,
    username: 'devuser',
    displayName: 'Dev User',
    pfpUrl: 'https://i.imgur.com/placeholder.png',
  },
  client: {
    clientFid: '12345',
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    added: true,
  },
  location: {
    pathName: '/',
    dappUrl: 'http://localhost:3000',
  },
} as unknown as Context.MiniAppContext

export function FrameProvider({ children }: FrameProviderProps) {
  const farcasterContextQuery = useQuery({
    queryKey: ['farcaster-context'],
    queryFn: async () => {
      // If in dev mode, return mock context immediately
      if (isDevMode) {
        return { context: mockContext, isReady: true }
      }

      // Otherwise, use the actual SDK
      const context = await sdk.context
      await sdk.actions.ready()
      return { context, isReady: true }
    },
    retry: false,
  })

  const isReady = farcasterContextQuery.data?.isReady ?? false

  return (
    <FrameProviderContext.Provider
      value={{
        context: farcasterContextQuery.data?.context,
        actions: isDevMode ? undefined : sdk.actions,
        isLoading: farcasterContextQuery.isPending,
        isSDKLoaded: isDevMode || (isReady && Boolean(farcasterContextQuery.data?.context)),
        isEthProviderAvailable: isDevMode || Boolean(sdk.wallet.ethProvider),
        isDevMode,
      }}
    >
      {children}
    </FrameProviderContext.Provider>
  )
}
