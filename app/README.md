# TWENTY6IX - Farcaster Mini App

A Farcaster-native Mini App built on Base that incentivizes social engagement through XP rewards and progressive NFT collection.

## 🚀 Features

- **Farcaster Mini App**: Native integration with Farcaster clients (Warpcast, etc.)
- **XP Economy**: Earn points through daily claims, donations, referrals, and social tasks
- **Progressive NFTs**: Unlock exclusive NFT tiers (Early Bird, Silver, Gold, Platinum)
- **Social Integration**: One-click sharing, native authentication, seamless UX
- **Base Network**: Low-cost transactions on Ethereum Layer 2
- **Real-time Leaderboard**: Live rankings with Supabase Realtime
- **Mobile-First**: Optimized for mobile Farcaster clients

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 19, Tailwind CSS 4
- **Mini App SDK**: Farcaster Frame SDK for native integration
- **Backend**: Supabase (PostgreSQL, Edge Functions, Realtime)
- **Blockchain**: Base (Ethereum L2)
- **Web3**: Wagmi, Viem for wallet integration
- **Authentication**: Farcaster Quick Auth
- **UI Components**: Custom components with Radix UI primitives

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Base network wallet with ETH for gas
- Farcaster account with developer mode enabled
- Domain for Mini App hosting (required for production)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd twenty6ix
npm install
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp .env.example .env.local
```

Fill in your environment variables:

```env
# Supabase Configuration
# NEXT_PUBLIC_SUPABASE_URL: Safe to be public (it's the project URL)
# NEXT_PUBLIC_SUPABASE_ANON_KEY: Safe to be public (designed for client-side use with RLS)
# SUPABASE_SERVICE_ROLE_KEY: MUST be server-side only (bypasses RLS)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Base Network Configuration (public - OK)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
NEXT_PUBLIC_BASE_CHAIN_ID=8453

# Farcaster Configuration (public - OK)
NEXT_PUBLIC_FARCASTER_HUB_URL=https://hub.farcaster.xyz
NEXT_PUBLIC_FARCASTER_APP_FID=your_app_fid

# OnchainKit Configuration (server-side only for security)
ONCHAINKIT_API_KEY=your_coinbase_api_key

# Contract Addresses (public - OK, these are on-chain anyway)
NEXT_PUBLIC_EARLY_BIRD_NFT_CONTRACT=
NEXT_PUBLIC_SILVER_NFT_CONTRACT=
NEXT_PUBLIC_GOLD_NFT_CONTRACT=
NEXT_PUBLIC_PLATINUM_NFT_CONTRACT=

# Owner Configuration (public - OK, FID is public, wallet address is on-chain)
NEXT_PUBLIC_OWNER_FID=your_owner_fid
NEXT_PUBLIC_OWNER_WALLET=your_owner_wallet_address

