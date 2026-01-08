'use client'

import { useEffect, useState } from 'react'
import { useContracts, usePaymentsContract } from '@/hooks/useContracts'
import { formatEther } from 'viem'

export function ContractStatus() {
  const { 
    isLoading, 
    error, 
    deployedAddresses, 
    isConnected, 
    loadDeployedAddresses,
    deployEcosystem 
  } = useContracts()
  
  const { 
    userStats, 
    canClaim, 
    timeUntilNextClaim,
    getPricingInfo 
  } = usePaymentsContract(deployedAddresses?.payments)

  const [pricingInfo, setPricingInfo] = useState<{
    dailyClaimPrice: bigint
    minDonation: bigint
  } | null>(null)

  // Load contract addresses on mount
  useEffect(() => {
    loadDeployedAddresses()
  }, [loadDeployedAddresses])

  // Load pricing info when payments contract is available
  useEffect(() => {
    if (deployedAddresses?.payments) {
      getPricingInfo().then(setPricingInfo)
    }
  }, [deployedAddresses?.payments, getPricingInfo])

  const handleDeployEcosystem = async () => {
    const transaction = await deployEcosystem()
    if (transaction) {
      console.log('Deployment transaction:', transaction)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Contract Status</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Wallet Connected:</span>
          <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'Yes' : 'No'}
          </span>
        </div>

        {deployedAddresses && (
          <>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Factory:</span>
              <span className="text-sm font-mono">
                {deployedAddresses.factory.slice(0, 6)}...{deployedAddresses.factory.slice(-4)}
              </span>
            </div>

            {deployedAddresses.payments && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payments:</span>
                <span className="text-sm font-mono">
                  {deployedAddresses.payments.slice(0, 6)}...{deployedAddresses.payments.slice(-4)}
                </span>
              </div>
            )}

            {deployedAddresses.earlyBirdNFT && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Early Bird NFT:</span>
                <span className="text-sm font-mono">
                  {deployedAddresses.earlyBirdNFT.slice(0, 6)}...{deployedAddresses.earlyBirdNFT.slice(-4)}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {pricingInfo && (
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-sm font-medium">Pricing Info</h4>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Daily Claim:</span>
            <span className="text-sm font-medium">
              {formatEther(pricingInfo.dailyClaimPrice)} ETH
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Min Donation:</span>
            <span className="text-sm font-medium">
              {formatEther(pricingInfo.minDonation)} ETH
            </span>
          </div>
        </div>
      )}

      {userStats && (
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-sm font-medium">Your Stats</h4>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Claims:</span>
            <span className="text-sm font-medium">{userStats.claims.toString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Donations:</span>
            <span className="text-sm font-medium">{userStats.donations.toString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Total Spent:</span>
            <span className="text-sm font-medium">
              {formatEther(userStats.spent)} ETH
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Can Claim:</span>
            <span className={`text-sm font-medium ${canClaim ? 'text-green-600' : 'text-red-600'}`}>
              {canClaim ? 'Yes' : 'No'}
            </span>
          </div>
          {!canClaim && timeUntilNextClaim > 0n && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Next Claim In:</span>
              <span className="text-sm font-medium">
                {Math.floor(Number(timeUntilNextClaim) / 3600)}h {Math.floor((Number(timeUntilNextClaim) % 3600) / 60)}m
              </span>
            </div>
          )}
        </div>
      )}

      <div className="pt-2 border-t">
        <button
          onClick={handleDeployEcosystem}
          disabled={!isConnected || isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deployedAddresses?.payments ? 'Ecosystem Deployed' : 'Deploy Ecosystem'}
        </button>
      </div>
    </div>
  )
}