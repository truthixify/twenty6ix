# **Technical Architecture Specification: TWENTY6IX Ecosystem**

## **1\. Executive Summary**

**TWENTY6IX** is a Farcaster-native "Mini App" (Frame v2) designed to drive social engagement and on-chain activity on the **Base** network. The platform incentivizes users through a multi-tiered reward system involving social tasks, daily claims, and a progressive NFT collection. By leveraging **Next.js** for a high-performance frontend and **Supabase** for a scalable relational backend, the architecture ensures low latency, predictable costs, and a seamless mobile-first user experience.

## 

## **2\. Core Technical Stack**

The system is built on a modern web3 social stack to ensure permissionless publishing and minimal friction for Warpcast users.

* **Frontend Framework:** Next.js 14+ (App Router).  
* **Backend & Database:** Supabase (PostgreSQL, Edge Functions, Realtime).  
* **Blockchain Network:** Base (Ethereum Layer 2).  
* **Authentication:** Sign-In With Farcaster (SIWF) via Farcaster Frame SDK.  
* **Web3 Libraries:** OnchainKit, Wagmi, and Viem for wallet connection and contract interaction.  
* **Smart Contracts:** Solidity (ERC-721 for NFT phases).

## 

## **3\. System Architecture**

### **3.1. Frontend Layer (Next.js)**

The frontend serves as the user interface within Farcaster clients (Warpcast). It is optimized for mobile responsiveness and fast loading times (\<2s).

* **Farcaster Frame SDK Integration:** Detects the user's environment to enable SIWF and trigger native Farcaster UI components.  
* **State Management:** React Context/Hooks for managing user XP, session state, and transaction status.  
* **Components:** Modular UI using Tailwind CSS and Shadcn UI, featuring a tabbed navigation system (Home, Tasks, Mint, Leaderboard, FAQ/Roadmap).

### **3.2. Backend & Data Layer (Supabase)**

Supabase acts as the central orchestrator for off-chain data and bridge to on-chain events.

* **PostgreSQL Database:** Stores relational data for users, referrals, and tasks.  
* **Realtime Engine:** Powers the live Leaderboard, ensuring user ranks update instantly as points are earned.  
* **Edge Functions:** Serverless TypeScript functions used for verifying social task completion and processing webhooks from the blockchain.

### **3.3. Blockchain Layer (Base)**

All value-exchange actions occur on Base to maintain low gas fees ($0.001–$0.01 per transaction).

* **NFT Contracts:** Tiered ERC-721 contracts for Early Bird, Silver, Gold, and Platinum NFTs.  
* **Transaction Processing:** Users pay fixed fees for mints and claims directly to the owner's wallet.  
* **Indexing:** Integration with Alchemy or QuickNode to monitor the blockchain for successful mints/donations, which then triggers XP updates in Supabase.

## 

## **4\. Database Schema Design**

A relational structure is critical to managing the complex dependencies between XP, spending, and referral tiers.

### **4.1. Profiles Table**

* fid (Primary Key): The unique Farcaster ID.  
* wallet\_address: The user’s verified Base wallet.  
* xp\_total: Cumulative experience points.  
* total\_spend\_usd: Tracks cumulative value spent on claims and donations.  
* referral\_code: Unique string for the user’s invite link.  
* referred\_by\_fid: FK linking to the user who invited them.

### **4.2. Tasks & Activity Tables**

* **tasks:** Stores the list of social actions (e.g., "Like this Cast"), their XP value, and the intent URL.  
* **user\_tasks:** Tracks which tasks a user has clicked/attempted.  
* **claims\_log:** Timestamped entries for daily 24h cooldown enforcement.

## 

## **5\. Core Feature Logic**

### **5.1. The XP Economy**

The XP system is the primary driver of progression. Points are allocated based on the following weights:

* **Daily Claims:** 10 XP per claim ($0.10 fee).  
* **Donations:** 50 XP per $1 donated (Minimum $1).  
* **Referrals:** 20 XP per successful referral (Capped at 15 referrals/300 XP).  
* **Social Tasks:** 5 XP per task (Manual confirmation).  
* **Mint Bonuses:** On-chain mints provide instant XP boosts (100 XP for Early Bird up to 3000 XP for Platinum).

### **5.2. Progressive NFT Eligibility (Phase Gating)**

The app uses a hybrid check to prevent "free-riding" and ensure active participation.

* **Silver NFT:** Requires 1,000 XP AND (Either $10 total spend OR 15 referrals).  
* **Gold NFT:** Requires 3,000 XP \+ Holding Silver NFT AND (Either $30 total spend OR 15 referrals).  
* **Platinum NFT:** Requires 10,000 XP \+ Holding Gold NFT AND (Either $100 total spend OR 15 referrals).

### **5.3. Referral Engine**

When a new user joins via a referral\_code, the app checks if the referrer has reached the 15-referral cap. If not, the referrer is awarded 20 XP, and the referral count is incremented. This logic is handled by a Supabase Database Function to ensure data integrity.

## 

## **6\. Security & Admin Controls**

* **Authentication:** Strictly SIWF-based. No passwords or email addresses are stored.  
* **Admin Dashboard:** A restricted view within the app (accessible only by the owner's FID) to:  
  * Update task URLs and descriptions.  
  * Adjust mint prices and fixed fees.  
  * Monitor total XP and system-wide spend.  
* **Rate Limiting:** Supabase Edge Functions implement rate limiting to prevent spamming of the "Task Confirmation" endpoint.

## 

## **7\. Monetization Flow**

The application generates revenue through fixed fees sent directly to the owner's wallet:

* **Mint Fees:** Variable by tier (e.g., $1.50 for Silver, $15 for Platinum).  
* **Claim Fees:** $0.10 per daily claim.  
* **Donations:** Fully optional, unrestricted amounts, incentivized by a 50 XP/$1 bonus.  
* **Gas:** All gas costs are borne by the user, keeping the owner's operational costs near zero.

## 

## **8\. Implementation Roadmap**

1. **Phase 1 (Setup):** Smart contract deployment on Base; Supabase schema initialization; Next.js boilerplate with SIWF.  
2. **Phase 2 (Growth):** Launch Early Bird mint; enable Daily Claims and Referral system; Leaderboard go-live.  
3. **Phase 3 (Tiers):** Roll out Silver and Gold NFT minting gates; implement automated on-chain verification for XP bonuses.  
4. **Phase 4 (Scale):** Platinum NFT launch (FCFS); Token Generation Event (TGE) planning; integration of token rewards for top leaderboard players.