# App Configuration (public - OK)
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_NAME=TWENTY6IX
```

### 🔐 Environment Variable Security

**Important**: Only use `NEXT_PUBLIC_` prefix for variables that are safe to expose to the client:

- ✅ **Safe for `NEXT_PUBLIC_`**: API endpoints, contract addresses, chain IDs, app configuration
- ❌ **Never `NEXT_PUBLIC_`**: API keys, service role keys, private keys, sensitive tokens

**Supabase Security Notes**:

- `NEXT_PUBLIC_SUPABASE_URL`: Safe to expose (public project URL)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Safe to expose (designed for client-side use with Row Level Security)
- `SUPABASE_SERVICE_ROLE_KEY`: **NEVER** make public (bypasses all security rules)

### 3. Database Setup

1. Create a new Supabase project
2. Run the database schema:

```sql
-- Copy and paste the contents of database/schema.sql into your Supabase SQL editor
```

3. Enable Row Level Security (RLS) policies
4. Configure authentication settings for Farcaster

### 4. Farcaster Mini App Setup

#### Enable Developer Mode

1. Log in to Farcaster on mobile or desktop
2. Go to https://farcaster.xyz/~/settings/developer-tools
3. Toggle on "Developer Mode"

#### Configure Mini App Manifest

1. Update `public/.well-known/farcaster.json` with your domain and FID
2. Replace placeholder images:
    - `public/icon-192.png` (192x192 app icon)
    - `public/og-image.png` (1200x630 Open Graph image)
    - `public/splash.png` (splash screen image)

#### Update Meta Tags

The app includes proper Farcaster Mini App meta tags in `src/app/layout.tsx`. Update the URLs to match your domain.

### 5. Smart Contract Deployment

Deploy the NFT contracts to Base network:

```bash
# TODO: Add contract deployment instructions
# Contracts should be ERC-721 with mint functions
# Update contract addresses in .env.local
```

### 6. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

**Note**: Mini App features will only work when running in a Farcaster client or when deployed to a public domain.

## 📱 Mini App Features

### Native Farcaster Integration

- **Authentication**: Seamless sign-in with Farcaster identity
- **Sharing**: One-click sharing to Farcaster feeds
- **Deep Linking**: Direct links to Farcaster profiles and casts
- **Mobile Optimized**: Native mobile experience in Farcaster clients

### Social Actions

- Share referral codes directly to Farcaster
- Open external links with native handling
- Compose casts with pre-filled content
- Follow accounts and interact with content

### Environment Detection

The app automatically detects if it's running as a Mini App and adapts the UI accordingly:

- Shows Mini App badge in header
- Enables native sharing functionality
- Uses Farcaster-specific authentication flow
- Optimizes for mobile viewport

## 🎯 XP Economy

### Earning XP

- **Daily Claims**: 10 XP per claim ($0.10 fee)
- **Donations**: 50 XP per $1 donated (minimum $1)
- **Referrals**: 20 XP per successful referral (max 15 referrals)
- **Social Tasks**: 5 XP per completed task
- **NFT Mints**: Bonus XP (100-3000 XP depending on tier)

### NFT Tier Requirements

| Tier       | XP Required        | Spend OR Referrals   | Mint Price | XP Bonus |
| ---------- | ------------------ | -------------------- | ---------- | -------- |
| Early Bird | 0                  | None                 | $1.00      | 100 XP   |
| Silver     | 1,000              | $10 OR 15 referrals  | $1.50      | 500 XP   |
| Gold       | 3,000 + Silver NFT | $30 OR 15 referrals  | $5.00      | 1,500 XP |
| Platinum   | 10,000 + Gold NFT  | $100 OR 15 referrals | $15.00     | 3,000 XP |

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push
4. Update Mini App manifest with production domain

### Mini App Registration

After deployment:

1. Update `public/.well-known/farcaster.json` with your production domain
2. Test the Mini App in Farcaster developer tools
3. Submit for review if required
4. Share your Mini App URL in Farcaster to test

### Custom Deployment

```bash
npm run build
npm start
```

## 📊 Mini App Manifest

The Mini App manifest is located at `public/.well-known/farcaster.json` and includes:

- App metadata (name, description, icons)
- Account association for verification
- Splash screen configuration
- Button and interaction settings

## 🔐 Security Features

- **Farcaster Authentication**: Cryptographically verified user identity
- **Row Level Security**: Database-level access control
- **Rate Limiting**: Prevents spam and abuse
- **Admin Controls**: Owner-only configuration access
- **Transaction Verification**: On-chain validation for all payments

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test in both web and Mini App environments
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check Farcaster Mini App docs at https://miniapps.farcaster.xyz
- **Issues**: Report bugs via GitHub Issues
- **Community**: Join our Farcaster channel for support

## 🗺 Roadmap

- [ ] **Phase 1**: Core Mini App launch with Early Bird NFTs
- [ ] **Phase 2**: Silver and Gold tier rollout with enhanced social features
- [ ] **Phase 3**: Platinum tier and advanced Mini App capabilities
- [ ] **Phase 4**: Token generation event (TGE) and governance integration

---

Built with ❤️ for the Farcaster ecosystem on Base
