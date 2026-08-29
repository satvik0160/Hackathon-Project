-- 1. Fix Dangerous SECURITY DEFINER functions
-- We need to add SET search_path = '' to secure them

ALTER FUNCTION public.submit_assessment_secure(UUID, JSONB, INT) SET search_path = '';
ALTER FUNCTION public.check_single_answer(UUID, VARCHAR) SET search_path = '';
-- Assuming get_email_by_username signature is (text)
ALTER FUNCTION public.get_email_by_username(text) SET search_path = '';


-- 2. Fix Missing Foreign Key Indexes
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id ON public.user_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assessments_assessment_id ON public.user_assessments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessments_category_id ON public.assessments(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON public.questions(assessment_id);


-- 3. Fix RLS policies re-evaluating auth.uid() per row
-- We drop the old policies and recreate them using (select auth.uid()) for caching.

-- Users table policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users 
  FOR SELECT USING ( (select auth.uid()) = id );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING ( (select auth.uid()) = id );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users 
  FOR INSERT WITH CHECK ( (select auth.uid()) = id );

-- User Assessments policies
DROP POLICY IF EXISTS "Users can view own scores" ON public.user_assessments;
CREATE POLICY "Users can view own scores" ON public.user_assessments 
  FOR SELECT USING ( (select auth.uid()) = user_id );

DROP POLICY IF EXISTS "Users can insert own scores" ON public.user_assessments;
CREATE POLICY "Users can insert own scores" ON public.user_assessments 
  FOR INSERT WITH CHECK ( (select auth.uid()) = user_id );

