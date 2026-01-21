'use client'

import React, { useEffect, useState } from 'react'
import { useMiniApp } from '@neynar/react'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Zap, User, AlertCircle, Shield } from 'lucide-react'

interface MiniAppAuthProps {
  onSuccess: (userData: { fid: number; username?: string; pfpUrl?: string; bio?: string }) => void
  onError: (error: string) => void
  isLoading?: boolean
}

export function MiniAppAuth({ onSuccess, onError, isLoading = false }: MiniAppAuthProps) {
  const { context, isSDKLoaded, actions } = useMiniApp()
  const [authState, setAuthState] = useState<'loading' | 'ready' | 'requesting' | 'authenticated' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  // Check if we're in a Mini App context and SDK is loaded
  useEffect(() => {
    if (!isSDKLoaded) {
      setAuthState('loading')
      return
    }

    // In Mini Apps, if the user is already authenticated at the Farcaster level,
    // they will be available in context. If not, we show the login screen.
    if (context?.user) {
      console.log('🎯 User already authenticated in Mini App:', context.user)
      // Don't auto-authenticate - let user click the login button
      setAuthState('ready')
    } else {
      console.log('📱 Mini App loaded, ready for authentication')
      setAuthState('ready')
    }
  }, [isSDKLoaded, context?.user])

  // Handle Farcaster login - in Mini Apps this checks for existing auth
  const handleFarcasterLogin = async () => {
    try {
      setAuthState('requesting')
      console.log('🔐 Checking Farcaster authentication...')

      // Small delay to show the requesting state
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if user context is available (they're logged into Farcaster)
      if (context?.user) {
        console.log('✅ Farcaster user found:', context.user)
        
        setAuthState('authenticated')
        onSuccess({
          fid: context.user.fid,
          username: context.user.username,
          pfpUrl: context.user.pfpUrl,
          bio: undefined,
        })
      } else {
        // No user context means they're not logged into Farcaster
        throw new Error('Please log into Farcaster first, then try again')
      }
    } catch (err) {
      console.error('❌ Farcaster authentication failed:', err)
      setAuthState('ready')
      setError(err instanceof Error ? err.message : 'Authentication failed')
      onError(err instanceof Error ? err.message : 'Authentication failed')
    }
  }

  const handleDemoSignIn = () => {
    const demoUser = {
      fid: 123456,
      username: 'demo-user',
      pfpUrl: undefined,
      bio: 'Demo user for testing TWENTY6IX',
    }
    onSuccess(demoUser)
  }

  const handleTestAuth = () => {
    const testUser = {
      fid: Math.floor(Math.random() * 1000000),
      username: 'test-user',
      pfpUrl: undefined,
      bio: 'Test user from Mini App auth',
    }
    onSuccess(testUser)
  }

  // Render different states
  const renderContent = () => {
    switch (authState) {
      case 'loading':
        return (
          <Twenty6ixCard className="max-w-md mx-auto">
            <Twenty6ixCardHeader>
              <Twenty6ixCardTitle className="text-center">Loading TWENTY6IX</Twenty6ixCardTitle>
            </Twenty6ixCardHeader>
            <Twenty6ixCardContent className="space-y-4">
              <div className="text-center">
                <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-b-2 border-[#00A3AD]"></div>
                <p className="text-[#B8C1D0]">
                  Initializing Farcaster Mini App...
                </p>
              </div>
            </Twenty6ixCardContent>
          </Twenty6ixCard>
        )

      case 'requesting':
        return (
          <Twenty6ixCard className="max-w-md mx-auto">
            <Twenty6ixCardHeader>
              <Twenty6ixCardTitle className="text-center">Requesting Permission</Twenty6ixCardTitle>
            </Twenty6ixCardHeader>
            <Twenty6ixCardContent className="space-y-4">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-[#00A3AD] animate-pulse" />
                <p className="text-[#B8C1D0] mb-2">
                  Checking your Farcaster authentication...
                </p>
                <p className="text-[#6E7688] text-sm">
                  Please wait while we verify your account
                </p>
              </div>
            </Twenty6ixCardContent>
          </Twenty6ixCard>
        )

      case 'authenticated':
        return (
          <Twenty6ixCard className="max-w-md mx-auto">
            <Twenty6ixCardHeader>
              <Twenty6ixCardTitle className="text-center">Welcome! 👋</Twenty6ixCardTitle>
            </Twenty6ixCardHeader>
            <Twenty6ixCardContent className="space-y-4">
              <div className="text-center">
                <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-b-2 border-[#00A3AD]"></div>
                <p className="text-[#B8C1D0]">
                  Setting up your TWENTY6IX profile...
                </p>
              </div>
            </Twenty6ixCardContent>
          </Twenty6ixCard>
        )

      default: // 'ready' or 'error'
        return (
          <Twenty6ixCard className="max-w-md mx-auto">
            <Twenty6ixCardHeader>
              <Twenty6ixCardTitle className="text-center">Welcome to TWENTY6IX</Twenty6ixCardTitle>
            </Twenty6ixCardHeader>
            <Twenty6ixCardContent className="space-y-4">
              <div className="text-center">
                <Zap className="h-16 w-16 mx-auto mb-4 text-[#00A3AD]" />
                
                <p className="text-[#B8C1D0] mb-6">
                  Connect your Farcaster account to continue
                </p>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Twenty6ixButton
                    variant="claim"
                    onClick={handleFarcasterLogin}
                    disabled={isLoading || authState !== 'ready'}
                    className="w-full"
                  >
                    <Zap className="h-4 w-4" />
                    Login with Farcaster
                  </Twenty6ixButton>
                  
                  {/* Development/Testing options */}
                  {process.env.NODE_ENV === 'development' && (
                    <>
                      <Twenty6ixButton
                        variant="secondary"
                        onClick={handleDemoSignIn}
                        disabled={isLoading || authState !== 'ready'}
                        className="w-full"
                      >
                        Try Demo Mode
                      </Twenty6ixButton>
                      
                      <Twenty6ixButton
                        variant="secondary"
                        onClick={handleTestAuth}
                        disabled={isLoading || authState !== 'ready'}
                        className="w-full opacity-75"
                      >
                        🧪 Test Mode
                      </Twenty6ixButton>
                    </>
                  )}
                </div>
                
                <div className="mt-6 space-y-2 text-xs text-[#B8C1D0]">
                  <p>✨ Earn XP through daily claims and social tasks</p>
                  <p>🎨 Mint exclusive NFTs as you progress</p>
                  <p>🏆 Climb the leaderboard and compete with friends</p>
                  <p>⚡ Built on Base for fast, cheap transactions</p>
                </div>
                
                <div className="mt-4 p-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg">
                  <p className="text-[#6E7688] text-xs">
                    <strong>Secure:</strong> We only access your public Farcaster profile. No passwords or private keys required.
                  </p>
                </div>
              </div>
            </Twenty6ixCardContent>
          </Twenty6ixCard>
        )
    }
  }

  return renderContent()
}