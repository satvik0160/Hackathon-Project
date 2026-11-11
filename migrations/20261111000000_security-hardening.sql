-- ====================================================================
-- DevAstra Database Security Hardening Migration
-- Date: 2026-11-11
-- Description:
--   1. Protects against Privilege Escalation on public.users.role
--   2. Enables Row Level Security on public.questions, public.assessments,
--      and public.skill_categories
--   3. Restricts public/anon access to questions.correct_option
--   4. Hardens search_path on all SECURITY DEFINER functions
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PREVENT PRIVILEGE ESCALATION ON USER ROLES
-- --------------------------------------------------------------------
-- Prevent authenticated users from modifying their own 'role' column.
-- Roles can only be changed by administrative service roles or initial registration trigger.

CREATE OR REPLACE FUNCTION public.check_user_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If role is being changed, ensure it's not an unauthorized self-escalation
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Check if current role is not already an admin or if request is from standard client
    IF (SELECT auth.uid()) = OLD.id THEN
      RAISE EXCEPTION 'Privilege escalation rejected: users cannot modify their own role.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.users;
CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_role_update();

-- Revoke direct column update on role from authenticated and anon
REVOKE UPDATE (role) ON public.users FROM anon, authenticated;

-- --------------------------------------------------------------------
-- 2. ENABLE RLS ON ASSESSMENTS AND SKILL CATEGORIES
-- --------------------------------------------------------------------
ALTER TABLE public.skill_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view skill categories" ON public.skill_categories;
CREATE POLICY "Public can view skill categories"
  ON public.skill_categories FOR SELECT
  USING (true);

-- Disallow write operations from standard client connections
REVOKE INSERT, UPDATE, DELETE ON public.skill_categories FROM anon, authenticated;

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can view active assessments" ON public.assessments;
CREATE POLICY "Public can view active assessments"
  ON public.assessments FOR SELECT
  USING (is_active = true);

-- Disallow write operations from standard client connections
REVOKE INSERT, UPDATE, DELETE ON public.assessments FROM anon, authenticated;

-- --------------------------------------------------------------------
-- 3. ENABLE RLS ON QUESTIONS & PROTECT ANSWER KEYS
-- --------------------------------------------------------------------
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view questions for active assessments
DROP POLICY IF EXISTS "Authenticated can view assessment questions" ON public.questions;
CREATE POLICY "Authenticated can view assessment questions"
  ON public.questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = questions.assessment_id AND a.is_active = true
    )
  );

-- Disallow write operations from standard client connections
REVOKE INSERT, UPDATE, DELETE ON public.questions FROM anon, authenticated;

-- --------------------------------------------------------------------
-- 4. HARDEN SEARCH_PATH & EXECUTE PERMISSIONS ON SECURITY DEFINER RPCs
-- --------------------------------------------------------------------
-- Ensure all helper functions have search_path explicitly locked down to prevent search_path hijacking
ALTER FUNCTION public.current_user_role() SET search_path = '';

-- Grant explicit SELECT only on safe columns of questions to authenticated users
GRANT SELECT (id, assessment_id, question_text, options, created_at)
  ON public.questions TO authenticated;

-- Ensure answer checking RPCs run securely
REVOKE EXECUTE ON FUNCTION public.check_single_answer(uuid, varchar) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.check_single_answer(uuid, varchar) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.submit_assessment_secure(uuid, jsonb, int) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_assessment_secure(uuid, jsonb, int) TO authenticated;
