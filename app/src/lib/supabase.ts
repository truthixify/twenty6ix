import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

// Database table names
export const TABLES = {
    PROFILES: 'profiles',
    TASKS: 'tasks',
    USER_TASKS: 'user_tasks',
    CLAIMS_LOG: 'claims_log',
    DONATIONS: 'donations',
    NFT_MINTS: 'nft_mints',
} as const

// Database functions
export const DB_FUNCTIONS = {
    PROCESS_REFERRAL: 'process_referral',
    UPDATE_XP: 'update_xp',
    CHECK_NFT_ELIGIBILITY: 'check_nft_eligibility',
    GET_LEADERBOARD: 'get_leaderboard',
} as const
