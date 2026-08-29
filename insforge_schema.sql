-- InsForge PostgreSQL Schema for DevAstra

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Extends InsForge Auth)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    role VARCHAR(20) DEFAULT 'STUDENT',
    bio TEXT,
    profile_picture TEXT,
    experience_level VARCHAR(20) DEFAULT 'beginner',
    skills JSONB DEFAULT '[]',
    interests JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skill Categories
CREATE TABLE public.skill_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(300) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES public.skill_categories(id),
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    time_limit_minutes INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Questions
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_option VARCHAR(1) NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Progress / Scores
CREATE TABLE public.user_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    time_taken_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs / Postings
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    job_type VARCHAR(50) DEFAULT 'FULL_TIME',
    location VARCHAR(255),
    is_remote BOOLEAN DEFAULT FALSE,
    required_skills JSONB DEFAULT '[]',
    salary_range VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only read/update their own profile
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING ((select auth.uid()) = id);

-- Anyone can read active jobs
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT USING (true);

-- Users can only view their own assessment results
CREATE POLICY "Users can view own scores" ON public.user_assessments FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own scores" ON public.user_assessments FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Added INSERT policy for users
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK ((select auth.uid()) = id);

-- Performance Indexes (Foreign Keys)
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_assessment_id ON public.user_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_category_id ON public.assessments(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id);
