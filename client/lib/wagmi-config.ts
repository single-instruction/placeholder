'use client'

import { baseSepolia, avalancheFuji } from 'wagmi/chains'
import { http, createConfig } from 'wagmi'
import { getDefaultWallets } from '@rainbow-me/rainbowkit'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '7fca28a51fc7faf46402c981989c35d0'

const { wallets } = getDefaultWallets({
  projectId,
  appName: 'zkCLOB',
})

export const config = createConfig({
  chains: [baseSepolia, avalancheFuji] as const,
  transports: {
    [baseSepolia.id]: http(),
    [avalancheFuji.id]: http(),
  },
  ssr: true
})