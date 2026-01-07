import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Generate unique referral code
export function generateReferralCode(fid: number): string {
    const timestamp = Date.now().toString(36)
    const fidHex = fid.toString(16)
    return `${fidHex}${timestamp}`.toUpperCase()
}

// Format XP display
export function formatXP(xp: number): string {
    if (xp >= 1000000) {
        return `${(xp / 1000000).toFixed(1)}M`
    }
    if (xp >= 1000) {
        return `${(xp / 1000).toFixed(1)}K`
    }
    return xp.toString()
}

// Format USD amounts
export function formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(amount)
}

// Calculate XP progress to next tier
export function calculateXPProgress(
    currentXP: number,
    nextTierXP: number
): number {
    if (currentXP >= nextTierXP) return 100
    return Math.round((currentXP / nextTierXP) * 100)
}

// Check if user can claim (24h cooldown)
export function canClaim(lastClaimTime: string): boolean {
    const lastClaim = new Date(lastClaimTime)
    const now = new Date()
    const timeDiff = now.getTime() - lastClaim.getTime()
    const hoursDiff = timeDiff / (1000 * 3600)
    return hoursDiff >= 24
}

// Get time until next claim
export function getTimeUntilNextClaim(lastClaimTime: string): string {
    const lastClaim = new Date(lastClaimTime)
    const nextClaim = new Date(lastClaim.getTime() + 24 * 60 * 60 * 1000)
    const now = new Date()

    if (now >= nextClaim) return 'Available now'

    const timeDiff = nextClaim.getTime() - now.getTime()
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Truncate address for display
export function truncateAddress(address: string, chars = 4): string {
    if (!isValidAddress(address)) return address
    return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`
}

// Generate share URL for referrals
export function generateShareURL(referralCode: string): string {
    const baseURL = process.env.NEXT_PUBLIC_APP_URL || 'https://twenty6ix.com'
    return `${baseURL}?ref=${referralCode}`
}

// Parse referral code from URL
export function parseReferralCode(url: string): string | null {
    try {
        const urlObj = new URL(url)
        return urlObj.searchParams.get('ref')
    } catch {
        return null
    }
}

// Debounce function for search/input
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

// Format relative time
export function formatRelativeTime(date: string): string {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000)
        return `${Math.floor(diffInSeconds / 86400)}d ago`

    return past.toLocaleDateString()
}
