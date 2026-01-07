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
            const isFarcasterClient =
                userAgent.includes('Farcaster') ||
                userAgent.includes('Warpcast') ||
                window.location !== window.parent.location || // iframe detection
                window.location.search.includes('fc_frame=') ||
                document.referrer.includes('farcaster') ||
                document.referrer.includes('warpcast')

            setIsMiniApp(isFarcasterClient)
            return isFarcasterClient
        }

        const initializeSDK = async () => {
            const isInMiniApp = checkEnvironment()

            if (isInMiniApp) {
                try {
                    // Load SDK from CDN if not already loaded
                    if (!window.sdk) {
                        const script = document.createElement('script')
                        script.type = 'module'
                        script.innerHTML = `
              import { sdk } from 'https://esm.sh/@farcaster/miniapp-sdk';
              window.sdk = sdk;
              window.dispatchEvent(new CustomEvent('farcaster-sdk-loaded'));
            `
                        document.head.appendChild(script)

                        // Wait for SDK to load
                        await new Promise(resolve => {
                            const handleLoad = () => {
                                window.removeEventListener(
                                    'farcaster-sdk-loaded',
                                    handleLoad
                                )
                                resolve(void 0)
                            }
                            window.addEventListener(
                                'farcaster-sdk-loaded',
                                handleLoad
                            )
                        })
                    }

                    if (window.sdk) {
                        setSdk(window.sdk)
                        setUser(window.sdk.context.user || null)

                        // Signal that the app is ready
                        await window.sdk.actions.ready()
                        setIsReady(true)
                    }
                } catch (error) {
                    console.error('Failed to initialize Farcaster SDK:', error)
                    // Fallback: create a mock SDK for development
                    const mockSdk: FarcasterSDK = {
                        actions: {
                            ready: async () => {
                                setIsReady(true)
                            },
                            openUrl: async (url: string) => {
                                window.open(url, '_blank')
                            },
                            close: async () => {
                                window.close()
                            },
                        },
                        context: {
                            user: {
                                fid: 123456,
                                username: 'demo',
                                displayName: 'Demo User',
                                pfpUrl: undefined,
                            },
                        },
                        quickAuth: {
                            getToken: async () => 'mock-token',
                            fetch: async (url: string, options?: RequestInit) =>
                                fetch(url, options),
                        },
                    }
                    setSdk(mockSdk)
                    setUser(mockSdk.context.user || null)
                    setIsReady(true)
                }
            } else {
                // Not in Mini App environment
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
