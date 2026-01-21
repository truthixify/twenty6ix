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
    signInWithFarcaster: (userData: { fid: number; username?: string; pfpUrl?: string; bio?: string }) => Promise<void>
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

    // Initialize with proper authentication check
    useEffect(() => {
        // Don't auto-create mock user anymore - wait for proper authentication
        dispatch({ type: 'SET_LOADING', payload: false })
    }, [])

    // Sign in with Farcaster using Auth Kit
    const signInWithFarcaster = async (userData: { fid: number; username?: string; pfpUrl?: string; bio?: string }) => {
        try {
            console.log('📝 AppContext signInWithFarcaster called with:', userData)
            dispatch({ type: 'SET_LOADING', payload: true })

            const { fid, username } = userData
            const isOfflineMode = process.env.NEXT_PUBLIC_OFFLINE_MODE === 'true'

            // For demo mode or offline mode, skip database operations
            if (fid === 123456 || isOfflineMode) {
                console.log('🎯 Creating offline user profile (demo or offline mode)')
                const mockUser: Profile = {
                    fid,
                    wallet_address: fid === 123456 ? '0x1234567890123456789012345678901234567890' : undefined,
                    xp_total: fid === 123456 ? 1250 : 100,
                    total_spend_usd: fid === 123456 ? 15.50 : 0,
                    referral_code: generateReferralCode(fid),
                    last_claim_time: undefined, // Initialize claim tracking
                    early_bird_claimed: false, // Initialize Early Bird tracking
                    silver_nft_count: 0, // Initialize NFT mint tracking
                    gold_nft_count: 0,
                    platinum_nft_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
                dispatch({ type: 'SET_USER', payload: mockUser })
                console.log('✅ Offline user profile created successfully:', mockUser)
                return
            }

            // Try database operations with fallback (only if not in offline mode)
            try {
                console.log('🔍 Checking if user exists in database...')
                console.log('🔧 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
                console.log('🔧 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing')
                
                // Check if user exists in database
                const { data: existingUser, error: fetchError } = await supabase
                    .from(TABLES.PROFILES)
                    .select('*')
                    .eq('fid', fid)
                    .single()

                if (fetchError && fetchError.code !== 'PGRST116') {
                    console.error('❌ Database fetch error:', fetchError)
                    throw fetchError
                }

                let user: Profile

                if (existingUser) {
                    console.log('👤 Existing user found, updating...')
                    // Update existing user
                    const updates: Partial<Profile> = {
                        updated_at: new Date().toISOString(),
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
                    console.log('👤 Creating new user...')
                    // Create new user
                    const newUser: Omit<Profile, 'created_at' | 'updated_at'> = {
                        fid,
                        wallet_address: undefined, // Will be set when user connects wallet
                        xp_total: 0,
                        total_spend_usd: 0,
                        referral_code: generateReferralCode(fid),
                        last_claim_time: undefined, // Initialize claim tracking
                        early_bird_claimed: false, // Initialize Early Bird tracking
                        silver_nft_count: 0, // Initialize NFT mint tracking
                        gold_nft_count: 0,
                        platinum_nft_count: 0,
                    }

                    const { data: createdUser, error: createError } = await supabase
                        .from(TABLES.PROFILES)
                        .insert(newUser)
                        .select()
                        .single()

                    if (createError) throw createError
                    user = createdUser
                }

                console.log('✅ User authenticated successfully:', user)
                dispatch({ type: 'SET_USER', payload: user })

            } catch (dbError) {
                console.warn('⚠️ Database unavailable, creating temporary user profile:', dbError)
                
                // Fallback: Create a temporary user profile without database
                const tempUser: Profile = {
                    fid,
                    wallet_address: undefined,
                    xp_total: 100, // Give some starting XP
                    total_spend_usd: 0,
                    referral_code: generateReferralCode(fid),
                    last_claim_time: undefined, // Initialize claim tracking
                    early_bird_claimed: false, // Initialize Early Bird tracking
                    silver_nft_count: 0, // Initialize NFT mint tracking
                    gold_nft_count: 0,
                    platinum_nft_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                }
                
                console.log('✅ Temporary user profile created (offline mode):', tempUser)
                dispatch({ type: 'SET_USER', payload: tempUser })
                
                // Show a notification that we're in offline mode
                console.info('🔄 Running in offline mode - data will not be saved to database')
            }

        } catch (error) {
            console.error('❌ Sign in error:', error)
            dispatch({ type: 'SET_ERROR', payload: 'Failed to sign in with Farcaster' })
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

    // Auto-authenticate if in Mini App and user is available (DISABLED - bypassing auth)
    // useEffect(() => {
    //     const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
        
    //     if (isDemoMode) {
    //         // In demo mode, skip Mini App checks and set ready immediately
    //         dispatch({ type: 'SET_LOADING', payload: false })
    //     } else if (miniApp.isMiniApp && miniApp.user && !state.isAuthenticated) {
    //         signInWithFarcaster()
    //     } else if (!miniApp.isMiniApp && miniApp.isReady) {
    //         // For web, set loading to false when ready
    //         dispatch({ type: 'SET_LOADING', payload: false })
    //     }
    // }, [
    //     miniApp.isMiniApp,
    //     miniApp.user,
    //     miniApp.isReady,
    //     state.isAuthenticated,
    // ])

    // Provide a mock user for development/testing when authentication is bypassed (DISABLED - moved to initialization)
    // useEffect(() => {
    //     if (!state.user && !state.isLoading) {
    //         const mockUser: Profile = {
    //             fid: 123456,
    //             wallet_address: '0x1234567890123456789012345678901234567890',
    //             xp_total: 1250,
    //             total_spend_usd: 15.50,
    //             referral_code: 'DEMO123456',
    //             created_at: new Date().toISOString(),
    //             updated_at: new Date().toISOString(),
    //         }
    //         dispatch({ type: 'SET_USER', payload: mockUser })
    //     }
    // }, [state.user, state.isLoading])

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
