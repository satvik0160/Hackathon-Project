CREATE OR REPLACE FUNCTION get_leaderboard(p_limit INT DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  profile_picture TEXT,
  total_points INT,
  skill_level INT,
  skill_score_percent INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id AS user_id,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      au.raw_user_meta_data->>'username',
      split_part(au.email, '@', 1)
    ) AS display_name,
    u.profile_picture,
    COALESCE(u.total_points, 0) AS total_points,
    COALESCE(u.skill_level, 1) AS skill_level,
    COALESCE(u.skill_score_percent, 0) AS skill_score_percent
  FROM auth.users au
  LEFT JOIN public.users u ON u.id = au.id
  ORDER BY COALESCE(u.total_points, 0) DESC, COALESCE(u.skill_level, 1) DESC
  LIMIT p_limit;
END;
$$;
