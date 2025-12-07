'use client'

import { Demo } from '@/components/Home'
import { useFrame } from '@/components/farcaster-provider'
import { SafeAreaContainer } from '@/components/safe-area-container'
import Navbar from '../Home/Navbar'

export default function Home() {
  const { context, isLoading, isSDKLoaded, isDevMode } = useFrame()

  if (isLoading) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8">
          <h1 className="text-3xl font-bold text-center">Loading...</h1>
        </div>
      </SafeAreaContainer>
    )
  }

  if (!isSDKLoaded) {
    return (
      <SafeAreaContainer insets={context?.client.safeAreaInsets}>
        <div className="flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-[#000814]">
          <h1 className="text-3xl font-bold text-center text-white">
            No farcaster SDK found, please use this miniapp in the farcaster app
          </h1>
          <p className="text-sm text-[#A3B3C2] text-center">
            To develop locally, set NEXT_PUBLIC_DEV_MODE=true in your .env.local file
          </p>
        </div>
      </SafeAreaContainer>
    )
  }

  return (
    <SafeAreaContainer insets={context?.client.safeAreaInsets}>
      {isDevMode && (
        <div className="bg-yellow-500 text-black text-xs p-2 text-center font-semibold">
          🚧 DEV MODE - Running with mock Farcaster data
        </div>
      )}
      <Navbar />
      <Demo />
    </SafeAreaContainer>
  )
}
