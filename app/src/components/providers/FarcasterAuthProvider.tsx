'use client'

import React from 'react'
import { AuthKitProvider } from '@farcaster/auth-kit'

interface FarcasterAuthProviderProps {
  children: React.ReactNode
}

const config = {
  // For development, you can use localhost
  // For production, use your actual domain
  domain: process.env.NEXT_PUBLIC_APP_URL?.replace('https://', '') || 'twenty6ix-nqd2.vercel.app',
  siweUri: process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix-nqd2.vercel.app',
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  relay: 'https://relay.farcaster.xyz',
}

export function FarcasterAuthProvider({ children }: FarcasterAuthProviderProps) {
  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  )
}