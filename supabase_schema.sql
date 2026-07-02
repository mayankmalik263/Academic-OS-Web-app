-- SQL Migration Script: Zero to Modern AI Command Deck Database Schema
-- Run this in the Supabase SQL Editor to set up your database.

-- 1. Enable UUID Extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create tables

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'Explorer',
    avatar_seed TEXT NOT NULL DEFAULT '#05C46B',
    theme TEXT NOT NULL DEFAULT 'dark',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stats Table
CREATE TABLE IF NOT EXISTS public.stats (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    freezes INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Table (Tracks each sub-step checkbox state)
CREATE TABLE IF NOT EXISTS public.progress (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    check_id TEXT NOT NULL,
    state BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, check_id)
);

-- Activity Table (Tracks daily active study dates)
CREATE TABLE IF NOT EXISTS public.activity (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_date DATE NOT NULL,
    PRIMARY KEY (user_id, activity_date)
);

-- Consumed Freezes Table (Tracks dates when freezes were consumed)
CREATE TABLE IF NOT EXISTS public.consumed_freezes (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    freeze_date DATE NOT NULL,
    PRIMARY KEY (user_id, freeze_date)
);

-- Achievements Table (Tracks unlocked trophies)
CREATE TABLE IF NOT EXISTS public.achievements (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id TEXT NOT NULL,
    PRIMARY KEY (user_id, achievement_id)
);

-- Brain Dump Notepad Table
CREATE TABLE IF NOT EXISTS public.brain_dump (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row-Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumed_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brain_dump ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies (auth.uid() ties access to the authenticated user session)

-- Profiles Policies
CREATE POLICY "Users can view their own profile." 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Stats Policies
CREATE POLICY "Users can view their own stats." 
    ON public.stats FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats." 
    ON public.stats FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats." 
    ON public.stats FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Progress Policies
CREATE POLICY "Users can view their own progress." 
    ON public.progress FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress." 
    ON public.progress FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Activity Policies
CREATE POLICY "Users can view their own activity." 
    ON public.activity FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own activity." 
    ON public.activity FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Consumed Freezes Policies
CREATE POLICY "Users can view their own consumed freezes." 
    ON public.consumed_freezes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own consumed freezes." 
    ON public.consumed_freezes FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Users can view their own achievements." 
    ON public.achievements FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own achievements." 
    ON public.achievements FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Brain Dump Policies
CREATE POLICY "Users can view their own brain dump." 
    ON public.brain_dump FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can modify their own brain dump." 
    ON public.brain_dump FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Create Indexes for optimization
CREATE INDEX IF NOT EXISTS progress_user_id_idx ON public.progress (user_id);
CREATE INDEX IF NOT EXISTS activity_user_id_idx ON public.activity (user_id);
CREATE INDEX IF NOT EXISTS consumed_freezes_user_id_idx ON public.consumed_freezes (user_id);
CREATE INDEX IF NOT EXISTS achievements_user_id_idx ON public.achievements (user_id);

-- 6. Trigger Function to create default profile and stats on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Initialize user profile
    INSERT INTO public.profiles (id, display_name, avatar_seed, theme)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'display_name', 'Explorer'),
        '#05C46B',
        'dark'
    );

    -- Initialize user stats
    INSERT INTO public.stats (user_id, xp, level, current_streak, longest_streak, freezes)
    VALUES (
        new.id,
        0,
        1,
        0,
        0,
        1
    );

    -- Initialize user brain dump
    INSERT INTO public.brain_dump (user_id, content)
    VALUES (
        new.id,
        ''
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
