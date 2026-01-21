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

// Contract addresses
export const CONTRACTS = {
    FACTORY: '0xBA9ABB3b3Ecf5E24935FD04ED574C5a6468dEA1e' as `0x${string}`,
    EARLY_BIRD_NFT: '0x2326460Ebf44958476A6166B05Ce0b64D687D8E9' as `0x${string}`,
    SILVER_NFT: '0x2C13d5fDDc2fE1ace4947e61736D344b9C361920' as `0x${string}`,
    GOLD_NFT: '0xbDe2e47ddD27fdE99DcE54dfF06f524bE6f49154' as `0x${string}`,
    PLATINUM_NFT: '0xc1d354DD8584F154a250223CEF46DA196f421BcB' as `0x${string}`,
    PAYMENTS: '0x1a83921E50D57ed46120BdE51465aaAA6c3e755f' as `0x${string}`,
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
