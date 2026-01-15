"use client";

import { ReactNode, useState, useEffect } from 'react'
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

// Get the actual app URL dynamically
const getAppUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Fallback for SSR - use the configured app URL or Vercel URL
  return process.env.NEXT_PUBLIC_APP_URL || 
         process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 
         'https://orchids-polkastarter-projects.vercel.app'
}

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

// Initialize AppKit only on client side to get correct URL
let appKitInitialized = false

function initializeAppKit() {
  if (appKitInitialized || typeof window === 'undefined') return
  
  const appUrl = getAppUrl()
  
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: {
      name: '3search',
      description: 'Token Launch Platform',
      url: appUrl,
      icons: [`${appUrl}/favicon.ico`]
    },
    features: {
      analytics: false // Disable analytics to avoid 403 errors from domain mismatch
    }
  })
  
  appKitInitialized = true
}

// Initialize immediately if on client
if (typeof window !== 'undefined') {
  initializeAppKit()
}

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

  // Ensure AppKit is initialized on client
  useEffect(() => {
    initializeAppKit()
  }, [])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
