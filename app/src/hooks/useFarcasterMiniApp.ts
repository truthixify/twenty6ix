'use client'

import { useEffect, useState } from 'react'

// Farcaster Mini App SDK types (based on documentation)
interface FarcasterSDK {
    actions: {
        ready: () => Promise<void>
        openUrl: (url: string) => Promise<void>
        close: () => Promise<void>
    }
    context: {
        user?: {
            fid: number
            username?: string
            displayName?: string
            pfpUrl?: string
        }
        location?: {
            placeId?: string
            description?: string
        }
    }
    quickAuth: {
        getToken: () => Promise<string>
        fetch: (url: string, options?: RequestInit) => Promise<Response>
    }
}

declare global {
    interface Window {
        sdk?: FarcasterSDK
    }
}

export function useFarcasterMiniApp() {
    const [sdk, setSdk] = useState<FarcasterSDK | null>(null)
    const [isReady, setIsReady] = useState(false)
    const [isMiniApp, setIsMiniApp] = useState(false)
    const [user, setUser] = useState<FarcasterSDK['context']['user'] | null>(
        null
    )

    useEffect(() => {
        // Check if we're in a Farcaster Mini App environment
        const checkEnvironment = () => {
            const userAgent = navigator.userAgent
            const url = window.location.href
            const referrer = document.referrer
            
            // More comprehensive Farcaster detection
            const isFarcasterClient =
                // Direct Farcaster user agent detection
                userAgent.includes('Farcaster') ||
                userAgent.includes('Warpcast') ||
                // Frame context detection
                window.location !== window.parent.location || // iframe detection
                url.includes('fc_frame=') ||
                url.includes('farcaster') ||
                // Referrer detection
                referrer.includes('farcaster') ||
                referrer.includes('warpcast') ||
                referrer.includes('fc.xyz') ||
                // URL parameters that indicate Farcaster context
                new URLSearchParams(window.location.search).has('fc_frame') ||
                // Check for Farcaster-specific window properties
                'farcaster' in window ||
                // Check if we're in an embedded context with Farcaster origins
                (window.parent !== window && (
                    referrer.includes('warpcast') || 
                    referrer.includes('farcaster')
                ))

            console.log('Environment detection:', {
                userAgent,
                url,
                referrer,
                isIframe: window.location !== window.parent.location,
                isFarcasterClient,
                hasFrameParam: url.includes('fc_frame='),
                windowFarcaster: 'farcaster' in window
            })

            setIsMiniApp(isFarcasterClient)
            return isFarcasterClient
        }

        const initializeSDK = async () => {
            const isInMiniApp = checkEnvironment()

            if (isInMiniApp) {
                try {
                    // Load SDK from CDN if not already loaded
                    if (!window.sdk) {
                        console.log('Loading Farcaster SDK...')
                        
                        // Try to load the SDK
                        const script = document.createElement('script')
                        script.type = 'module'
                        script.innerHTML = `
                            try {
                                const { sdk } = await import('https://esm.sh/@farcaster/miniapp-sdk');
                                window.sdk = sdk;
                                window.dispatchEvent(new CustomEvent('farcaster-sdk-loaded', { detail: { success: true } }));
                            } catch (error) {
                                console.error('Failed to load Farcaster SDK:', error);
                                window.dispatchEvent(new CustomEvent('farcaster-sdk-loaded', { detail: { success: false, error } }));
                            }
                        `
                        document.head.appendChild(script)

                        // Wait for SDK to load
                        const loadResult = await new Promise<{ success: boolean; error?: any }>(resolve => {
                            const handleLoad = (event: CustomEvent) => {
                                window.removeEventListener('farcaster-sdk-loaded', handleLoad as EventListener)
                                resolve(event.detail)
                            }
                            window.addEventListener('farcaster-sdk-loaded', handleLoad as EventListener)
                            
                            // Timeout after 10 seconds
                            setTimeout(() => {
                                window.removeEventListener('farcaster-sdk-loaded', handleLoad as EventListener)
                                resolve({ success: false, error: 'SDK load timeout' })
                            }, 10000)
                        })

                        if (!loadResult.success) {
                            throw new Error(`SDK loading failed: ${loadResult.error}`)
                        }
                    }

                    if (window.sdk) {
                        console.log('Farcaster SDK loaded successfully')
                        setSdk(window.sdk)
                        setUser(window.sdk.context.user || null)

                        // Signal that the app is ready
                        await window.sdk.actions.ready()
                        setIsReady(true)
                        console.log('Farcaster Mini App ready')
                    }
                } catch (error) {
                    console.error('Failed to initialize Farcaster SDK:', error)
                    
                    // Check if we're in development mode
                    const isDev = process.env.NODE_ENV === 'development'
                    
                    if (isDev) {
                        console.log('Development mode: Creating mock SDK for testing')
                        // Fallback: create a mock SDK for development
                        const mockSdk: FarcasterSDK = {
                            actions: {
                                ready: async () => {
                                    console.log('Mock SDK ready')
                                    setIsReady(true)
                                },
                                openUrl: async (url: string) => {
                                    console.log('Mock openUrl:', url)
                                    window.open(url, '_blank')
                                },
                                close: async () => {
                                    console.log('Mock close')
                                    window.close()
                                },
                            },
                            context: {
                                user: {
                                    fid: 123456,
                                    username: 'testuser',
                                    displayName: 'Test User',
                                    pfpUrl: undefined,
                                },
                            },
                            quickAuth: {
                                getToken: async () => {
                                    console.log('Mock getToken')
                                    return 'mock-token-' + Date.now()
                                },
                                fetch: async (url: string, options?: RequestInit) => {
                                    console.log('Mock fetch:', url)
                                    return fetch(url, options)
                                },
                            },
                        }
                        setSdk(mockSdk)
                        setUser(mockSdk.context.user || null)
                        setIsReady(true)
                    } else {
                        // In production, fail gracefully
                        console.error('Farcaster SDK failed to load in production')
                        setIsReady(true) // Still set ready to avoid infinite loading
                    }
                }
            } else {
                // Not in Mini App environment
                console.log('Not in Farcaster Mini App environment')
                setIsReady(true)
            }
        }

        initializeSDK()
    }, [])

    // Authentication function
    const authenticate = async () => {
        if (!sdk) return null

        try {
            const token = await sdk.quickAuth.getToken()
            return { token, user }
        } catch (error) {
            console.error('Authentication failed:', error)
            return null
        }
    }

    // Share functionality
    const shareContent = (text: string, url?: string) => {
        if (isMiniApp && sdk) {
            // In Mini App, we can use Farcaster's native sharing
            const shareUrl = url ? `${text} ${url}` : text
            sdk.actions.openUrl(
                `https://warpcast.com/~/compose?text=${encodeURIComponent(shareUrl)}`
            )
        } else {
            // Fallback for web
            if (navigator.share) {
                navigator.share({ text, url })
            } else {
                navigator.clipboard.writeText(url ? `${text} ${url}` : text)
            }
        }
    }

    // Open external URL
    const openUrl = (url: string) => {
        if (isMiniApp && sdk) {
            sdk.actions.openUrl(url)
        } else {
            window.open(url, '_blank')
        }
    }

    // Close Mini App
    const close = () => {
        if (isMiniApp && sdk) {
            sdk.actions.close()
        }
    }

    // Make authenticated requests
    const authenticatedFetch = async (url: string, options?: RequestInit) => {
        if (sdk) {
            return sdk.quickAuth.fetch(url, options)
        }
        return fetch(url, options)
    }

    return {
        // Environment info
        isMiniApp,
        isReady,
        sdk,

        // User info
        user,

        // Actions
        authenticate,
        shareContent,
        openUrl,
        close,
        authenticatedFetch,
    }
}
