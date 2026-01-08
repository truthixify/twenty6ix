import { useState, useEffect, useCallback } from 'react'
import { useWalletClient, useAccount, usePublicClient } from 'wagmi'
import { contractService, type ContractService } from '@/lib/contracts'
import type { 
  ContractAddresses, 
  NFTTierConfig, 
  UserStats, 
  ContractTransaction,
  NFTType 
} from '@/types'

export function useContracts() {
  const { data: walletClient } = useWalletClient()
  const { address } = useAccount()
  const publicClient = usePublicClient()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deployedAddresses, setDeployedAddresses] = useState<ContractAddresses | null>(null)

  // Update wallet client when it changes
  useEffect(() => {
    if (walletClient) {
      contractService.setWalletClient(walletClient)
    }
  }, [walletClient])

  // Load deployed contract addresses
  const loadDeployedAddresses = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const addresses = await contractService.getDeployedContracts()
      setDeployedAddresses(addresses)
      contractService.updateAddresses(addresses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contract addresses')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Deploy ecosystem contracts
  const deployEcosystem = useCallback(async (): Promise<ContractTransaction | null> => {
    if (!walletClient) {
      setError('Wallet not connected')
      return null
    }

    try {
      setIsLoading(true)
      setError(null)
      const transaction = await contractService.deployEcosystem()
      
      // Reload addresses after deployment
      setTimeout(() => {
        loadDeployedAddresses()
      }, 5000) // Wait for transaction to be mined
      
      return transaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy ecosystem')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, loadDeployedAddresses])

  return {
    // State
    isLoading,
    error,
    deployedAddresses,
    isConnected: !!address,
    
    // Actions
    loadDeployedAddresses,
    deployEcosystem,
    
    // Contract service instance
    contractService
  }
}

export function useNFTContract(nftAddress?: `0x${string}`) {
  const { contractService } = useContracts()
  const { address } = useAccount()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get tier configuration
  const getTierConfig = useCallback(async (tier: number): Promise<NFTTierConfig | null> => {
    if (!nftAddress) return null
    
    try {
      setIsLoading(true)
      setError(null)
      return await contractService.getTierConfig(nftAddress, tier)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get tier config')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [nftAddress, contractService])

  // Get owned tiers
  const getOwnedTiers = useCallback(async (): Promise<number[]> => {
    if (!nftAddress || !address) return []
    
    try {
      setIsLoading(true)
      setError(null)
      return await contractService.getOwnedTiers(nftAddress, address)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get owned tiers')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [nftAddress, address, contractService])

  // Mint NFT
  const mintNFT = useCallback(async (tier: number, mintPrice: bigint): Promise<ContractTransaction | null> => {
    if (!nftAddress) return null
    
    try {
      setIsLoading(true)
      setError(null)
      return await contractService.mintNFT(nftAddress, tier, mintPrice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mint NFT')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [nftAddress, contractService])

  // Batch mint NFTs
  const batchMintNFTs = useCallback(async (tiers: number[], totalPrice: bigint): Promise<ContractTransaction | null> => {
    if (!nftAddress) return null
    
    try {
      setIsLoading(true)
      setError(null)
      return await contractService.batchMintNFTs(nftAddress, tiers, totalPrice)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to batch mint NFTs')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [nftAddress, contractService])

  return {
    isLoading,
    error,
    getTierConfig,
    getOwnedTiers,
    mintNFT,
    batchMintNFTs
  }
}

export function usePaymentsContract(paymentsAddress?: `0x${string}`) {
  const { contractService } = useContracts()
  const { address } = useAccount()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [canClaim, setCanClaim] = useState(false)
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState<bigint>(0n)

  // Load user stats
  const loadUserStats = useCallback(async () => {
    if (!paymentsAddress || !address) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const [stats, claimEligible, timeUntilClaim] = await Promise.all([
        contractService.getUserStats(paymentsAddress, address),
        contractService.canClaim(paymentsAddress, address),
        contractService.timeUntilNextClaim(paymentsAddress, address)
      ])
      
      setUserStats(stats)
      setCanClaim(claimEligible)
      setTimeUntilNextClaim(timeUntilClaim)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user stats')
    } finally {
      setIsLoading(false)
    }
  }, [paymentsAddress, address, contractService])

  // Get pricing info
  const getPricingInfo = useCallback(async () => {
    if (!paymentsAddress) return { dailyClaimPrice: 0n, minDonation: 0n }
    
    try {
      const [dailyClaimPrice, minDonation] = await Promise.all([
        contractService.getDailyClaimPrice(paymentsAddress),
        contractService.getMinDonation(paymentsAddress)
      ])
      
      return { dailyClaimPrice, minDonation }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get pricing info')
      return { dailyClaimPrice: 0n, minDonation: 0n }
    }
  }, [paymentsAddress, contractService])

  // Make daily claim
  const makeDailyClaim = useCallback(async (claimPrice: bigint): Promise<ContractTransaction | null> => {
    if (!paymentsAddress) return null
    
    try {
      setIsLoading(true)
      setError(null)
      const transaction = await contractService.makeDailyClaim(paymentsAddress, claimPrice)
      
      // Reload stats after claim
      setTimeout(() => {
        loadUserStats()
      }, 3000)
      
      return transaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make daily claim')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [paymentsAddress, contractService, loadUserStats])

  // Make donation
  const makeDonation = useCallback(async (amount: bigint): Promise<ContractTransaction | null> => {
    if (!paymentsAddress) return null
    
    try {
      setIsLoading(true)
      setError(null)
      const transaction = await contractService.makeDonation(paymentsAddress, amount)
      
      // Reload stats after donation
      setTimeout(() => {
        loadUserStats()
      }, 3000)
      
      return transaction
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make donation')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [paymentsAddress, contractService, loadUserStats])

  // Load stats on mount and address change
  useEffect(() => {
    loadUserStats()
  }, [loadUserStats])

  return {
    isLoading,
    error,
    userStats,
    canClaim,
    timeUntilNextClaim,
    loadUserStats,
    getPricingInfo,
    makeDailyClaim,
    makeDonation
  }
}