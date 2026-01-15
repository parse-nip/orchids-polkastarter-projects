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

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Polkastarter Clone',
    description: 'Polkastarter Clone with WalletConnect',
    url: 'https://polkastarter.com',
    icons: ['https://assets.reown.com/reown-profile-pic.png']
  },
  features: {
    analytics: true
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
