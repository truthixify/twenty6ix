import { 
  parseEther, 
  formatEther,
  type Address,
  type Hash
} from 'viem'
import { 
  readContract,
  writeContract,
  waitForTransactionReceipt,
  getAccount
} from '@wagmi/core'
import { config } from '../components/providers/WagmiProvider'
import { 
  Twenty6ixFactoryABI, 
  Twenty6ixNFTABI, 
  Twenty6ixPaymentsABI 
} from '../contracts'
import type { 
  NFTType, 
  NFTTierConfig, 
  UserStats, 
  ContractAddresses 
} from '../types/twenty6ix'

// Contract addresses
export const CONTRACT_ADDRESSES: ContractAddresses = {
  factory: '0xBA9ABB3b3Ecf5E24935FD04ED574C5a6468dEA1e',
  // Deployed ecosystem contracts
  earlyBirdNFT: '0x2326460Ebf44958476A6166B05Ce0b64D687D8E9',
  silverNFT: '0x2C13d5fDDc2fE1ace4947e61736D344b9C361920',
  goldNFT: '0xbDe2e47ddD27fdE99DcE54dfF06f524bE6f49154',
  platinumNFT: '0xc1d354DD8584F154a250223CEF46DA196f421BcB',
  payments: '0x1a83921E50D57ed46120BdE51465aaAA6c3e755f',
}

// NFT Tier enum mapping
export const NFT_TIER_ENUM = {
  early_bird: 0,
  silver: 1,
  gold: 2,
  platinum: 3,
} as const

