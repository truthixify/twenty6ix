'use client'

import React from 'react'
import { useApp } from '@/contexts/AppContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function FarcasterDebug() {
    const { state, miniApp, signInWithFarcaster } = useApp()

    const debugInfo = {
        // Environment
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        url: typeof window !== 'undefined' ? window.location.href : 'N/A',
        referrer: typeof document !== 'undefined' ? document.referrer : 'N/A',
        isIframe: typeof window !== 'undefined' ? window.location !== window.parent.location : false,
        
        // Mini App State
        isMiniApp: miniApp.isMiniApp,
        isReady: miniApp.isReady,
        hasSDK: !!miniApp.sdk,
        user: miniApp.user,
        
        // App State
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        userProfile: state.user,
        
        // Environment Variables
        demoMode: process.env.NEXT_PUBLIC_DEMO_MODE,
        ownerFid: process.env.NEXT_PUBLIC_OWNER_FID,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
    }

    const handleTestAuth = async () => {
        try {
            await signInWithFarcaster()
        } catch (error) {
            // Test auth failed
        }
    }

    const handleTestSDK = async () => {
        if (miniApp.sdk) {
            try {
                const token = await miniApp.authenticate()
                // SDK Auth successful
            } catch (error) {
                // SDK Auth failed
            }
        }
    }

    return (
        <div className="space-y-6 p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Farcaster Authentication Debug</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Environment Info */}
                    <div>
                        <h3 className="font-semibold mb-2">Environment Detection</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Is Mini App:</span>
                                <Badge variant={debugInfo.isMiniApp ? 'success' : 'secondary'}>
                                    {debugInfo.isMiniApp ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Is Ready:</span>
                                <Badge variant={debugInfo.isReady ? 'success' : 'secondary'}>
                                    {debugInfo.isReady ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Has SDK:</span>
                                <Badge variant={debugInfo.hasSDK ? 'success' : 'secondary'}>
                                    {debugInfo.hasSDK ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Is Iframe:</span>
                                <Badge variant={debugInfo.isIframe ? 'warning' : 'secondary'}>
                                    {debugInfo.isIframe ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* User Info */}
                    <div>
                        <h3 className="font-semibold mb-2">User Information</h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="font-medium">Farcaster User:</span>
                                <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-auto">
                                    {JSON.stringify(debugInfo.user, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <span className="font-medium">App User Profile:</span>
                                <pre className="bg-muted p-2 rounded mt-1 text-xs overflow-auto">
                                    {JSON.stringify(debugInfo.userProfile, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Authentication State */}
                    <div>
                        <h3 className="font-semibold mb-2">Authentication State</h3>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex justify-between">
                                <span>Authenticated:</span>
                                <Badge variant={debugInfo.isAuthenticated ? 'success' : 'secondary'}>
                                    {debugInfo.isAuthenticated ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Loading:</span>
                                <Badge variant={debugInfo.isLoading ? 'warning' : 'secondary'}>
                                    {debugInfo.isLoading ? 'Yes' : 'No'}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Demo Mode:</span>
                                <Badge variant={debugInfo.demoMode === 'true' ? 'warning' : 'secondary'}>
                                    {debugInfo.demoMode}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>Error:</span>
                                <Badge variant={debugInfo.error ? 'destructive' : 'success'}>
                                    {debugInfo.error || 'None'}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Environment Details */}
                    <div>
                        <h3 className="font-semibold mb-2">Environment Details</h3>
                        <div className="space-y-2 text-xs">
                            <div>
                                <span className="font-medium">User Agent:</span>
                                <div className="bg-muted p-2 rounded mt-1 break-all">
                                    {debugInfo.userAgent}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium">URL:</span>
                                <div className="bg-muted p-2 rounded mt-1 break-all">
                                    {debugInfo.url}
                                </div>
                            </div>
                            <div>
                                <span className="font-medium">Referrer:</span>
                                <div className="bg-muted p-2 rounded mt-1 break-all">
                                    {debugInfo.referrer || 'None'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Actions */}
                    <div>
                        <h3 className="font-semibold mb-2">Test Actions</h3>
                        <div className="flex gap-2">
                            <Button onClick={handleTestAuth} disabled={state.isLoading}>
                                Test Authentication
                            </Button>
                            <Button onClick={handleTestSDK} disabled={!miniApp.sdk}>
                                Test SDK Auth
                            </Button>
                            <Button 
                                onClick={() => window.location.reload()} 
                                variant="outline"
                            >
                                Reload Page
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}