-- Fix InsForge Backend Advisor dangerous-function warning
ALTER FUNCTION public.submit_assessment_secure(p_assessment_id uuid, p_answers jsonb, p_time_taken_seconds integer) SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.submit_assessment_secure(p_assessment_id uuid, p_answers jsonb, p_time_taken_seconds integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_assessment_secure(p_assessment_id uuid, p_answers jsonb, p_time_taken_seconds integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_assessment_secure(p_assessment_id uuid, p_answers jsonb, p_time_taken_seconds integer) TO authenticated;

ALTER FUNCTION public.check_single_answer(p_question_id uuid, p_selected_option varchar) SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.check_single_answer(p_question_id uuid, p_selected_option varchar) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.check_single_answer(p_question_id uuid, p_selected_option varchar) FROM anon;
GRANT EXECUTE ON FUNCTION public.check_single_answer(p_question_id uuid, p_selected_option varchar) TO authenticated;

ALTER FUNCTION public.add_arcade_xp(p_xp_to_add INT) SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.add_arcade_xp(p_xp_to_add INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_arcade_xp(p_xp_to_add INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_arcade_xp(p_xp_to_add INT) TO authenticated;
