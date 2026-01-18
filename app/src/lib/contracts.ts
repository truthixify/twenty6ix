import { 
  createPublicClient, 
  createWalletClient, 
  http, 
  parseEther, 
  formatEther,
  getContract,
  type PublicClient,
  type WalletClient,
  type Address
} from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { 
  Twenty6ixFactoryABI, 
  Twenty6ixNFTABI, 
  Twenty6ixPaymentsABI 
} from '~/contracts'
import type { 
  ContractAddresses, 
  ContractConfig, 
  NFTTierConfig, 
  UserStats,
  ContractTransaction,
  NFTType
} from '~/types/twenty6ix'

// Chain configuration
const CHAIN = process.env.NODE_ENV === 'production' ? base : baseSepolia
const RPC_URL = process.env.NODE_ENV === 'production' 
  ? 'https://mainnet.base.org'
  : 'https://sepolia.base.org'

// Contract addresses - these should be set from environment or deployment
const DEFAULT_ADDRESSES: ContractAddresses = {
  factory: process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000',
}

class ContractServiceClass {
  private publicClient: PublicClient
  private walletClient?: WalletClient
  private config: ContractConfig

  constructor(walletClient?: WalletClient) {
    this.publicClient = createPublicClient({
      chain: CHAIN,
      transport: http(RPC_URL)
    })
    
    this.walletClient = walletClient
    
    this.config = {
      addresses: DEFAULT_ADDRESSES,
      chainId: CHAIN.id,
      treasury: process.env.NEXT_PUBLIC_TREASURY_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000',
      owner: process.env.NEXT_PUBLIC_OWNER_ADDRESS as `0x${string}` || '0x0000000000000000000000000000000000000000'
    }
  }

  // Update wallet client for transactions
  setWalletClient(walletClient: WalletClient) {
    this.walletClient = walletClient
  }

  // Get contract instances
  private getFactoryContract() {
    if (this.walletClient) {
      return getContract({
        address: this.config.addresses.factory,
        abi: Twenty6ixFactoryABI,
        client: { public: this.publicClient, wallet: this.walletClient }
      })
    }
    return getContract({
      address: this.config.addresses.factory,
      abi: Twenty6ixFactoryABI,
      client: this.publicClient
    })
  }

  private getNFTContract(address: Address) {
    if (this.walletClient) {
      return getContract({
        address,
        abi: Twenty6ixNFTABI,
        client: { public: this.publicClient, wallet: this.walletClient }
      })
    }
    return getContract({
      address,
      abi: Twenty6ixNFTABI,
      client: this.publicClient
    })
  }

  private getPaymentsContract(address: Address) {
    if (this.walletClient) {
      return getContract({
        address,
        abi: Twenty6ixPaymentsABI,
        client: { public: this.publicClient, wallet: this.walletClient }
      })
    }
    return getContract({
      address,
      abi: Twenty6ixPaymentsABI,
      client: this.publicClient
    })
  }

  // Factory Contract Methods
  async getDeployedContracts(): Promise<ContractAddresses> {
    try {
      const factory = this.getFactoryContract()
      const addresses = await factory.read.getDeployedContracts() as readonly [Address, Address, Address, Address, Address]
      
      return {
        factory: this.config.addresses.factory,
        earlyBirdNFT: addresses[0],
        silverNFT: addresses[1],
        goldNFT: addresses[2],
        platinumNFT: addresses[3],
        payments: addresses[4]
      }
    } catch (error) {
      console.error('Error getting deployed contracts:', error)
      throw error
    }
  }

