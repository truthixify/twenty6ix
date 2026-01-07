# TWENTY6IX Smart Contracts Makefile

# Load environment variables
include .env
export

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

## Help
help: ## Show this help message
	@echo "$(BLUE)TWENTY6IX Smart Contracts$(NC)"
	@echo "$(YELLOW)Available commands:$(NC)"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Build
build: ## Compile all contracts
	@echo "$(YELLOW)Building contracts...$(NC)"
	forge build

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	forge clean

## Testing
test: ## Run all tests
	@echo "$(YELLOW)Running tests...$(NC)"
	forge test -vv

test-verbose: ## Run tests with verbose output
	@echo "$(YELLOW)Running tests with verbose output...$(NC)"
	forge test -vvv

test-gas: ## Run tests with gas reporting
	@echo "$(YELLOW)Running tests with gas reporting...$(NC)"
	forge test --gas-report

test-coverage: ## Run test coverage
	@echo "$(YELLOW)Running test coverage...$(NC)"
	forge coverage

test-nft: ## Run NFT contract tests only
	@echo "$(YELLOW)Running NFT tests...$(NC)"
	forge test --match-contract Twenty6ixNFTTest -vv

test-payments: ## Run payments contract tests only
	@echo "$(YELLOW)Running payments tests...$(NC)"
	forge test --match-contract Twenty6ixPaymentsTest -vv

test-factory: ## Run factory contract tests only
	@echo "$(YELLOW)Running factory tests...$(NC)"
	forge test --match-contract Twenty6ixFactoryTest -vv

## Deployment
deploy-base: ## Deploy factory to Base mainnet
	@echo "$(YELLOW)Deploying factory to Base mainnet...$(NC)"
	forge script script/DeployTwenty6ix.s.sol:DeployTwenty6ix --rpc-url $(BASE_RPC_URL) --broadcast --verify

deploy-base-sepolia: ## Deploy factory to Base Sepolia testnet
	@echo "$(YELLOW)Deploying factory to Base Sepolia...$(NC)"
	forge script script/DeployTwenty6ix.s.sol:DeployTwenty6ix --rpc-url $(BASE_SEPOLIA_RPC_URL) --broadcast --verify

deploy-local: ## Deploy factory to local network (anvil)
	@echo "$(YELLOW)Deploying factory to local network...$(NC)"
	forge script script/DeployTwenty6ix.s.sol:DeployTwenty6ix --rpc-url http://localhost:8545 --broadcast

## Local Development
anvil: ## Start local Anvil node
	@echo "$(YELLOW)Starting Anvil local node...$(NC)"
	anvil --host 0.0.0.0 --port 8545

## Contract Verification
verify-base: ## Verify contracts on Base mainnet
	@echo "$(YELLOW)Verifying contracts on Base...$(NC)"
	@if [ -f deployments.env ]; then \
		source deployments.env && \
		forge verify-contract $$TWENTY6IX_FACTORY src/Twenty6ixFactory.sol:Twenty6ixFactory --chain base --etherscan-api-key $(BASESCAN_API_KEY); \
	else \
		echo "$(RED)deployments.env not found. Deploy contracts first.$(NC)"; \
	fi

## Utilities
format: ## Format code
	@echo "$(YELLOW)Formatting code...$(NC)"
	forge fmt

lint: ## Lint code
	@echo "$(YELLOW)Linting code...$(NC)"
	forge fmt --check

install: ## Install dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	forge install

update: ## Update dependencies
	@echo "$(YELLOW)Updating dependencies...$(NC)"
	forge update

## Contract Interaction
deploy-ecosystem: ## Deploy ecosystem contracts through factory (requires TWENTY6IX_FACTORY env var)
	@echo "$(YELLOW)Deploying ecosystem contracts...$(NC)"
	@if [ -z "$(TWENTY6IX_FACTORY)" ]; then \
		echo "$(RED)TWENTY6IX_FACTORY environment variable not set$(NC)"; \
		echo "$(YELLOW)Set it with: export TWENTY6IX_FACTORY=0x...$(NC)"; \
		exit 1; \
	fi
	cast send $(TWENTY6IX_FACTORY) "deployContracts()" --rpc-url $(BASE_SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY)

