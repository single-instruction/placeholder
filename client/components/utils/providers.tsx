'use client'

import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { config } from '@/lib/wagmi-config'
import { useState, useEffect } from 'react'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  // This ensures that the UI doesn't render with incorrect states during SSR
  // Only show the UI once the component has mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#2d2d2d',
            accentColorForeground: 'white',
            borderRadius: 'medium',
            overlayBlur: 'small',
          })}
          modalSize="compact"
        >
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}