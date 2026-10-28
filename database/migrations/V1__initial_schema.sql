-- =========================================================================
-- Supabase PostgreSQL Initial Schema for Hyperniche B2B2C Platform
-- Version: V1
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CREATOR', 'BRAND', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('DRAFT', 'ACTIVE', 'IN_REVIEW', 'PAUSED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('CREATED', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'CREATOR',
    display_name VARCHAR(150) NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    profile_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREATOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS creator_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    niche VARCHAR(100),
    categories TEXT[] DEFAULT '{}',
    instagram_handle VARCHAR(100),
    youtube_handle VARCHAR(100),
    tiktok_handle VARCHAR(100),
    twitter_handle VARCHAR(100),
    website_url TEXT,
    followers_count INTEGER DEFAULT 0,
    avg_views INTEGER DEFAULT 0,
    engagement_rate NUMERIC(5,2) DEFAULT 0.00,
    rate_reel_inr NUMERIC(10,2) DEFAULT 0.00,
    rate_post_inr NUMERIC(10,2) DEFAULT 0.00,
    rate_story_inr NUMERIC(10,2) DEFAULT 0.00,
    rate_video_inr NUMERIC(10,2) DEFAULT 0.00,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_paid BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. BRAND PROFILES TABLE
CREATE TABLE IF NOT EXISTS brand_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100),
    website_url TEXT,
    logo_url TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    budget_inr NUMERIC(12,2) NOT NULL,
    deliverables TEXT[] DEFAULT '{}',
    requirements TEXT,
    deadline DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    applications_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pitch TEXT NOT NULL,
    proposed_rate_inr NUMERIC(12,2) NOT NULL,
    portfolio_links TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_campaign_creator_application UNIQUE(campaign_id, creator_id)
);

-- 6. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_brand_creator_campaign_chat UNIQUE(brand_id, creator_id, campaign_id)
);

-- 7. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. PAYMENT TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id VARCHAR(100) UNIQUE NOT NULL,
    payment_id VARCHAR(100),
    amount_paise BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    type VARCHAR(50) NOT NULL, -- 'VERIFICATION', 'APPLICATION_FEE', 'ESCROW_MILESTONE'
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- INDEXES
-- =========================================================================
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_creator_niche ON creator_profiles(niche);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_applications_campaign_id ON applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_applications_creator_id ON applications(creator_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(brand_id, creator_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payment_transactions(order_id);

-- =========================================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public users can view profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Creator profiles
CREATE POLICY "Public can view creator profiles" ON creator_profiles FOR SELECT USING (true);
CREATE POLICY "Creators can insert own profile" ON creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Creators can update own profile" ON creator_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Brand profiles
CREATE POLICY "Public can view brand profiles" ON brand_profiles FOR SELECT USING (true);
CREATE POLICY "Brands can insert own profile" ON brand_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Brands can update own profile" ON brand_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Campaigns
CREATE POLICY "Public can view active campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Brands can insert campaigns" ON campaigns FOR INSERT WITH CHECK (auth.uid() = brand_id);
CREATE POLICY "Brands can update own campaigns" ON campaigns FOR UPDATE USING (auth.uid() = brand_id);

-- Applications
CREATE POLICY "Creators can view their own applications" ON applications FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Brands can view applications for their campaigns" ON applications FOR SELECT USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = applications.campaign_id AND c.brand_id = auth.uid())
);
CREATE POLICY "Creators can apply to campaigns" ON applications FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Brands can update application status" ON applications FOR UPDATE USING (
    EXISTS (SELECT 1 FROM campaigns c WHERE c.id = applications.campaign_id AND c.brand_id = auth.uid())
);

-- Conversations
CREATE POLICY "Participants can view conversations" ON conversations FOR SELECT USING (
    auth.uid() = brand_id OR auth.uid() = creator_id
);

-- Messages
CREATE POLICY "Conversation participants can view messages" ON messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid()))
);
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid()))
);
