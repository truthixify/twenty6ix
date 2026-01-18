'use client'

import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    ReactNode,
} from 'react'
import { Profile, AppState, LeaderboardEntry } from '~/types/twenty6ix'
import { supabase, TABLES } from '~/lib/supabase'
import { useFarcasterMiniApp } from '~/hooks/useFarcasterMiniApp'

// Action types
type AppAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_USER'; payload: Profile | null }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'UPDATE_XP'; payload: number }
    | { type: 'UPDATE_SPEND'; payload: number }
    | { type: 'RESET_STATE' }

// Initial state
const initialState: AppState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
}

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'SET_USER':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: !!action.payload,
                isLoading: false,
                error: null,
            }
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false }
        case 'UPDATE_XP':
            return state.user
                ? {
                      ...state,
                      user: { ...state.user, xp_total: action.payload },
                  }
                : state
        case 'UPDATE_SPEND':
            return state.user
                ? {
                      ...state,
                      user: { ...state.user, total_spend_usd: action.payload },
                  }
                : state
        case 'RESET_STATE':
            return { ...initialState, isLoading: false }
        default:
            return state
    }
}

// Context type
interface AppContextType {
    state: AppState
    dispatch: React.Dispatch<AppAction>
    // Actions
    signInWithFarcaster: () => Promise<void>
    signOut: () => Promise<void>
    updateProfile: (updates: Partial<Profile>) => Promise<void>
    refreshUser: () => Promise<void>
    // Leaderboard
    leaderboard: LeaderboardEntry[]
    refreshLeaderboard: () => Promise<void>
    // Mini App features
    miniApp: ReturnType<typeof useFarcasterMiniApp>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Provider component
interface AppProviderProps {
    children: ReactNode
}

export function AppProvider({ children }: AppProviderProps) {
    const [state, dispatch] = useReducer(appReducer, initialState)
    const [leaderboard, setLeaderboard] = React.useState<LeaderboardEntry[]>([])
    const miniApp = useFarcasterMiniApp()

    // Sign in with Farcaster
    const signInWithFarcaster = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })

            // Check if demo mode is enabled
            const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

            let fid: number
            let walletAddress: string | undefined

            if (isDemoMode) {
                // Demo mode - create demo user
                fid = 123456
                walletAddress = '0x1234567890123456789012345678901234567890'
            } else if (miniApp.isMiniApp && miniApp.user) {
                // Use Farcaster Mini App authentication
                fid = miniApp.user.fid
                // For Mini Apps, wallet address would come from separate wallet connection
                walletAddress = undefined
            } else if (miniApp.isMiniApp) {
                // Authenticate with Farcaster Mini App
                const authResult = await miniApp.authenticate()
                if (!authResult) {
                    throw new Error('Farcaster Mini App authentication failed')
                }
                fid = authResult.user?.fid || 123456 // fallback
                walletAddress = undefined
            } else {
                // Web fallback - for now, use demo data
                // TODO: Implement traditional SIWF for web
                fid = 123456 // Demo FID
                walletAddress = undefined
            }

            // Check if user exists
            const { data: existingUser, error: fetchError } = await supabase
                .from(TABLES.PROFILES)
                .select('*')
                .eq('fid', fid)
                .single()

            if (fetchError && fetchError.code !== 'PGRST116') {
                throw fetchError
            }

            let user: Profile

            if (existingUser) {
                // Update existing user
                const updates: Partial<Profile> = {
                    updated_at: new Date().toISOString(),
                }

                if (
                    walletAddress &&
                    walletAddress !== existingUser.wallet_address
                ) {
                    updates.wallet_address = walletAddress
                }

                const { data: updatedUser, error: updateError } = await supabase
                    .from(TABLES.PROFILES)
                    .update(updates)
                    .eq('fid', fid)
                    .select()
                    .single()

                if (updateError) throw updateError
                user = updatedUser
            } else {
                // Create new user
                const newUser: Omit<Profile, 'created_at' | 'updated_at'> = {
                    fid,
                    wallet_address: walletAddress,
                    xp_total: isDemoMode ? 1250 : 0, // Demo user starts with XP
                    total_spend_usd: isDemoMode ? 15.50 : 0, // Demo user has some spend
                    referral_code: generateReferralCode(fid),
                }

                const { data: createdUser, error: createError } = await supabase
                    .from(TABLES.PROFILES)
                    .insert(newUser)
                    .select()
                    .single()

                if (createError) throw createError
                user = createdUser
            }

            dispatch({ type: 'SET_USER', payload: user })

            // Set up Mini App features
            if (miniApp.isMiniApp) {
                // Mini App is ready, no additional setup needed for now
            }
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to sign in' })
        }
    }

    // Sign out
    const signOut = async () => {
        try {
            // Clear any Supabase session if exists
            await supabase.auth.signOut()
        } catch (error) {
            // Ignore sign out errors
        } finally {
            // Always reset state regardless of errors
            dispatch({ type: 'RESET_STATE' })
        }
    }

    // Update profile
    const updateProfile = async (updates: Partial<Profile>) => {
        if (!state.user) return

        try {
            const { data: updatedUser, error } = await supabase
                .from(TABLES.PROFILES)
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('fid', state.user.fid)
                .select()
                .single()

            if (error) throw error
            dispatch({ type: 'SET_USER', payload: updatedUser })
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to update profile' })
        }
    }

    // Refresh user data
    const refreshUser = async () => {
        if (!state.user) return

        try {
            const { data: user, error } = await supabase
                .from(TABLES.PROFILES)
                .select('*')
                .eq('fid', state.user.fid)
                .single()

            if (error) throw error
            dispatch({ type: 'SET_USER', payload: user })
        } catch (error) {
            // Ignore refresh errors
        }
    }

    // Refresh leaderboard
    const refreshLeaderboard = async () => {
        try {
            const { data, error } = await supabase.rpc('get_leaderboard', {
                limit_count: 100,
            })
            if (error) throw error
            setLeaderboard(data || [])
        } catch (error) {
            // Ignore leaderboard errors
        }
    }

    // Auto-authenticate if in Mini App and user is available
    useEffect(() => {
        const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
        
        if (isDemoMode) {
            // In demo mode, skip Mini App checks and set ready immediately
            dispatch({ type: 'SET_LOADING', payload: false })
        } else if (miniApp.isMiniApp && miniApp.user && !state.isAuthenticated) {
            signInWithFarcaster()
        } else if (!miniApp.isMiniApp && miniApp.isReady) {
            // For web, set loading to false when ready
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }, [
        miniApp.isMiniApp,
        miniApp.user,
        miniApp.isReady,
        state.isAuthenticated,
    ])

    // Set up real-time subscriptions
    useEffect(() => {
        if (!state.user) return

        // Subscribe to profile changes
        const profileSubscription = supabase
            .channel('profile_changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: TABLES.PROFILES,
                    filter: `fid=eq.${state.user.fid}`,
                },
                payload => {
                    dispatch({
                        type: 'SET_USER',
                        payload: payload.new as Profile,
                    })
                }
            )
            .subscribe()

        // Subscribe to leaderboard changes
        const leaderboardSubscription = supabase
            .channel('leaderboard_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: TABLES.PROFILES,
                },
                () => {
                    refreshLeaderboard()
                }
            )
            .subscribe()

        return () => {
            profileSubscription.unsubscribe()
            leaderboardSubscription.unsubscribe()
        }
    }, [state.user])

    // Initial leaderboard load
    useEffect(() => {
        refreshLeaderboard()
    }, [])

    const contextValue: AppContextType = {
        state,
        dispatch,
        signInWithFarcaster,
        signOut,
        updateProfile,
        refreshUser,
        leaderboard,
        refreshLeaderboard,
        miniApp,
    }

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    )
}

// Hook to use the context
export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}

// Helper function (moved here to avoid circular dependency)
function generateReferralCode(fid: number): string {
    const timestamp = Date.now().toString(36)
    const fidHex = fid.toString(16)
    return `${fidHex}${timestamp}`.toUpperCase()
}
