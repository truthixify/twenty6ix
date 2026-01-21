import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { contractService } from '../lib/contractService'
import type { 
  NFTType, 
  NFTTierConfig, 
  UserStats, 
  ContractAddresses 
} from '../types/twenty6ix'
import type { Hash, Address } from 'viem'

export function useContract() {
  const { address, isConnected } = useAccount()
  const [contractAddresses, setContractAddresses] = useState<ContractAddresses>()

  // Update contract addresses
  const updateAddresses = useCallback(async () => {
    await contractService.updateContractAddresses()
    setContractAddresses(contractService.getContractAddresses())
  }, [])

  useEffect(() => {
    updateAddresses()
  }, [updateAddresses])

  // Factory methods
  const deployEcosystem = useCallback(async (): Promise<Hash | null> => {
    if (!isConnected || !address) return null
    try {
      const hash = await contractService.deployEcosystemContracts()
      await updateAddresses() // Refresh addresses after deployment
      return hash
    } catch (error) {
      console.error('Deploy ecosystem failed:', error)
      throw error
    }
  }, [isConnected, address, updateAddresses])

  // NFT methods
  const mintNFT = useCallback(async (tier: NFTType): Promise<Hash | null> => {
    if (!isConnected || !address) return null
    try {
      return await contractService.mintNFT(tier)
    } catch (error) {
      console.error('Mint NFT failed:', error)
      throw error
    }
  }, [isConnected, address])

  const batchMintNFTs = useCallback(async (tiers: NFTType[]): Promise<Hash | null> => {
    if (!isConnected || !address) return null
    try {
      return await contractService.batchMintNFTs(tiers)
    } catch (error) {
      console.error('Batch mint NFTs failed:', error)
      throw error
    }
  }, [isConnected, address])

  const checkOwnsTier = useCallback(async (tier: NFTType, userAddress?: Address): Promise<boolean> => {
    try {
      return await contractService.checkUserOwnsTier(tier, userAddress)
    } catch (error) {
      console.error('Check owns tier failed:', error)
      return false
    }
  }, [])

  const getOwnedTiers = useCallback(async (userAddress?: Address): Promise<NFTType[]> => {
    try {
      return await contractService.getUserOwnedTiers(userAddress)
    } catch (error) {
      console.error('Get owned tiers failed:', error)
      return []
    }
  }, [])

  const getTierConfig = useCallback(async (tier: NFTType): Promise<NFTTierConfig | null> => {
    try {
      return await contractService.getTierConfig(tier)
    } catch (error) {
      console.error('Get tier config failed:', error)
      return null
    }
  }, [])

  // Payment methods
  const dailyClaim = useCallback(async (): Promise<Hash | null> => {
    if (!isConnected || !address) return null
    try {
      return await contractService.dailyClaim()
    } catch (error) {
      console.error('Daily claim failed:', error)
      throw error
    }
  }, [isConnected, address])

  const donate = useCallback(async (amount: bigint): Promise<Hash | null> => {
    if (!isConnected || !address) return null
    try {
      return await contractService.donate(amount)
    } catch (error) {
      console.error('Donation failed:', error)
      throw error
    }
  }, [isConnected, address])

  const canClaim = useCallback(async (userAddress?: Address): Promise<boolean> => {
    try {
      return await contractService.canUserClaim(userAddress)
    } catch (error) {
      console.error('Can claim check failed:', error)
      return false
    }
  }, [])

  const getTimeUntilNextClaim = useCallback(async (userAddress?: Address): Promise<bigint> => {
    try {
      return await contractService.getTimeUntilNextClaim(userAddress)
    } catch (error) {
      console.error('Get time until next claim failed:', error)
      return 0n
    }
  }, [])

  const getUserStats = useCallback(async (userAddress?: Address): Promise<UserStats | null> => {
    try {
      return await contractService.getUserStats(userAddress)
    } catch (error) {
      console.error('Get user stats failed:', error)
      return null
    }
  }, [])

  const getDailyClaimPrice = useCallback(async (): Promise<bigint> => {
    try {
      return await contractService.getDailyClaimPrice()
    } catch (error) {
      console.error('Get daily claim price failed:', error)
      return contractService.parseEther('0.0001')
    }
  }, [])

  const getMinDonation = useCallback(async (): Promise<bigint> => {
    try {
      return await contractService.getMinDonation()
    } catch (error) {
      console.error('Get min donation failed:', error)
      return contractService.parseEther('0.001')
    }
  }, [])

  // Transaction utilities
  const waitForTransaction = useCallback(async (hash: Hash): Promise<boolean> => {
    return await contractService.waitForTransaction(hash)
  }, [])

  const formatEther = useCallback((value: bigint): string => {
    return contractService.formatEther(value)
  }, [])

  const parseEther = useCallback((value: string): bigint => {
    return contractService.parseEther(value)
  }, [])

  return {
    // State
    isConnected,
    address,
    contractAddresses,
    
    // Factory methods
    deployEcosystem,
    updateAddresses,
    
    // NFT methods
    mintNFT,
    batchMintNFTs,
    checkOwnsTier,
    getOwnedTiers,
    getTierConfig,
    
    // Payment methods
    dailyClaim,
    donate,
    canClaim,
    getTimeUntilNextClaim,
    getUserStats,
    getDailyClaimPrice,
    getMinDonation,
    
    // Utilities
    waitForTransaction,
    formatEther,
    parseEther,
  }
}

