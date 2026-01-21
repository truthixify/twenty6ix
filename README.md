# TWENTY6IX Ecosystem

> A Farcaster-native Mini App driving social engagement and on-chain activity on Base

TWENTY6IX is a comprehensive web3 social platform that incentivizes users through a multi-tiered reward system involving social tasks, daily claims, and progressive NFT collection. Built as a Farcaster Mini App, it provides seamless integration with Warpcast and other Farcaster clients.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Blockchain    │
│   (Next.js)     │◄──►│   (Supabase)    │◄──►│   (Base L2)     │
│                 │    │                 │    │                 │
│ • Farcaster SDK │    │ • PostgreSQL    │    │ • Smart         │
│ • Wagmi/Viem    │    │ • Edge Functions│    │   Contracts     │
│ • TailwindCSS   │    │ • Realtime      │    │ • ERC-721 NFTs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Foundry (for smart contracts)
- Supabase account
- Base network wallet

### 1. Clone and Setup

```bash
git clone <repository-url>
cd twenty6ix
```

### 2. Frontend Setup

```bash
cd twenty6ix
npm install
cp .env.example .env.local
# Configure your environment variables
npm run dev
```

### 3. Smart Contracts Setup

```bash
cd contracts
cp .env.example .env
# Configure deployment addresses and keys
make install
make test
```

## 📁 Project Structure

```
twenty6ix/
├── twenty6ix/          # Next.js Frontend Application
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   └── types/      # TypeScript definitions
│   ├── database/       # Supabase schema
│   └── public/         # Static assets
├── contracts/          # Smart Contracts (Foundry)
│   ├── src/           # Solidity contracts
│   ├── test/          # Contract tests
│   ├── script/        # Deployment scripts
│   └── Makefile       # Development commands
└── SPEC.md            # Technical specification
```

## 🎯 Core Features

### XP Economy System
- **Daily Claims**: 10 XP per claim ($0.10 fee)
- **Donations**: 50 XP per $1 donated (minimum $1)
- **Referrals**: 20 XP per successful referral (capped at 15)
- **Social Tasks**: 5 XP per completed task
- **Mint Bonuses**: 100-3000 XP based on NFT tier

### Progressive NFT Tiers
- **Early Bird**: Entry-level NFT (100 XP bonus)
- **Silver**: 1,000 XP + ($10 spend OR 15 referrals) (500 XP bonus)
- **Gold**: 3,000 XP + Silver NFT + ($30 spend OR 15 referrals) (1000 XP bonus)
- **Platinum**: 10,000 XP + Gold NFT + ($100 spend OR 15 referrals) (3000 XP bonus)

### Social Integration
- Farcaster Mini App SDK integration
- Sign-In With Farcaster (SIWF) authentication
- Native sharing and social features
- Real-time leaderboard

## 🛠️ Development

### Frontend Development

```bash
cd twenty6ix
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Smart Contract Development

```bash
cd contracts
make help           # Show all available commands
make test           # Run all tests
make test-verbose   # Run tests with detailed output
make build          # Compile contracts
make deploy-local   # Deploy to local network
```

### Key Make Commands

```bash
# Testing
make test-nft       # Test NFT contracts only
make test-payments  # Test payments contracts only
make test-factory   # Test factory contract only
make test-coverage  # Generate coverage report

# Deployment
make deploy-base-sepolia  # Deploy to Base Sepolia testnet
make deploy-base         # Deploy to Base mainnet
make gas-estimate        # Estimate deployment costs

# Contract Interaction
make deploy-ecosystem    # Deploy ecosystem via factory
make mint-early-bird     # Mint Early Bird NFT
make daily-claim         # Make daily claim
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```bash
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OnchainKit
ONCHAINKIT_API_KEY=your_onchainkit_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_FARCASTER_DEVELOPER_FID=your_fid
```

#### Smart Contracts (.env)
```bash
# Deployment
PRIVATE_KEY=your_private_key
TREASURY_ADDRESS=0x...
OWNER_ADDRESS=0x...

# Network RPCs
BASE_RPC_URL=https://mainnet.base.org
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Verification
BASESCAN_API_KEY=your_basescan_api_key
```

## 📊 Smart Contracts

### Core Contracts

- **Twenty6ixFactory.sol**: Deploys and manages ecosystem contracts
- **Twenty6ixNFT.sol**: Tiered ERC-721 NFT system with progression gates
- **Twenty6ixPayments.sol**: Handles daily claims and donations with configurable pricing

### Contract Addresses

After deployment, addresses are saved to `contracts/factory-deployment.env`:

```bash
# Example addresses (update with actual deployment)
TWENTY6IX_FACTORY=0x...
TREASURY_ADDRESS=0x...
OWNER_ADDRESS=0x...
```

### Test Coverage

- **40 comprehensive tests** covering all contract functionality
- **100% test coverage** on critical paths
- **Gas optimization** testing and reporting

## 🔐 Security

### Authentication
- Farcaster-only authentication (SIWF)
- No passwords or email storage
- Wallet-based identity verification

### Smart Contract Security
- OpenZeppelin battle-tested contracts
- Comprehensive test suite
- Owner-only administrative functions
- Configurable pricing to prevent economic attacks

### Environment Security
- Sensitive keys never exposed to frontend
- Proper `NEXT_PUBLIC_` prefix usage
- Environment-based configuration

## 🚀 Deployment

### Frontend Deployment

1. **Vercel** (Recommended)
```bash
cd twenty6ix
vercel --prod
```

2. **Manual**
```bash
cd twenty6ix
npm run build
npm start
```

### Smart Contract Deployment

1. **Configure Environment**
```bash
cd contracts
cp .env.example .env
# Update TREASURY_ADDRESS, OWNER_ADDRESS, and PRIVATE_KEY
```

2. **Deploy to Base Sepolia (Testnet)**
```bash
make deploy-base-sepolia
```

3. **Deploy to Base Mainnet**
```bash
make deploy-base
```

4. **Deploy Ecosystem Contracts**
```bash
export TWENTY6IX_FACTORY=0x... # From deployment output
make deploy-ecosystem
```

## 📈 Monitoring

### Contract Events
- `DailyClaim(user, amount, timestamp)`
- `Donation(user, amount, timestamp)`
- `NFTMinted(user, tier, tokenId)`
- `XPAwarded(user, amount, source)`

### Analytics Integration
- Supabase realtime for live leaderboard
- On-chain event indexing
- User engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `make test` (contracts) and `npm test` (frontend)
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests for new features
- Use conventional commit messages
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- [Farcaster Mini Apps Documentation](https://miniapps.farcaster.xyz/)
- [Base Network](https://base.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Foundry Documentation](https://book.getfoundry.sh/)

## 📞 Support

For questions and support:
- Create an issue in this repository
- Join our Farcaster channel
- Check the [SPEC.md](./SPEC.md) for detailed technical architecture

---

Built with ❤️ for the Farcaster ecosystem