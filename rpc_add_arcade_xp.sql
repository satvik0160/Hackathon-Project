CREATE OR REPLACE FUNCTION add_arcade_xp(p_xp_to_add INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_current_total_points INT;
  v_new_total_points INT;
  v_new_skill_level INT;
  v_new_skill_score_percent INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COALESCE(total_points, 0)
  INTO v_current_total_points
  FROM public.users
  WHERE id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    v_current_total_points := 0;
  END IF;

  v_new_total_points := v_current_total_points + p_xp_to_add;
  v_new_skill_level := 1 + FLOOR(v_new_total_points / 500);
  v_new_skill_score_percent := FLOOR(v_new_total_points / 5) % 100;

  UPDATE public.users
  SET total_points = v_new_total_points,
      skill_score_percent = v_new_skill_score_percent,
      skill_level = v_new_skill_level
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'total_points', v_new_total_points,
    'skill_level', v_new_skill_level,
    'skill_score_percent', v_new_skill_score_percent
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION add_arcade_xp FROM public;
REVOKE EXECUTE ON FUNCTION add_arcade_xp FROM anon;
GRANT EXECUTE ON FUNCTION add_arcade_xp TO authenticated;