// Hook for specific NFT tier operations
export function useNFTTier(tier: NFTType) {
  const contract = useContract()
  const [config, setConfig] = useState<NFTTierConfig | null>(null)
  const [isOwned, setIsOwned] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadTierData = useCallback(async () => {
    setLoading(true)
    try {
      const [tierConfig, owned] = await Promise.all([
        contract.getTierConfig(tier),
        contract.checkOwnsTier(tier)
      ])
      setConfig(tierConfig)
      setIsOwned(owned)
    } catch (error) {
      console.error(`Failed to load ${tier} tier data:`, error)
    } finally {
      setLoading(false)
    }
  }, [contract, tier])

  useEffect(() => {
    if (contract.isConnected) {
      loadTierData()
    }
  }, [contract.isConnected, loadTierData])

  const mint = useCallback(async () => {
    const hash = await contract.mintNFT(tier)
    if (hash) {
      await contract.waitForTransaction(hash)
      await loadTierData() // Refresh data after mint
    }
    return hash
  }, [contract, tier, loadTierData])

  return {
    config,
    isOwned,
    loading,
    mint,
    refresh: loadTierData,
    ...contract
  }
}

// Hook for payment operations
export function usePayments() {
  const contract = useContract()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [canClaimNow, setCanClaimNow] = useState(false)
  const [timeUntilClaim, setTimeUntilClaim] = useState<bigint>(0n)
  const [dailyPrice, setDailyPrice] = useState<bigint>(0n)
  const [minDonationAmount, setMinDonationAmount] = useState<bigint>(0n)
  const [loading, setLoading] = useState(true)

  const loadPaymentData = useCallback(async () => {
    setLoading(true)
    try {
      const [userStats, canClaim, timeUntil, price, minDonation] = await Promise.all([
        contract.getUserStats(),
        contract.canClaim(),
        contract.getTimeUntilNextClaim(),
        contract.getDailyClaimPrice(),
        contract.getMinDonation()
      ])
      
      setStats(userStats)
      setCanClaimNow(canClaim)
      setTimeUntilClaim(timeUntil)
      setDailyPrice(price)
      setMinDonationAmount(minDonation)
    } catch (error) {
      console.error('Failed to load payment data:', error)
    } finally {
      setLoading(false)
    }
  }, [contract])

  useEffect(() => {
    if (contract.isConnected) {
      loadPaymentData()
    }
  }, [contract.isConnected, loadPaymentData])

  const claim = useCallback(async () => {
    const hash = await contract.dailyClaim()
    if (hash) {
      await contract.waitForTransaction(hash)
      await loadPaymentData() // Refresh data after claim
    }
    return hash
  }, [contract, loadPaymentData])

  const makeDonation = useCallback(async (amount: bigint) => {
    const hash = await contract.donate(amount)
    if (hash) {
      await contract.waitForTransaction(hash)
      await loadPaymentData() // Refresh data after donation
    }
    return hash
  }, [contract, loadPaymentData])

  return {
    stats,
    canClaimNow,
    timeUntilClaim,
    dailyPrice,
    minDonationAmount,
    loading,
    claim,
    makeDonation,
    refresh: loadPaymentData,
    // Spread contract methods but exclude the donate method to avoid conflict
    isConnected: contract.isConnected,
    address: contract.address,
    contractAddresses: contract.contractAddresses,
    deployEcosystem: contract.deployEcosystem,
    updateAddresses: contract.updateAddresses,
    mintNFT: contract.mintNFT,
    batchMintNFTs: contract.batchMintNFTs,
    checkOwnsTier: contract.checkOwnsTier,
    getOwnedTiers: contract.getOwnedTiers,
    getTierConfig: contract.getTierConfig,
    dailyClaim: contract.dailyClaim,
    canClaim: contract.canClaim,
    getTimeUntilNextClaim: contract.getTimeUntilNextClaim,
    getUserStats: contract.getUserStats,
    getDailyClaimPrice: contract.getDailyClaimPrice,
    getMinDonation: contract.getMinDonation,
    waitForTransaction: contract.waitForTransaction,
    formatEther: contract.formatEther,
    parseEther: contract.parseEther,
  }
}