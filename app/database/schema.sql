-- TWENTY6IX Database Schema for Supabase
-- This file contains the complete database schema for the TWENTY6IX ecosystem

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (main user data)
CREATE TABLE profiles (
    fid BIGINT PRIMARY KEY,
    wallet_address TEXT,
    xp_total INTEGER DEFAULT 0 NOT NULL,
    total_spend_usd DECIMAL(10,2) DEFAULT 0 NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by_fid BIGINT REFERENCES profiles(fid),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Tasks table (social tasks configuration)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 5 NOT NULL,
    intent_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- User tasks tracking
CREATE TABLE user_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT REFERENCES profiles(fid) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE,
    verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(fid, task_id)
);

-- Claims log (daily claims tracking)
CREATE TABLE claims_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT REFERENCES profiles(fid) ON DELETE CASCADE,
    amount_usd DECIMAL(10,2) NOT NULL,
    xp_earned INTEGER NOT NULL,
    transaction_hash TEXT,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Donations tracking
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT REFERENCES profiles(fid) ON DELETE CASCADE,
    amount_usd DECIMAL(10,2) NOT NULL,
    xp_earned INTEGER NOT NULL,
    transaction_hash TEXT NOT NULL,
    donated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- NFT mints tracking
CREATE TABLE nft_mints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fid BIGINT REFERENCES profiles(fid) ON DELETE CASCADE,
    nft_type TEXT NOT NULL CHECK (nft_type IN ('early_bird', 'silver', 'gold', 'platinum')),
    contract_address TEXT NOT NULL,
    token_id TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    xp_bonus INTEGER NOT NULL,
    minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX idx_profiles_referred_by ON profiles(referred_by_fid);
CREATE INDEX idx_user_tasks_fid ON user_tasks(fid);
CREATE INDEX idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX idx_claims_log_fid ON claims_log(fid);
CREATE INDEX idx_claims_log_claimed_at ON claims_log(claimed_at);
CREATE INDEX idx_donations_fid ON donations(fid);
CREATE INDEX idx_nft_mints_fid ON nft_mints(fid);
CREATE INDEX idx_nft_mints_type ON nft_mints(nft_type);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to process referrals
CREATE OR REPLACE FUNCTION process_referral(referrer_fid BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    referral_count INTEGER;
    max_referrals INTEGER := 15;
    referral_xp INTEGER := 20;
BEGIN
    -- Check current referral count
    SELECT COUNT(*) INTO referral_count
    FROM profiles
    WHERE referred_by_fid = referrer_fid;
    
    -- Only process if under the limit
    IF referral_count < max_referrals THEN
        -- Award XP to referrer
        UPDATE profiles
        SET xp_total = xp_total + referral_xp,
            updated_at = NOW()
        WHERE fid = referrer_fid;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to update XP
CREATE OR REPLACE FUNCTION update_xp(user_fid BIGINT, xp_amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET xp_total = xp_total + xp_amount,
        updated_at = NOW()
    WHERE fid = user_fid;
END;
$$ LANGUAGE plpgsql;

-- Function to check NFT eligibility
CREATE OR REPLACE FUNCTION check_nft_eligibility(
    user_fid BIGINT,
    nft_type TEXT,
    required_xp INTEGER,
    required_spend DECIMAL,
    required_referrals INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    user_xp INTEGER;
    user_spend DECIMAL;
    user_referrals INTEGER;
    has_previous_tier BOOLEAN := TRUE;
BEGIN
    -- Get user stats
    SELECT xp_total, total_spend_usd INTO user_xp, user_spend
    FROM profiles
    WHERE fid = user_fid;
    
    -- Count referrals
    SELECT COUNT(*) INTO user_referrals
    FROM profiles
    WHERE referred_by_fid = user_fid;
    
    -- Check if user already owns this NFT type
    IF EXISTS (
        SELECT 1 FROM nft_mints 
        WHERE fid = user_fid AND nft_type = check_nft_eligibility.nft_type
    ) THEN
        RETURN FALSE;
    END IF;
    
    -- Check previous tier requirements for Gold and Platinum
    IF nft_type = 'gold' THEN
        has_previous_tier := EXISTS (
            SELECT 1 FROM nft_mints 
            WHERE fid = user_fid AND nft_type = 'silver'
        );
    ELSIF nft_type = 'platinum' THEN
        has_previous_tier := EXISTS (
            SELECT 1 FROM nft_mints 
            WHERE fid = user_fid AND nft_type = 'gold'
        );
    END IF;
    
    -- Check all requirements
    RETURN (
        user_xp >= required_xp AND
        has_previous_tier AND
        (user_spend >= required_spend OR user_referrals >= required_referrals)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get leaderboard
CREATE OR REPLACE FUNCTION get_leaderboard(limit_count INTEGER DEFAULT 100)
RETURNS TABLE (
    fid BIGINT,
    xp_total INTEGER,
    total_spend_usd DECIMAL,
    referral_count BIGINT,
    rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.fid,
        p.xp_total,
        p.total_spend_usd,
        COALESCE(r.referral_count, 0) as referral_count,
        ROW_NUMBER() OVER (ORDER BY p.xp_total DESC, p.total_spend_usd DESC) as rank
    FROM profiles p
    LEFT JOIN (
        SELECT 
            referred_by_fid,
            COUNT(*) as referral_count
        FROM profiles
        WHERE referred_by_fid IS NOT NULL
        GROUP BY referred_by_fid
    ) r ON p.fid = r.referred_by_fid
    ORDER BY p.xp_total DESC, p.total_spend_usd DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nft_mints ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid()::text = fid::text);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid()::text = fid::text);

-- User tasks policies
CREATE POLICY "Users can view own tasks" ON user_tasks FOR SELECT USING (auth.uid()::text = fid::text);
CREATE POLICY "Users can insert own tasks" ON user_tasks FOR INSERT WITH CHECK (auth.uid()::text = fid::text);
CREATE POLICY "Users can update own tasks" ON user_tasks FOR UPDATE USING (auth.uid()::text = fid::text);

-- Claims log policies
CREATE POLICY "Users can view own claims" ON claims_log FOR SELECT USING (auth.uid()::text = fid::text);
CREATE POLICY "Users can insert own claims" ON claims_log FOR INSERT WITH CHECK (auth.uid()::text = fid::text);

-- Donations policies
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid()::text = fid::text);
CREATE POLICY "Users can insert own donations" ON donations FOR INSERT WITH CHECK (auth.uid()::text = fid::text);

-- NFT mints policies
CREATE POLICY "Users can view all mints" ON nft_mints FOR SELECT USING (true);
CREATE POLICY "Users can insert own mints" ON nft_mints FOR INSERT WITH CHECK (auth.uid()::text = fid::text);

-- Tasks are publicly readable
CREATE POLICY "Tasks are publicly readable" ON tasks FOR SELECT USING (true);

-- Insert some initial tasks
INSERT INTO tasks (title, description, xp_reward, intent_url) VALUES
('Like this Cast', 'Like our announcement cast to earn 5 XP', 5, 'https://warpcast.com/~/compose?text=Just%20liked%20this%20cast!'),
('Follow @twenty6ix', 'Follow our official account for updates', 5, 'https://warpcast.com/twenty6ix'),
('Share your referral', 'Share your referral code with friends', 5, 'https://warpcast.com/~/compose?text=Join%20me%20on%20TWENTY6IX!'),
('Cast about TWENTY6IX', 'Make a cast about your TWENTY6IX experience', 5, 'https://warpcast.com/~/compose?text=Earning%20XP%20on%20@twenty6ix!');