# TWENTY6IX Smart Contracts

Smart contracts for the TWENTY6IX Farcaster Mini App ecosystem built on Base.

## 📋 Overview

The TWENTY6IX smart contract system consists of:

- **Twenty6ixNFT**: Tiered NFT contract for Early Bird, Silver, Gold, and Platinum NFTs
- **Twenty6ixPayments**: Handles daily claims and donations with configurable pricing
- **Twenty6ixFactory**: Factory contract to deploy and manage all ecosystem contracts

## 🏗 Architecture

```
Twenty6ixFactory
├── Twenty6ixNFT (Early Bird)
├── Twenty6ixNFT (Silver) 
├── Twenty6ixNFT (Gold)
├── Twenty6ixNFT (Platinum)
└── Twenty6ixPayments
```

## 🎯 Features

### NFT System
- **Tiered NFTs**: 4 tiers with progressive requirements
- **Batch Minting**: Mint multiple tiers in one transaction
- **Ownership Tracking**: Efficient tier ownership verification
- **Configurable Pricing**: Owner can update mint prices and supply limits
- **Pausable**: Emergency pause functionality

### Payment System
- **Daily Claims**: 24-hour cooldown with configurable pricing
- **Donations**: Minimum donation amounts with tracking
- **Automatic Refunds**: Excess payments automatically refunded
- **Spending Tracking**: Complete user spending history

### Security Features
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Pausable**: Emergency pause for all operations
- **Ownable**: Secure admin functions
- **Input Validation**: Comprehensive parameter validation

## 💰 Economic Model

### NFT Tiers & Pricing

| Tier | Price | Max Supply | XP Bonus | Requirements |
|------|-------|------------|----------|--------------|
| Early Bird | 0.001 ETH | 10,000 | 100 XP | None |
| Silver | 0.0015 ETH | 5,000 | 500 XP | 1,000 XP + ($10 spend OR 15 referrals) |
| Gold | 0.005 ETH | 1,000 | 1,500 XP | 3,000 XP + Silver NFT + ($30 spend OR 15 referrals) |
| Platinum | 0.015 ETH | 100 | 3,000 XP | 10,000 XP + Gold NFT + ($100 spend OR 15 referrals) |

### Payment Features

- **Daily Claims**: 0.0001 ETH ($0.10) with 24h cooldown
- **Donations**: Minimum 0.001 ETH ($1), no maximum
- **Configurable Pricing**: Owner can adjust prices as needed

## 🛠 Development Setup

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js](https://nodejs.org/) (for integration)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd contracts

# Install dependencies
make install

# Copy environment file
cp .env.example .env
# Edit .env with your configuration
```

### Environment Configuration

```bash
# .env file
PRIVATE_KEY=0x...                                    # Deployment private key
BASE_RPC_URL=https://mainnet.base.org               # Base mainnet RPC
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org       # Base testnet RPC
BASESCAN_API_KEY=your_api_key                       # For contract verification
TREASURY_ADDRESS=0x...                              # Treasury wallet
OWNER_ADDRESS=0x...                                 # Contract owner
```

## 🧪 Testing

### Run All Tests
```bash
make test
```

### Run Specific Test Suites
```bash
make test-nft        # NFT contract tests
make test-payments   # Payments contract tests  
make test-factory    # Factory contract tests
```

### Test Coverage
```bash
make test-coverage
```

### Gas Analysis
```bash
make test-gas
```

## 🚀 Deployment

### Local Development
```bash
# Start local Anvil node
make anvil

# Deploy to local network
make deploy-local
```

### Base Sepolia Testnet
```bash
make deploy-base-sepolia
```

### Base Mainnet
```bash
make deploy-base
```

### Verify Contracts
```bash
make verify-base
```

## 📊 Contract Interaction

### Mint NFTs
```bash
# Mint Early Bird NFT
make mint-early-bird

# Or use cast directly
cast send $EARLY_BIRD_NFT "mint(uint8)" 0 --value 0.001ether --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

### Daily Claims
```bash
# Make daily claim
make daily-claim

# Or use cast directly
cast send $PAYMENTS_CONTRACT "dailyClaim()" --value 0.0001ether --rpc-url $RPC_URL --private-key $PRIVATE_KEY
```

### Check Balances
```bash
# Check NFT ownership
cast call $EARLY_BIRD_NFT "ownsTier(address,uint8)" $USER_ADDRESS 0 --rpc-url $RPC_URL

# Check user stats
cast call $PAYMENTS_CONTRACT "getUserStats(address)" $USER_ADDRESS --rpc-url $RPC_URL
```

## 🔧 Contract Management

### Update Pricing
```bash
# Update daily claim price (owner only)
cast send $PAYMENTS_CONTRACT "updateDailyClaimPrice(uint256)" 200000000000000 --rpc-url $RPC_URL --private-key $OWNER_KEY

# Update NFT tier config (owner only)
cast send $NFT_CONTRACT "updateTierConfig(uint8,uint256,uint256,string,bool)" 0 2000000000000000 5000 "https://new-uri/" true --rpc-url $RPC_URL --private-key $OWNER_KEY
```

### Emergency Controls
```bash
# Pause all contracts
cast send $FACTORY "pauseAll()" --rpc-url $RPC_URL --private-key $OWNER_KEY

# Unpause all contracts
cast send $FACTORY "unpauseAll()" --rpc-url $RPC_URL --private-key $OWNER_KEY

# Withdraw all funds
cast send $FACTORY "withdrawAll()" --rpc-url $RPC_URL --private-key $OWNER_KEY
```

## 🔍 Security Analysis

### Static Analysis
```bash
# Run Slither (requires installation)
make slither

# Run Mythril (requires installation)  
make mythril
```

### Manual Security Checklist

- [ ] All external calls use ReentrancyGuard
- [ ] Owner functions are properly protected
- [ ] Input validation on all parameters
- [ ] Proper event emission for state changes
- [ ] Emergency pause functionality works
- [ ] Withdrawal functions send to correct addresses
- [ ] No integer overflow/underflow vulnerabilities
- [ ] Proper access control on admin functions

## 📝 Contract ABIs

After deployment, ABIs are available in:
- `out/Twenty6ixNFT.sol/Twenty6ixNFT.json`
- `out/Twenty6ixPayments.sol/Twenty6ixPayments.json`
- `out/Twenty6ixFactory.sol/Twenty6ixFactory.json`

## 🐛 Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check private key and RPC URL
   - Ensure sufficient ETH for gas
   - Verify network configuration

2. **Tests Fail**
   - Run `make clean && make build`
   - Check Foundry version compatibility
   - Verify test environment setup

3. **Verification Fails**
   - Ensure correct Etherscan API key
   - Check contract address and network
   - Verify constructor parameters match

### Gas Optimization Tips

- Use batch operations when possible
- Consider gas costs in tier progression design
- Monitor gas usage with `make test-gas`
- Optimize struct packing for storage

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive tests
4. Run security analysis
5. Submit a pull request

## 📞 Support

- **Issues**: GitHub Issues
- **Security**: security@twenty6ix.com
- **Documentation**: See `/docs` folder

---

Built with ❤️ using Foundry and OpenZeppelin