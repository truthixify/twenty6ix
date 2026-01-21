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

// Transaction fees (in USD)
export const FEES = {
    DAILY_CLAIM: 0.1,
    EARLY_BIRD_MINT: 1.0,
    SILVER_MINT: 1.5,
    GOLD_MINT: 5.0,
    PLATINUM_MINT: 15.0,
} as const

// XP rewards
export const XP_REWARDS = {
    DAILY_CLAIM: 10,
    DONATION_PER_USD: 50,
    REFERRAL: 20,
    SOCIAL_TASK: 5,
    EARLY_BIRD_MINT: 100,
    SILVER_MINT: 500,
    GOLD_MINT: 1500,
    PLATINUM_MINT: 3000,
} as const

// NFT tier requirements
export const NFT_TIERS = {
    early_bird: {
        type: 'early_bird' as const,
        name: 'Early Bird',
        xp_requirement: 0,
        spend_requirement: 0,
        referral_requirement: 0,
        mint_price_usd: FEES.EARLY_BIRD_MINT,
        xp_bonus: XP_REWARDS.EARLY_BIRD_MINT,
        requires_previous_tier: false,
    },
    silver: {
        type: 'silver' as const,
        name: 'Silver',
        xp_requirement: 1000,
        spend_requirement: 10,
        referral_requirement: 15,
        mint_price_usd: FEES.SILVER_MINT,
        xp_bonus: XP_REWARDS.SILVER_MINT,
        requires_previous_tier: false,
    },
    gold: {
        type: 'gold' as const,
        name: 'Gold',
        xp_requirement: 3000,
        spend_requirement: 30,
        referral_requirement: 15,
        mint_price_usd: FEES.GOLD_MINT,
        xp_bonus: XP_REWARDS.GOLD_MINT,
        requires_previous_tier: true,
    },
    platinum: {
        type: 'platinum' as const,
        name: 'Platinum',
        xp_requirement: 10000,
        spend_requirement: 100,
        referral_requirement: 15,
        mint_price_usd: FEES.PLATINUM_MINT,
        xp_bonus: XP_REWARDS.PLATINUM_MINT,
        requires_previous_tier: true,
    },
} as const
