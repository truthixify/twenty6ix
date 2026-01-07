'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { AppProvider } from '@/contexts/AppContext'
import { baseConfig } from '@/lib/web3'

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000, // 1 minute
        },
    },
})

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <WagmiProvider config={baseConfig}>
            <QueryClientProvider client={queryClient}>
                <AppProvider>{children}</AppProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
