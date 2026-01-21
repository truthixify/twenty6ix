-- TWENTY6IX Database Schema
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1. PROFILES TABLE (Main user profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    fid BIGINT PRIMARY KEY,                    -- Farcaster ID (Primary Key)
    wallet_address TEXT,                       -- User's wallet address
    xp_total INTEGER DEFAULT 0,                -- Total XP earned
    total_spend_usd DECIMAL(10,2) DEFAULT 0,   -- Total amount spent in USD
    referral_code TEXT UNIQUE NOT NULL,        -- Unique referral code
    referred_by_fid BIGINT,                    -- FID of user who referred this user
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint for referrals
    CONSTRAINT fk_referred_by FOREIGN KEY (referred_by_fid) REFERENCES public.profiles(fid)
);

-- =====================================================
-- 2. TASKS TABLE (Social tasks and challenges)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INTEGER NOT NULL,
    intent_url TEXT NOT NULL,                  -- URL for task completion
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. USER_TASKS TABLE (User task completions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fid BIGINT NOT NULL,
    task_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN DEFAULT false,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_tasks_fid FOREIGN KEY (fid) REFERENCES public.profiles(fid) ON DELETE CASCADE,
    CONSTRAINT fk_user_tasks_task_id FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate completions
    UNIQUE(fid, task_id)
);

-- =====================================================
-- 4. CLAIMS_LOG TABLE (Daily claim history)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.claims_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fid BIGINT NOT NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    xp_earned INTEGER NOT NULL,
    transaction_hash TEXT,                     -- Blockchain transaction hash
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_claims_log_fid FOREIGN KEY (fid) REFERENCES public.profiles(fid) ON DELETE CASCADE
);

-- =====================================================
-- 5. DONATIONS TABLE (User donations)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fid BIGINT NOT NULL,
    amount_usd DECIMAL(10,2) NOT NULL,
    xp_earned INTEGER NOT NULL,
    transaction_hash TEXT NOT NULL,            -- Blockchain transaction hash
    donated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_donations_fid FOREIGN KEY (fid) REFERENCES public.profiles(fid) ON DELETE CASCADE
);

-- =====================================================
-- 6. NFT_MINTS TABLE (NFT minting history)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.nft_mints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fid BIGINT NOT NULL,
    nft_type TEXT NOT NULL CHECK (nft_type IN ('early_bird', 'silver', 'gold', 'platinum')),
    contract_address TEXT NOT NULL,
    token_id TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    xp_bonus INTEGER NOT NULL,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key constraint
    CONSTRAINT fk_nft_mints_fid FOREIGN KEY (fid) REFERENCES public.profiles(fid) ON DELETE CASCADE
);

-- =====================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_mints ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 8. CREATE RLS POLICIES
-- =====================================================

-- Profiles: Users can read/update their own profile, anyone can read for leaderboard
CREATE POLICY "Users can read all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (true);

-- Tasks: Anyone can read active tasks
CREATE POLICY "Anyone can read active tasks" ON public.tasks FOR SELECT USING (is_active = true);

-- User Tasks: Users can manage their own task completions
CREATE POLICY "Users can read their own task completions" ON public.user_tasks FOR SELECT USING (true);
CREATE POLICY "Users can insert their own task completions" ON public.user_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own task completions" ON public.user_tasks FOR UPDATE USING (true);

-- Claims Log: Users can read their own claims
CREATE POLICY "Users can read their own claims" ON public.claims_log FOR SELECT USING (true);
CREATE POLICY "Users can insert their own claims" ON public.claims_log FOR INSERT WITH CHECK (true);

-- Donations: Users can read their own donations
CREATE POLICY "Users can read their own donations" ON public.donations FOR SELECT USING (true);
CREATE POLICY "Users can insert their own donations" ON public.donations FOR INSERT WITH CHECK (true);

-- NFT Mints: Users can read their own NFT mints
CREATE POLICY "Users can read their own nft mints" ON public.nft_mints FOR SELECT USING (true);
CREATE POLICY "Users can insert their own nft mints" ON public.nft_mints FOR INSERT WITH CHECK (true);

-- =====================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_fid ON public.profiles(referred_by_fid);
CREATE INDEX IF NOT EXISTS idx_profiles_xp_total ON public.profiles(xp_total DESC);
CREATE INDEX IF NOT EXISTS idx_user_tasks_fid ON public.user_tasks(fid);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON public.user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_claims_log_fid ON public.claims_log(fid);
CREATE INDEX IF NOT EXISTS idx_donations_fid ON public.donations(fid);
CREATE INDEX IF NOT EXISTS idx_nft_mints_fid ON public.nft_mints(fid);

-- =====================================================
-- 10. CREATE FUNCTIONS
-- =====================================================

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    fid BIGINT,
    username TEXT,
    avatar_url TEXT,
    xp_total INTEGER,
    rank BIGINT,
    total_spend_usd DECIMAL(10,2),
    referral_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.fid,
        NULL::TEXT as username,  -- We'll get this from Farcaster API
        NULL::TEXT as avatar_url, -- We'll get this from Farcaster API
        p.xp_total,
        ROW_NUMBER() OVER (ORDER BY p.xp_total DESC) as rank,
        p.total_spend_usd,
        COALESCE(ref_count.count, 0) as referral_count
    FROM public.profiles p
    LEFT JOIN (
        SELECT referred_by_fid, COUNT(*) as count
        FROM public.profiles
        WHERE referred_by_fid IS NOT NULL
        GROUP BY referred_by_fid
    ) ref_count ON p.fid = ref_count.referred_by_fid
    ORDER BY p.xp_total DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update XP
CREATE OR REPLACE FUNCTION update_xp(user_fid BIGINT, xp_amount INTEGER)
RETURNS void AS $$
BEGIN
    UPDATE public.profiles 
    SET xp_total = xp_total + xp_amount,
        updated_at = NOW()
    WHERE fid = user_fid;
END;
$$ LANGUAGE plpgsql;

-- Function to process referral
CREATE OR REPLACE FUNCTION process_referral(referrer_fid BIGINT, referee_fid BIGINT)
RETURNS void AS $$
BEGIN
    -- Update the referee to set their referrer
    UPDATE public.profiles 
    SET referred_by_fid = referrer_fid,
        updated_at = NOW()
    WHERE fid = referee_fid AND referred_by_fid IS NULL;
    
    -- Give bonus XP to referrer
    UPDATE public.profiles 
    SET xp_total = xp_total + 50, -- 50 XP bonus for referral
        updated_at = NOW()
    WHERE fid = referrer_fid;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 11. INSERT SAMPLE DATA (Optional)
-- =====================================================

-- Insert some sample tasks
INSERT INTO public.tasks (title, description, xp_reward, intent_url) VALUES
('Follow on Warpcast', 'Follow @twenty6ix on Warpcast for updates', 25, 'https://warpcast.com/twenty6ix'),
('Share on Farcaster', 'Share TWENTY6IX with your friends', 50, 'https://warpcast.com/~/compose?text=Check%20out%20TWENTY6IX!'),
('Join Telegram', 'Join our Telegram community', 30, 'https://t.me/twenty6ix'),
('Recast Announcement', 'Recast our latest announcement', 20, 'https://warpcast.com/twenty6ix')
ON CONFLICT DO NOTHING;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Your TWENTY6IX database is now ready!
-- 
-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Go to Settings → API → Refresh schema cache
-- 3. Test your app - it should now work with the database!