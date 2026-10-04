-- Real tables for the Learning Hub, Daily Planner and Career Roadmap.
-- These were previously queried by the frontend but never existed, producing
-- 404s and forcing every page onto hardcoded arrays.

-- Role helper used by later RLS policies (recursion-safe, SECURITY DEFINER).
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.current_user_role() TO authenticated;

-- ---------- Learning resources ----------
CREATE TABLE IF NOT EXISTS public.learning_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type VARCHAR(50),
  difficulty_level VARCHAR(30),
  skill_category VARCHAR(150),
  duration VARCHAR(50),
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_category
  ON public.learning_resources(skill_category);

ALTER TABLE public.learning_resources ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read learning resources" ON public.learning_resources;
CREATE POLICY "Anyone can read learning resources"
  ON public.learning_resources FOR SELECT USING (true);

GRANT SELECT ON public.learning_resources TO anon, authenticated;

-- ---------- Per-user resource completion ----------
CREATE TABLE IF NOT EXISTS public.user_resource_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.learning_resources(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT TRUE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_user_resource_progress_user
  ON public.user_resource_progress(user_id);

ALTER TABLE public.user_resource_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own resource progress" ON public.user_resource_progress;
CREATE POLICY "Users manage own resource progress"
  ON public.user_resource_progress FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_resource_progress TO authenticated;

-- ---------- Daily planner targets ----------
CREATE TABLE IF NOT EXISTS public.daily_planner_targets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type VARCHAR(30) DEFAULT 'task',
  duration VARCHAR(30),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  target_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_planner_user_date
  ON public.daily_planner_targets(user_id, target_date);

ALTER TABLE public.daily_planner_targets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own planner targets" ON public.daily_planner_targets;
CREATE POLICY "Users manage own planner targets"
  ON public.daily_planner_targets FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_planner_targets TO authenticated;

-- ---------- Persisted career roadmap (one per user) ----------
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  career_goal TEXT,
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users manage own learning path" ON public.learning_paths;
CREATE POLICY "Users manage own learning path"
  ON public.learning_paths FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.learning_paths TO authenticated;
