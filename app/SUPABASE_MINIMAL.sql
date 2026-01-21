-- MINIMAL TWENTY6IX Database Setup
-- Run this first if you want to test quickly

-- Create the main profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    fid BIGINT PRIMARY KEY,
    wallet_address TEXT,
    xp_total INTEGER DEFAULT 0,
    total_spend_usd DECIMAL(10,2) DEFAULT 0,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by_fid BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create basic policies
CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update profiles" ON public.profiles FOR UPDATE USING (true);

-- Create leaderboard function
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
        NULL::TEXT as username,
        NULL::TEXT as avatar_url,
        p.xp_total,
        ROW_NUMBER() OVER (ORDER BY p.xp_total DESC) as rank,
        p.total_spend_usd,
        0::BIGINT as referral_count
    FROM public.profiles p
    ORDER BY p.xp_total DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;