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
      console.log('🎉 Auth Kit onSuccess called:', { fid, username, bio, pfpUrl })
      // The success will be handled in the useEffect below
    },
    onError: (error) => {
      console.error('❌ Auth Kit onError:', error)
      onError(error?.message || 'Authentication failed')
      setIsSigningIn(false)
    },
  })

  const { isAuthenticated, profile } = useProfile()

  // Debug: Log auth kit state changes
  React.useEffect(() => {
    console.log('🔍 Auth Kit State:', {
      isSuccess,
      isError,
      error: error?.message,
      channelToken,
      url,
      data,
      validSignature,
      isSigningIn
    })
  }, [isSuccess, isError, error, channelToken, url, data, validSignature, isSigningIn])

  const handleDemoSignIn = useCallback(() => {
    console.log('🎯 Demo sign in called')
    // Demo mode - create a demo user
    const demoUser = {
      fid: 123456,
      username: 'demo-user',
      pfpUrl: undefined,
      bio: 'Demo user for testing TWENTY6IX',
    }
    console.log('🎯 Calling onSuccess with demo user:', demoUser)
    onSuccess(demoUser)
  }, [onSuccess])

  const handleSignIn = useCallback(async () => {
    console.log('🔐 handleSignIn called, isDemoMode:', isDemoMode)
    if (isDemoMode) {
      handleDemoSignIn()
      return
    }

    setIsSigningIn(true)
    try {
      console.log('🔐 Calling signIn()')
      await signIn()
      
      // Set a timeout to prevent infinite loading
      setTimeout(() => {
        if (isSigningIn) {
          console.warn('⚠️ Authentication timeout - stopping loading state')
          setIsSigningIn(false)
          onError('Authentication timed out. Please try again.')
        }
      }, 30000) // 30 second timeout
      
    } catch (err) {
      console.error('❌ Sign in error:', err)
      onError(err instanceof Error ? err.message : 'Failed to sign in')
      setIsSigningIn(false)
    }
  }, [signIn, onError, isDemoMode, handleDemoSignIn, isSigningIn])

  const handleDemoClick = useCallback(() => {
    console.log('🎯 Demo click handler called')
    // Always use demo mode when this button is clicked
    handleDemoSignIn()
  }, [handleDemoSignIn])

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
    console.log('🔍 Auth state changed:', { isSuccess, validSignature, data })
    if (isSuccess && validSignature && data && data.fid) {
      const userData = {
        fid: data.fid,
        username: data.username,
        pfpUrl: data.pfpUrl,
        bio: data.bio,
      }
      console.log('✅ Authentication successful, calling onSuccess with:', userData)
      onSuccess(userData)
      setIsSigningIn(false)
    }
  }, [isSuccess, validSignature, data, onSuccess])

  // Handle authentication errors
  React.useEffect(() => {
    console.log('🔍 Error state changed:', { isError, error })
    if (isError && error) {
      console.error('❌ Authentication error:', error)
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
            onClick={isDemoMode ? handleDemoClick : handleSignIn}
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
              onClick={handleDemoClick}
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