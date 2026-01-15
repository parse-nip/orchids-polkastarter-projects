"use client";

import { ReactNode, useState } from 'react'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, polygon, base, bsc, sepolia, arbitrumSepolia, polygonAmoy, baseSepolia, bscTestnet } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ""

if (!projectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set")
}

const networks = [mainnet, arbitrum, polygon, base, bsc, sepolia, arbitrumSepolia, polygonAmoy, baseSepolia, bscTestnet]

// Get the app URL - use window.location.origin on client, or fall back to Vercel URL
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for SSR - Vercel provides NEXT_PUBLIC_VERCEL_URL automatically
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'https://3searchcapital.vercel.app'
}

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// Initialize AppKit at module level (required for hooks to work during SSR)
const appUrl = getAppUrl()

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: '3Search Capital',
    description: 'Token Launch Platform',
    url: appUrl,
    icons: [`${appUrl}/favicon.ico`]
  },
  features: {
    analytics: false // Disable analytics to avoid 403 errors from domain mismatch
  }
})

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    })
  })

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