export class ContractService {
  // Factory Contract Methods
  async deployEcosystemContracts(): Promise<Hash> {
    const account = getAccount(config)
    if (!account.address) throw new Error('Wallet not connected')
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.factory,
      abi: Twenty6ixFactoryABI as any,
      functionName: 'deployContracts',
    })

    return hash
  }

  async getDeployedContracts(): Promise<Address[]> {
    const result = await readContract(config, {
      address: CONTRACT_ADDRESSES.factory,
      abi: Twenty6ixFactoryABI as any,
      functionName: 'getDeployedContracts',
    }) as Address[]

    return result
  }

  async updateContractAddresses() {
    try {
      const contracts = await this.getDeployedContracts()
      CONTRACT_ADDRESSES.earlyBirdNFT = contracts[0]
      CONTRACT_ADDRESSES.silverNFT = contracts[1]
      CONTRACT_ADDRESSES.goldNFT = contracts[2]
      CONTRACT_ADDRESSES.platinumNFT = contracts[3]
      CONTRACT_ADDRESSES.payments = contracts[4]
    } catch (error) {
      console.warn('Ecosystem contracts not deployed yet')
    }
  }

  // NFT Contract Methods
  async mintNFT(tier: NFTType): Promise<Hash> {
    const account = getAccount(config)
    if (!account.address) throw new Error('Wallet not connected')
    
    const contractAddress = this.getNFTContractAddress(tier)
    if (!contractAddress) throw new Error(`${tier} NFT contract not deployed`)

    const tierEnum = NFT_TIER_ENUM[tier]
    const tierConfig = await readContract(config, {
      address: contractAddress,
      abi: Twenty6ixNFTABI as any,
      functionName: 'getTierConfig',
      args: [tierEnum],
    }) as any
    
    const hash = await writeContract(config, {
      address: contractAddress,
      abi: Twenty6ixNFTABI as any,
      functionName: 'mint',
      args: [tierEnum],
      value: tierConfig.mintPrice as bigint,
    })

    return hash
  }

  async batchMintNFTs(tiers: NFTType[]): Promise<Hash> {
    const account = getAccount(config)
    if (!account.address) throw new Error('Wallet not connected')
    
    // For batch minting, we'll use the first tier's contract
    const contractAddress = this.getNFTContractAddress(tiers[0])
    if (!contractAddress) throw new Error(`${tiers[0]} NFT contract not deployed`)

    const tierEnums = tiers.map(tier => NFT_TIER_ENUM[tier])
    
    // Calculate total cost
    let totalCost = 0n
    for (const tier of tiers) {
      const tierEnum = NFT_TIER_ENUM[tier]
      const tierConfig = await readContract(config, {
        address: contractAddress,
        abi: Twenty6ixNFTABI as any,
        functionName: 'getTierConfig',
        args: [tierEnum],
      }) as any
      totalCost += tierConfig.mintPrice as bigint
    }

    const hash = await writeContract(config, {
      address: contractAddress,
      abi: Twenty6ixNFTABI as any,
      functionName: 'batchMint',
      args: [tierEnums],
      value: totalCost,
    })

    return hash
  }

  async checkUserOwnsTier(tier: NFTType, userAddress?: Address): Promise<boolean> {
    const account = getAccount(config)
    const address = userAddress || account.address
    if (!address) return false

    const contractAddress = this.getNFTContractAddress(tier)
    if (!contractAddress) return false

    const tierEnum = NFT_TIER_ENUM[tier]
    const result = await readContract(config, {
      address: contractAddress,
      abi: Twenty6ixNFTABI as any,
      functionName: 'ownsTier',
      args: [address, tierEnum],
    }) as boolean

    return result
  }

  async getUserOwnedTiers(userAddress?: Address): Promise<NFTType[]> {
    const account = getAccount(config)
    const address = userAddress || account.address
    if (!address) return []
    
    const ownedTiers: NFTType[] = []
    
    for (const [tier, contractAddress] of Object.entries({
      early_bird: CONTRACT_ADDRESSES.earlyBirdNFT,
      silver: CONTRACT_ADDRESSES.silverNFT,
      gold: CONTRACT_ADDRESSES.goldNFT,
      platinum: CONTRACT_ADDRESSES.platinumNFT,
    })) {
      if (!contractAddress) continue
      
      const tierEnum = NFT_TIER_ENUM[tier as NFTType]
      const owns = await readContract(config, {
        address: contractAddress,
        abi: Twenty6ixNFTABI as any,
        functionName: 'ownsTier',
        args: [address, tierEnum],
      }) as boolean
      
      if (owns) {
        ownedTiers.push(tier as NFTType)
      }
    }

    return ownedTiers
  }

  async getTierConfig(tier: NFTType): Promise<NFTTierConfig> {
    const contractAddress = this.getNFTContractAddress(tier)
    if (!contractAddress) throw new Error(`${tier} NFT contract not deployed`)

    const tierEnum = NFT_TIER_ENUM[tier]
    const config_result = await readContract(config, {
      address: contractAddress,
      abi: Twenty6ixNFTABI as any,
      functionName: 'getTierConfig',
      args: [tierEnum],
    }) as any
    
    return {
      mintPrice: config_result.mintPrice as bigint,
      maxSupply: config_result.maxSupply as bigint,
      currentSupply: config_result.currentSupply as bigint,
      baseURI: config_result.baseURI as string,
      isActive: config_result.isActive as boolean,
      requiredTier: config_result.requiredTier as number,
      requiresPrevious: config_result.requiresPrevious as boolean
    }
  }

  // Payments Contract Methods
  async dailyClaim(): Promise<Hash> {
    const account = getAccount(config)
    if (!account.address) throw new Error('Wallet not connected')
    
    if (!CONTRACT_ADDRESSES.payments) throw new Error('Payments contract not deployed')

    const dailyClaimPrice = await readContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'dailyClaimPrice',
    }) as bigint
    
    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'dailyClaim',
      value: dailyClaimPrice,
    })

    return hash
  }

  async donate(amount: bigint): Promise<Hash> {
    const account = getAccount(config)
    if (!account.address) throw new Error('Wallet not connected')
    
    if (!CONTRACT_ADDRESSES.payments) throw new Error('Payments contract not deployed')

    const hash = await writeContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'donate',
      value: amount,
    })

    return hash
  }

  async canUserClaim(userAddress?: Address): Promise<boolean> {
    const account = getAccount(config)
    const address = userAddress || account.address
    if (!address) return false
    
    if (!CONTRACT_ADDRESSES.payments) return false

    const result = await readContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'canClaim',
      args: [address],
    }) as boolean

    return result
  }

  async getTimeUntilNextClaim(userAddress?: Address): Promise<bigint> {
    const account = getAccount(config)
    const address = userAddress || account.address
    if (!address) return 0n
    
    if (!CONTRACT_ADDRESSES.payments) return 0n

    const result = await readContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'timeUntilNextClaim',
      args: [address],
    }) as bigint

    return result
  }

  async getUserStats(userAddress?: Address): Promise<UserStats> {
    const account = getAccount(config)
    const address = userAddress || account.address
    if (!address) {
      return { claims: 0n, donations: 0n, spent: 0n, lastClaim: 0n }
    }
    
    if (!CONTRACT_ADDRESSES.payments) {
      return { claims: 0n, donations: 0n, spent: 0n, lastClaim: 0n }
    }

    const stats = await readContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'getUserStats',
      args: [address],
    }) as any
    
    return {
      claims: stats[0] as bigint,
      donations: stats[1] as bigint,
      spent: stats[2] as bigint,
      lastClaim: stats[3] as bigint
    }
  }

  async getDailyClaimPrice(): Promise<bigint> {
    if (!CONTRACT_ADDRESSES.payments) return parseEther('0.0001')

    const result = await readContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'dailyClaimPrice',
    }) as bigint

    return result
  }

  async getMinDonation(): Promise<bigint> {
    if (!CONTRACT_ADDRESSES.payments) return parseEther('0.001')

    const result = await readContract(config, {
      address: CONTRACT_ADDRESSES.payments,
      abi: Twenty6ixPaymentsABI as any,
      functionName: 'minDonation',
    }) as bigint

    return result
  }

  // Utility Methods
  private getNFTContractAddress(tier: NFTType): Address | undefined {
    switch (tier) {
      case 'early_bird':
        return CONTRACT_ADDRESSES.earlyBirdNFT
      case 'silver':
        return CONTRACT_ADDRESSES.silverNFT
      case 'gold':
        return CONTRACT_ADDRESSES.goldNFT
      case 'platinum':
        return CONTRACT_ADDRESSES.platinumNFT
      default:
        return undefined
    }
  }

  // Transaction helpers
  async waitForTransaction(hash: Hash): Promise<boolean> {
    try {
      const receipt = await waitForTransactionReceipt(config, { hash })
      return receipt.status === 'success'
    } catch (error) {
      console.error('Transaction failed:', error)
      return false
    }
  }

  // Format utilities
  formatEther(value: bigint): string {
    return formatEther(value)
  }

  parseEther(value: string): bigint {
    return parseEther(value)
  }

  // Get current contract addresses
  getContractAddresses(): ContractAddresses {
    return { ...CONTRACT_ADDRESSES }
  }
}

// Export singleton instance
export const contractService = new ContractService()