get-ecosystem-addresses: ## Get deployed ecosystem contract addresses
	@echo "$(YELLOW)Getting ecosystem contract addresses...$(NC)"
	@if [ -z "$(TWENTY6IX_FACTORY)" ]; then \
		echo "$(RED)TWENTY6IX_FACTORY environment variable not set$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Factory Address:$(NC) $(TWENTY6IX_FACTORY)"
	@echo "$(BLUE)Early Bird NFT:$(NC) $$(cast call $(TWENTY6IX_FACTORY) "earlyBirdNFT()" --rpc-url $(BASE_SEPOLIA_RPC_URL))"
	@echo "$(BLUE)Silver NFT:$(NC) $$(cast call $(TWENTY6IX_FACTORY) "silverNFT()" --rpc-url $(BASE_SEPOLIA_RPC_URL))"
	@echo "$(BLUE)Gold NFT:$(NC) $$(cast call $(TWENTY6IX_FACTORY) "goldNFT()" --rpc-url $(BASE_SEPOLIA_RPC_URL))"
	@echo "$(BLUE)Platinum NFT:$(NC) $$(cast call $(TWENTY6IX_FACTORY) "platinumNFT()" --rpc-url $(BASE_SEPOLIA_RPC_URL))"
	@echo "$(BLUE)Payments Contract:$(NC) $$(cast call $(TWENTY6IX_FACTORY) "paymentsContract()" --rpc-url $(BASE_SEPOLIA_RPC_URL))"
mint-early-bird: ## Mint Early Bird NFT (requires deployed ecosystem contracts)
	@echo "$(YELLOW)Minting Early Bird NFT...$(NC)"
	@if [ -z "$(TWENTY6IX_FACTORY)" ]; then \
		echo "$(RED)TWENTY6IX_FACTORY environment variable not set$(NC)"; \
		exit 1; \
	fi
	@EARLY_BIRD_NFT=$$(cast call $(TWENTY6IX_FACTORY) "earlyBirdNFT()" --rpc-url $(BASE_SEPOLIA_RPC_URL)) && \
	cast send $$EARLY_BIRD_NFT "mint(uint8)" 0 --value 0.001ether --rpc-url $(BASE_SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY)

daily-claim: ## Make daily claim (requires deployed ecosystem contracts)
	@echo "$(YELLOW)Making daily claim...$(NC)"
	@if [ -z "$(TWENTY6IX_FACTORY)" ]; then \
		echo "$(RED)TWENTY6IX_FACTORY environment variable not set$(NC)"; \
		exit 1; \
	fi
	@PAYMENTS_CONTRACT=$$(cast call $(TWENTY6IX_FACTORY) "paymentsContract()" --rpc-url $(BASE_SEPOLIA_RPC_URL)) && \
	cast send $$PAYMENTS_CONTRACT "dailyClaim()" --value 0.0001ether --rpc-url $(BASE_SEPOLIA_RPC_URL) --private-key $(PRIVATE_KEY)

## Information
addresses: ## Show factory address and ecosystem addresses (if deployed)
	@echo "$(BLUE)TWENTY6IX Contract Addresses:$(NC)"
	@if [ -f factory-deployment.env ]; then \
		echo "$(GREEN)Factory deployment found:$(NC)"; \
		cat factory-deployment.env | grep -v '^#'; \
		echo ""; \
		if [ -n "$(TWENTY6IX_FACTORY)" ]; then \
			echo "$(GREEN)Ecosystem contracts (if deployed):$(NC)"; \
			make get-ecosystem-addresses 2>/dev/null || echo "$(YELLOW)Ecosystem not deployed yet$(NC)"; \
		fi; \
	else \
		echo "$(RED)factory-deployment.env not found. Deploy factory first.$(NC)"; \
	fi

gas-estimate: ## Estimate deployment gas costs
	@echo "$(YELLOW)Estimating gas costs...$(NC)"
	forge script script/DeployTwenty6ix.s.sol:DeployTwenty6ix --rpc-url $(BASE_SEPOLIA_RPC_URL)

## Security
slither: ## Run Slither security analysis (requires slither installation)
	@echo "$(YELLOW)Running Slither analysis...$(NC)"
	slither .

mythril: ## Run Mythril security analysis (requires mythril installation)
	@echo "$(YELLOW)Running Mythril analysis...$(NC)"
	myth analyze src/Twenty6ixNFT.sol
	myth analyze src/Twenty6ixPayments.sol
	myth analyze src/Twenty6ixFactory.sol

.PHONY: help build clean test test-verbose test-gas test-coverage test-nft test-payments test-factory deploy-base deploy-base-sepolia deploy-local anvil verify-base format lint install update mint-early-bird daily-claim addresses gas-estimate slither mythril