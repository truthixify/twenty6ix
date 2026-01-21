'use client'

import React from 'react'
import { AuthKitProvider } from '@farcaster/auth-kit'

interface FarcasterAuthProviderProps {
  children: React.ReactNode
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.vercel.app'
const domain = baseUrl.replace('https://', '').replace('http://', '')

const config = {
  // Domain without protocol
  domain,
  // SIWE URI - full URL
  siweUri: baseUrl,
  // RPC URL for Base network
  rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
  // Farcaster relay
  relay: 'https://relay.farcaster.xyz',
  // Optional: Custom SIWE endpoint
  siweEndpoint: `${baseUrl}/api/auth/siwe`,
}

console.log('🔧 Farcaster Auth Config:', config)

export function FarcasterAuthProvider({ children }: FarcasterAuthProviderProps) {
  return (
    <AuthKitProvider config={config}>
      {children}
    </AuthKitProvider>
  )
}