  async deployEcosystem(): Promise<ContractTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for transactions')
    }

    try {
      const factory = this.getFactoryContract()
      const hash = await (factory as any).write.deployContracts() as `0x${string}`
      
      return {
        hash,
        status: 'pending',
        type: 'mint'
      }
    } catch (error) {
      console.error('Error deploying ecosystem:', error)
      throw error
    }
  }

  // NFT Contract Methods
  async getTierConfig(nftAddress: Address, tier: number): Promise<NFTTierConfig> {
    try {
      const nft = this.getNFTContract(nftAddress)
      const config = await nft.read.getTierConfig([tier]) as readonly [bigint, bigint, bigint, string, boolean, number, boolean]
      
      return {
        mintPrice: config[0],
        maxSupply: config[1],
        currentSupply: config[2],
        baseURI: config[3],
        isActive: config[4],
        requiredTier: config[5],
        requiresPrevious: config[6]
      }
    } catch (error) {
      console.error('Error getting tier config:', error)
      throw error
    }
  }

  async getOwnedTiers(nftAddress: Address, userAddress: Address): Promise<number[]> {
    try {
      const nft = this.getNFTContract(nftAddress)
      const tiers = await nft.read.getOwnedTiers([userAddress]) as readonly number[]
      return Array.from(tiers)
    } catch (error) {
      console.error('Error getting owned tiers:', error)
      throw error
    }
  }

  async mintNFT(nftAddress: Address, tier: number, mintPrice: bigint): Promise<ContractTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for transactions')
    }

    try {
      const nft = this.getNFTContract(nftAddress)
      const hash = await (nft as any).write.mint([tier], { value: mintPrice }) as `0x${string}`
      
      return {
        hash,
        status: 'pending',
        type: 'mint',
        amount: mintPrice,
        tier: this.getTierName(tier)
      }
    } catch (error) {
      console.error('Error minting NFT:', error)
      throw error
    }
  }

  async batchMintNFTs(nftAddress: Address, tiers: number[], totalPrice: bigint): Promise<ContractTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for transactions')
    }

    try {
      const nft = this.getNFTContract(nftAddress)
      const hash = await (nft as any).write.batchMint([tiers], { value: totalPrice }) as `0x${string}`
      
      return {
        hash,
        status: 'pending',
        type: 'mint',
        amount: totalPrice
      }
    } catch (error) {
      console.error('Error batch minting NFTs:', error)
      throw error
    }
  }

  // Payments Contract Methods
  async getUserStats(paymentsAddress: Address, userAddress: Address): Promise<UserStats> {
    try {
      const payments = this.getPaymentsContract(paymentsAddress)
      const stats = await payments.read.getUserStats([userAddress]) as readonly [bigint, bigint, bigint, bigint]
      
      return {
        claims: stats[0],
        donations: stats[1],
        spent: stats[2],
        lastClaim: stats[3]
      }
    } catch (error) {
      console.error('Error getting user stats:', error)
      throw error
    }
  }

  async canClaim(paymentsAddress: Address, userAddress: Address): Promise<boolean> {
    try {
      const payments = this.getPaymentsContract(paymentsAddress)
      return await payments.read.canClaim([userAddress]) as boolean
    } catch (error) {
      console.error('Error checking claim eligibility:', error)
      return false
    }
  }

  async timeUntilNextClaim(paymentsAddress: Address, userAddress: Address): Promise<bigint> {
    try {
      const payments = this.getPaymentsContract(paymentsAddress)
      return await payments.read.timeUntilNextClaim([userAddress]) as bigint
    } catch (error) {
      console.error('Error getting time until next claim:', error)
      return 0n
    }
  }

  async getDailyClaimPrice(paymentsAddress: Address): Promise<bigint> {
    try {
      const payments = this.getPaymentsContract(paymentsAddress)
      return await payments.read.dailyClaimPrice() as bigint
    } catch (error) {
      console.error('Error getting daily claim price:', error)
      throw error
    }
  }

  async getMinDonation(paymentsAddress: Address): Promise<bigint> {
    try {
      const payments = this.getPaymentsContract(paymentsAddress)
      return await payments.read.minDonation() as bigint
    } catch (error) {
      console.error('Error getting min donation:', error)
      throw error
    }
  }

  async makeDailyClaim(paymentsAddress: Address, claimPrice: bigint): Promise<ContractTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for transactions')
    }

    try {
      const payments = this.getPaymentsContract(paymentsAddress)
      const hash = await (payments as any).write.dailyClaim([], { value: claimPrice }) as `0x${string}`
      
      return {
        hash,
        status: 'pending',
        type: 'claim',
        amount: claimPrice
      }
    } catch (error) {
      console.error('Error making daily claim:', error)
      throw error
    }
  }

  async makeDonation(paymentsAddress: Address, amount: bigint): Promise<ContractTransaction> {
    if (!this.walletClient) {
      throw new Error('Wallet client required for transactions')
    }

    try {
      const payments = this.getPaymentsContract(paymentsAddress)
      const hash = await (payments as any).write.donate([], { value: amount }) as `0x${string}`
      
      return {
        hash,
        status: 'pending',
        type: 'donate',
        amount
      }
    } catch (error) {
      console.error('Error making donation:', error)
      throw error
    }
  }

  // Utility Methods
  private getTierName(tier: number): NFTType {
    switch (tier) {
      case 0: return 'early_bird'
      case 1: return 'silver'
      case 2: return 'gold'
      case 3: return 'platinum'
      default: throw new Error(`Invalid tier: ${tier}`)
    }
  }

  // Format utilities
  formatEther(value: bigint): string {
    return formatEther(value)
  }

  parseEther(value: string): bigint {
    return parseEther(value)
  }

  // Get current configuration
  getConfig(): ContractConfig {
    return { ...this.config }
  }

  // Update contract addresses (useful after deployment)
  updateAddresses(addresses: Partial<ContractAddresses>) {
    this.config.addresses = { ...this.config.addresses, ...addresses }
  }
}

// Export singleton instance
export const contractService = new ContractServiceClass()

// Export utilities
export { parseEther, formatEther }
export type ContractService = ContractServiceClass