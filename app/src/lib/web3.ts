import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { coinbaseWallet } from 'wagmi/connectors'

// Base network configuration
export const baseConfig = createConfig({
    chains: [base],
    connectors: [
        coinbaseWallet({
            appName: 'TWENTY6IX',
            appLogoUrl: '/logo.png',
        }),
    ],
    transports: {
        [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL),
    },
})

// Contract addresses (to be updated after deployment)
export const CONTRACTS = {
    EARLY_BIRD_NFT: process.env
        .NEXT_PUBLIC_EARLY_BIRD_NFT_CONTRACT as `0x${string}`,
    SILVER_NFT: process.env.NEXT_PUBLIC_SILVER_NFT_CONTRACT as `0x${string}`,
    GOLD_NFT: process.env.NEXT_PUBLIC_GOLD_NFT_CONTRACT as `0x${string}`,
    PLATINUM_NFT: process.env
        .NEXT_PUBLIC_PLATINUM_NFT_CONTRACT as `0x${string}`,
} as const

// Owner wallet address
export const OWNER_WALLET = process.env
    .NEXT_PUBLIC_OWNER_WALLET as `0x${string}`

// Transaction fees (in USD) - Backend only, not shown to users
export const FEES = {
    DAILY_CLAIM: 0.14, // Updated per PRD
    EARLY_BIRD_MINT: 0.05, // Updated per PRD
    SILVER_MINT: 1.5, // Updated per PRD
    GOLD_MINT: 3.0, // Updated per PRD
    PLATINUM_MINT: 15.0, // Updated per PRD
} as const

// XP rewards - Updated per PRD
export const XP_REWARDS = {
    DAILY_CLAIM: 10,
    DONATION_PER_USD: 50,
    REFERRAL: 20,
    SOCIAL_TASK: 5,
    EARLY_BIRD_MINT: 100, // Updated per PRD
    SILVER_MINT: 600, // Updated per PRD (300 XP per mint, max 2 mints = 600 total)
    GOLD_MINT: 3200, // Updated per PRD (800 XP per mint, max 4 mints = 3200 total)
    PLATINUM_MINT: 3000, // Updated per PRD
} as const

// NFT tier requirements - Updated per PRD
export const NFT_TIERS = {
    early_bird: {
        type: 'early_bird' as const,
        name: 'Early Bird',
        xp_requirement: 0, // Free for first 3,000 users
        spend_requirement: 0,
        referral_requirement: 0,
        mint_price_usd: FEES.EARLY_BIRD_MINT,
        xp_bonus: XP_REWARDS.EARLY_BIRD_MINT,
        requires_previous_tier: false,
        max_mints_per_user: 1, // Added per PRD
        mint_limit_global: 3000, // Added per PRD
    },
    silver: {
        type: 'silver' as const,
        name: 'Silver',
        xp_requirement: 1000, // Updated per PRD
        spend_requirement: 0, // Removed spend requirement from UI
        referral_requirement: 0, // Removed referral requirement from UI
        mint_price_usd: FEES.SILVER_MINT,
        xp_bonus: 300, // XP per individual mint
        requires_previous_tier: false,
        max_mints_per_user: 2, // Added per PRD
    },
    gold: {
        type: 'gold' as const,
        name: 'Gold',
        xp_requirement: 3000, // Updated per PRD
        spend_requirement: 0, // Removed spend requirement from UI
        referral_requirement: 0, // Removed referral requirement from UI
        mint_price_usd: FEES.GOLD_MINT,
        xp_bonus: 800, // XP per individual mint
        requires_previous_tier: false, // Updated per PRD
        max_mints_per_user: 4, // Added per PRD
    },
    platinum: {
        type: 'platinum' as const,
        name: 'Platinum',
        xp_requirement: 10000, // Updated per PRD
        spend_requirement: 0, // Removed spend requirement from UI
        referral_requirement: 0, // Removed referral requirement from UI
        mint_price_usd: FEES.PLATINUM_MINT,
        xp_bonus: XP_REWARDS.PLATINUM_MINT,
        requires_previous_tier: false, // Updated per PRD
        max_mints_per_user: 1, // FCFS based
    },
} as const
