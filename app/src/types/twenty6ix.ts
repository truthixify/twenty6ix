// Database Types
export interface Profile {
    fid: number // Primary Key - Farcaster ID
    wallet_address?: string
    xp_total: number
    total_spend_usd: number
    referral_code: string
    referred_by_fid?: number
    last_claim_time?: string // Added for daily claim tracking
    early_bird_claimed?: boolean // Added for Early Bird tracking
    silver_nft_count?: number // Added for NFT mint tracking
    gold_nft_count?: number // Added for NFT mint tracking
    platinum_nft_count?: number // Added for NFT mint tracking
    created_at: string
    updated_at: string
}

export interface Task {
    id: string
    title: string
    description: string
    xp_reward: number
    intent_url: string
    is_active: boolean
    created_at: string
}

export interface UserTask {
    id: string
    fid: number
    task_id: string
    completed_at?: string
    verified: boolean
}

export interface ClaimLog {
    id: string
    fid: number
    amount_usd: number
    xp_earned: number
    transaction_hash?: string
    claimed_at: string
}

export interface Donation {
    id: string
    fid: number
    amount_usd: number
    xp_earned: number
    transaction_hash: string
    donated_at: string
}

export interface NFTMint {
    id: string
    fid: number
    nft_type: NFTType
    contract_address: string
    token_id: string
    transaction_hash: string
    xp_bonus: number
    minted_at: string
}

// NFT Types
export type NFTType = 'early_bird' | 'silver' | 'gold' | 'platinum'

export interface NFTTier {
    type: NFTType
    name: string
    xp_requirement: number
    spend_requirement: number
    referral_requirement: number
    mint_price_usd: number
    xp_bonus: number
    contract_address?: string
    requires_previous_tier: boolean
    max_mints_per_user?: number // Added per PRD
    mint_limit_global?: number // Added per PRD
}

// XP System
export interface XPSource {
    type: 'daily_claim' | 'donation' | 'referral' | 'social_task' | 'nft_mint'
    amount: number
    multiplier?: number
}

// Leaderboard
export interface LeaderboardEntry {
    fid: number
    username?: string
    avatar_url?: string
    xp_total: number
    rank: number
    total_spend_usd: number
    referral_count: number
}

// Farcaster Types
export interface FarcasterUser {
    fid: number
    username: string
    display_name: string
    avatar_url: string
    bio?: string
    verified_addresses: {
        eth_addresses: string[]
        sol_addresses: string[]
    }
}

// App State
export interface AppState {
    user: Profile | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

// Transaction Types
export interface TransactionStatus {
    hash?: string
    status: 'pending' | 'confirmed' | 'failed'
    error?: string
}

// API Response Types
export interface ApiResponse<T> {
    data?: T
    error?: string
    success: boolean
}

// Component Props
export interface TabNavigationProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export interface XPDisplayProps {
    currentXP: number
    nextTierXP?: number
    showProgress?: boolean
}

export interface NFTCardProps {
    tier: NFTTier
    isEligible: boolean
    isOwned: boolean
    onMint: () => void
}

// Contract Types
export interface ContractAddresses {
    factory: `0x${string}`
    earlyBirdNFT?: `0x${string}`
    silverNFT?: `0x${string}`
    goldNFT?: `0x${string}`
    platinumNFT?: `0x${string}`
    payments?: `0x${string}`
}

export interface ContractConfig {
    addresses: ContractAddresses
    chainId: number
    treasury: `0x${string}`
    owner: `0x${string}`
}

// Smart Contract Function Types
export interface NFTTierConfig {
    mintPrice: bigint
    maxSupply: bigint
    currentSupply: bigint
    baseURI: string
    isActive: boolean
    requiredTier: number
    requiresPrevious: boolean
}

export interface UserStats {
    claims: bigint
    donations: bigint
    spent: bigint
    lastClaim: bigint
}

export interface ContractTransaction {
    hash: `0x${string}`
    status: 'pending' | 'success' | 'error'
    type: 'mint' | 'claim' | 'donate'
    amount?: bigint
    tier?: NFTType
}

// Contract Event Types
export interface ContractEvent {
    eventName: string
    args: Record<string, any>
    blockNumber: bigint
    transactionHash: `0x${string}`
    timestamp: number
}

export interface DailyClaimEvent extends ContractEvent {
    eventName: 'DailyClaim'
    args: {
        user: `0x${string}`
        amount: bigint
        timestamp: bigint
    }
}

export interface DonationEvent extends ContractEvent {
    eventName: 'Donation'
    args: {
        user: `0x${string}`
        amount: bigint
        timestamp: bigint
    }
}

export interface TierMintedEvent extends ContractEvent {
    eventName: 'TierMinted'
    args: {
        user: `0x${string}`
        tier: number
        tokenId: bigint
        price: bigint
    }
}
