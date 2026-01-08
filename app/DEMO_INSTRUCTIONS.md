# TWENTY6IX Demo Mode Instructions

## Current Status
The app is now set up with **Demo Mode** enabled, allowing you to explore the full dashboard without implementing Farcaster authentication first.

## How to Use

### 1. Demo Mode (Current Setup)
- **File**: `src/app/page.tsx`
- **Line**: `const DEMO_MODE = true`
- **What it does**: 
  - Shows welcome screen with "Enter Dashboard (Demo)" button
  - Clicking the button loads a demo user with sample data
  - Provides full access to all screens and features
  - Shows "Demo Mode" badge in header
  - Includes "Sign Out" button to return to welcome screen

### 2. Demo User Data
```javascript
{
  fid: 123456,
  xp_total: 1250,
  total_spend_usd: 15.50,
  referral_code: 'DEMO123',
  wallet_address: '0x1234567890123456789012345678901234567890'
}
```

### 3. Demo Features Available
- ✅ **Home Screen**: XP display, daily claim (4h remaining), donation card, referral section
- ✅ **Tasks Screen**: 3 sample social tasks with completion workflow
- ✅ **Mint Screen**: All 4 NFT tiers with eligibility checking
- ✅ **Leaderboard Screen**: Real-time leaderboard (will be empty until Supabase is connected)
- ✅ **Info Screen**: App information and external links

### 4. Interactive Elements
- Daily claim countdown timer (set to 4 hours remaining)
- Task completion workflow
- NFT eligibility checking based on XP and spend requirements
- Donation amount calculator
- Referral code sharing

## Switching to Production Mode

When you're ready to implement real Farcaster authentication:

1. **Change Demo Mode**:
   ```javascript
   // In src/app/page.tsx
   const DEMO_MODE = false  // Change to false
   ```

2. **Implement Sign-In**:
   - Update the `handleSignIn` function in `page.tsx`
   - Connect to your Farcaster authentication service
   - Remove demo user creation logic

3. **Connect Supabase**:
   - Update `.env.local` with real Supabase credentials
   - The app will automatically use real database queries

## Current Screen Structure

### Navigation Tabs
1. **Home** - Daily activities and quick stats
2. **Tasks** - Social task completion
3. **Mint** - NFT collection and minting
4. **Leaderboard** - User rankings
5. **Info** - App information (Admin dashboard for owner FID)

### Key Components Created
- `NFTCard` - Interactive NFT minting with eligibility
- `TaskCard` - Social task completion workflow  
- `LeaderboardCard` - User ranking display
- `DailyClaimCard` - 24h cooldown timer and claiming
- `DonationCard` - Flexible donation amounts
- `AdminDashboard` - Owner-only admin panel
- `WelcomeScreen` - Onboarding with feature preview

## Testing the App

1. **Start Development Server**:
   ```bash
   cd twenty6ix/app
   npm run dev
   ```

2. **Access the App**:
   - Open http://localhost:3000
   - Click "Enter Dashboard (Demo)"
   - Explore all 5 tabs
   - Test interactive features

3. **Admin Features**:
   - Set `NEXT_PUBLIC_OWNER_FID=123456` in `.env.local` to test admin dashboard
   - Go to Info tab to see admin controls

## Next Steps

1. **Implement Farcaster Auth**: Replace demo mode with real authentication
2. **Connect Supabase**: Add real database credentials
3. **Deploy Contracts**: Deploy NFT contracts to Base network
4. **Add Payment Processing**: Implement actual payment flows
5. **Test Mini App**: Test in Farcaster client environment

The app is fully functional in demo mode and ready for real authentication integration!