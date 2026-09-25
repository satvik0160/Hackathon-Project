ALTER FUNCTION public.get_leaderboard(p_limit INT) SET search_path = '';

REVOKE EXECUTE ON FUNCTION public.get_leaderboard(p_limit INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(p_limit INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(p_limit INT) TO authenticated;
