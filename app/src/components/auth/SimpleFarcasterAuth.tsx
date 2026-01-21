'use client'

import React, { useState, useCallback } from 'react'
import { Twenty6ixButton } from '~/components/ui/Twenty6ixButton'
import { Twenty6ixCard, Twenty6ixCardContent, Twenty6ixCardHeader, Twenty6ixCardTitle } from '~/components/ui/Twenty6ixCard'
import { Zap, ExternalLink, QrCode } from 'lucide-react'

interface SimpleFarcasterAuthProps {
  onSuccess: (userData: { fid: number; username?: string; pfpUrl?: string; bio?: string }) => void
  onError: (error: string) => void
  isLoading?: boolean
}

export function SimpleFarcasterAuth({ onSuccess, onError, isLoading = false }: SimpleFarcasterAuthProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [authUrl, setAuthUrl] = useState<string | null>(null)
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  const isOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

  const handleDemoSignIn = useCallback(() => {
    console.log('🎯 Demo sign in called')
    const demoUser = {
      fid: 123456,
      username: 'demo-user',
      pfpUrl: undefined,
      bio: 'Demo user for testing TWENTY6IX',
    }
    onSuccess(demoUser)
  }, [onSuccess])

  const generateAuthUrl = useCallback(() => {
    // Generate a simple Warpcast auth URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix-n.vercel.app'
    const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/callback`)
    const clientId = 'twenty6ix' // You can customize this
    
    // This is a simplified auth URL - in production you'd use proper OAuth flow
    const authUrl = `https://warpcast.com/~/sign-in-with-farcaster?redirect_uri=${redirectUri}&client_id=${clientId}`
    
    console.log('🔗 Generated auth URL:', authUrl)
    return authUrl
  }, [])

  const handleSignIn = useCallback(async () => {
    if (isDemoMode) {
      handleDemoSignIn()
      return
    }

    setIsConnecting(true)
    try {
      // Generate auth URL and open in new window
      const url = generateAuthUrl()
      setAuthUrl(url)
      
      // Open in new window for desktop, or redirect for mobile
      if (window.innerWidth > 768) {
        const popup = window.open(url, 'farcaster-auth', 'width=500,height=600')
        
        // Listen for popup close or message
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed)
            setIsConnecting(false)
            setAuthUrl(null)
          }
        }, 1000)
        
        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed)
          if (popup && !popup.closed) {
            popup.close()
          }
          setIsConnecting(false)
          setAuthUrl(null)
        }, 300000)
        
      } else {
        // Mobile - redirect directly
        window.location.href = url
      }
      
    } catch (err) {
      console.error('❌ Auth error:', err)
      onError(err instanceof Error ? err.message : 'Failed to start authentication')
      setIsConnecting(false)
    }
  }, [isDemoMode, handleDemoSignIn, generateAuthUrl, onError])

  const handleDirectAuth = useCallback(() => {
    // For testing - create a mock successful auth
    const mockUser = {
      fid: Math.floor(Math.random() * 1000000),
      username: 'test-user',
      pfpUrl: undefined,
      bio: 'Test user from direct auth',
    }
    onSuccess(mockUser)
  }, [onSuccess])

  if (authUrl) {
    return (
      <Twenty6ixCard className="max-w-md mx-auto">
        <Twenty6ixCardHeader>
          <Twenty6ixCardTitle className="text-center">Complete Authentication</Twenty6ixCardTitle>
        </Twenty6ixCardHeader>
        <Twenty6ixCardContent className="space-y-4">
          <div className="text-center">
            <QrCode className="h-16 w-16 mx-auto mb-4 text-[#00A3AD]" />
            <p className="text-[#B8C1D0] mb-4">
              Authentication window opened. Complete the sign-in process in the popup window.
            </p>
            
            <Twenty6ixButton
              variant="secondary"
              onClick={() => {
                setAuthUrl(null)
                setIsConnecting(false)
              }}
              className="w-full"
            >
              Cancel
            </Twenty6ixButton>
          </div>
        </Twenty6ixCardContent>
      </Twenty6ixCard>
    )
  }

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
          
          {isOfflineMode && (
            <div className="mb-4 p-3 bg-[#1A1F2E] border border-[#2A3441] rounded-lg">
              <p className="text-[#FFA500] text-sm">
                🔄 Running in offline mode - database unavailable
              </p>
            </div>
          )}
          
          <Twenty6ixButton
            variant="claim"
            onClick={handleSignIn}
            disabled={isLoading || isConnecting}
            className="w-full"
          >
            {isConnecting ? (
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
          
          <Twenty6ixButton
            variant="secondary"
            onClick={handleDemoSignIn}
            disabled={isLoading || isConnecting}
            className="w-full mt-3"
          >
            Try Demo Mode
          </Twenty6ixButton>
          
          {/* Test button - always works in offline mode */}
          <Twenty6ixButton
            variant="secondary"
            onClick={handleDirectAuth}
            disabled={isLoading || isConnecting}
            className="w-full mt-3 opacity-75"
          >
            🧪 Test Auth {isOfflineMode ? '(Offline)' : '(Dev Only)'}
          </Twenty6ixButton>
          
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