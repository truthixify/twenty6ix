'use client'

import React, { useCallback, useState } from 'react'
import { useSignIn, useProfile } from '@farcaster/auth-kit'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Zap, ExternalLink } from 'lucide-react'

interface SignInWithFarcasterProps {
  onSuccess: (userData: { fid: number; username?: string; pfpUrl?: string; bio?: string }) => void
  onError: (error: string) => void
  isLoading?: boolean
}

export function SignInWithFarcaster({ onSuccess, onError, isLoading = false }: SignInWithFarcasterProps) {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  
  const {
    signIn,
    connect,
    reconnect,
    isSuccess,
    isError,
    error,
    channelToken,
    url,
    data,
    validSignature,
  } = useSignIn({
    onSuccess: ({ fid, username, bio, pfpUrl }) => {
      // This will be handled in the useEffect below
    },
    onError: (error) => {
      console.error('Auth error:', error)
    },
  })

  const { isAuthenticated, profile } = useProfile()

  const handleDemoSignIn = useCallback(() => {
    // Demo mode - create a demo user
    const demoUser = {
      fid: 123456,
      username: 'demo-user',
      pfpUrl: undefined,
      bio: 'Demo user for testing TWENTY6IX',
    }
    onSuccess(demoUser)
  }, [onSuccess])

  const handleSignIn = useCallback(async () => {
    if (isDemoMode) {
      handleDemoSignIn()
      return
    }

    setIsSigningIn(true)
    try {
      await signIn()
    } catch (err) {
      console.error('Sign in error:', err)
      onError(err instanceof Error ? err.message : 'Failed to sign in')
      setIsSigningIn(false)
    }
  }, [signIn, onError, isDemoMode, handleDemoSignIn])

  const handleConnect = useCallback(async () => {
    try {
      await connect()
    } catch (err) {
      console.error('Connect error:', err)
      onError(err instanceof Error ? err.message : 'Failed to connect')
    }
  }, [connect, onError])

  // Handle successful authentication
  React.useEffect(() => {
    if (isSuccess && validSignature && data && data.fid) {
      const userData = {
        fid: data.fid,
        username: data.username,
        pfpUrl: data.pfpUrl,
        bio: data.bio,
      }
      onSuccess(userData)
      setIsSigningIn(false)
    }
  }, [isSuccess, validSignature, data, onSuccess])

  // Handle authentication errors
  React.useEffect(() => {
    if (isError && error) {
      onError(error.message || 'Authentication failed')
      setIsSigningIn(false)
    }
  }, [isError, error, onError])

  // If we have a URL, show QR code option
  if (url && channelToken) {
    return (
      <Twenty6ixCard className="max-w-md mx-auto">
        <Twenty6ixCardHeader>
          <Twenty6ixCardTitle className="text-center">Sign In with Farcaster</Twenty6ixCardTitle>
        </Twenty6ixCardHeader>
        <Twenty6ixCardContent className="space-y-4">
          <div className="text-center">
            <p className="text-[#B8C1D0] mb-4">
              Scan the QR code with your phone or click the button below to sign in with Warpcast
            </p>
            
            {/* QR Code would go here - for now, just show the connect button */}
            <Twenty6ixButton
              variant="primary"
              onClick={handleConnect}
              disabled={isLoading || isSigningIn}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4" />
              Open in Warpcast
            </Twenty6ixButton>
            
            <p className="text-xs text-[#6E7688] mt-4">
              This will open Warpcast to complete the sign-in process
            </p>
          </div>
        </Twenty6ixCardContent>
      </Twenty6ixCard>
    )
  }

  // Initial sign-in button
  return (
    <Twenty6ixCard className="max-w-md mx-auto">
      <Twenty6ixCardHeader>
        <Twenty6ixCardTitle className="text-center">Welcome to TWENTY6IX</Twenty6ixCardTitle>
      </Twenty6ixCardHeader>
      <Twenty6ixCardContent className="space-y-4">
        <div className="text-center">
          <p className="text-[#B8C1D0] mb-6">
            Connect your Farcaster account to start earning XP, completing tasks, and minting NFTs
          </p>
          
          <Twenty6ixButton
            variant="claim"
            onClick={handleSignIn}
            disabled={isLoading || isSigningIn}
            className="w-full"
          >
            {isSigningIn ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Connecting...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {isDemoMode ? 'Enter Demo Mode' : 'Sign In with Farcaster'}
              </>
            )}
          </Twenty6ixButton>
          
          {!isDemoMode && (
            <Twenty6ixButton
              variant="secondary"
              onClick={handleDemoSignIn}
              disabled={isLoading || isSigningIn}
              className="w-full mt-3"
            >
              Try Demo Mode
            </Twenty6ixButton>
          )}
          
          <div className="mt-6 space-y-2 text-xs text-[#B8C1D0]">
            <p>✨ Earn XP through daily claims and social tasks</p>
            <p>🎨 Mint exclusive NFTs as you progress</p>
            <p>🏆 Climb the leaderboard and compete with friends</p>
            <p>⚡ Built on Base for fast, cheap transactions</p>
          </div>
        </div>
      </Twenty6ixCardContent>
    </Twenty6ixCard>
  )
}