-- Fix the core scoring RPCs.
--
-- Root cause found in production: `FLOOR(int / 5) % 100` returns double
-- precision from FLOOR(), and Postgres has no `%` operator for double
-- precision, so submit_assessment_secure / add_arcade_xp always raised
-- "operator does not exist: double precision % integer". As a result no user
-- ever gained XP, levels or a skill score.
--
-- Fix: use integer arithmetic throughout ((points / 5) % 100).
-- Also maintain a real daily streak from activity.

-- Real streak tracking.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS streak_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity_date DATE;

CREATE OR REPLACE FUNCTION public.submit_assessment_secure(
  p_assessment_id UUID,
  p_answers JSONB,
  p_time_taken_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_question_record RECORD;
  v_correct_count INT := 0;
  v_total_questions INT := 0;
  v_score_percentage INT := 0;
  v_xp_earned INT := 0;
  v_inserted_id UUID;
  v_difficulty VARCHAR(20);
  v_current_total_points INT;
  v_current_skill_level INT;
  v_points_to_add INT := 0;
  v_new_total_points INT;
  v_new_skill_score_percent INT;
  v_new_skill_level INT;
  v_last_activity DATE;
  v_streak INT;
  v_new_streak INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT difficulty INTO v_difficulty
  FROM public.assessments WHERE id = p_assessment_id;

  FOR v_question_record IN
    SELECT id, correct_option FROM public.questions WHERE assessment_id = p_assessment_id
  LOOP
    v_total_questions := v_total_questions + 1;
    IF p_answers ? (v_question_record.id::text) THEN
      IF (p_answers->>(v_question_record.id::text)) = v_question_record.correct_option THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    END IF;
  END LOOP;

  IF v_total_questions > 0 THEN
    v_score_percentage := ROUND((v_correct_count::numeric / v_total_questions::numeric) * 100);
  END IF;

  IF UPPER(v_difficulty) = 'BEGINNER' OR UPPER(v_difficulty) = 'EASY' THEN
    v_points_to_add := 15;
  ELSIF UPPER(v_difficulty) = 'INTERMEDIATE' OR UPPER(v_difficulty) = 'MEDIUM' THEN
    v_points_to_add := 25;
  ELSIF UPPER(v_difficulty) = 'ADVANCED' OR UPPER(v_difficulty) = 'HARD' THEN
    v_points_to_add := 35;
  ELSE
    v_points_to_add := 15;
  END IF;

  IF v_score_percentage < 80 THEN
    v_points_to_add := 0;
  END IF;

  v_xp_earned := v_points_to_add;

  SELECT COALESCE(total_points, 0), COALESCE(skill_level, 1),
         COALESCE(streak_count, 0), last_activity_date
  INTO v_current_total_points, v_current_skill_level, v_streak, v_last_activity
  FROM public.users
  WHERE id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    v_current_total_points := 0;
    v_current_skill_level := 1;
    v_streak := 0;
    v_last_activity := NULL;
  END IF;

  v_new_total_points := v_current_total_points + v_points_to_add;
  v_new_skill_level := 1 + (v_new_total_points / 500);
  v_new_skill_score_percent := (v_new_total_points / 5) % 100;

  -- Real streak: +1 if yesterday, reset otherwise, unchanged if same day.
  IF v_last_activity = CURRENT_DATE THEN
    v_new_streak := GREATEST(COALESCE(v_streak, 0), 1);
  ELSIF v_last_activity = CURRENT_DATE - 1 THEN
    v_new_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  UPDATE public.users
  SET total_points = v_new_total_points,
      skill_score_percent = v_new_skill_score_percent,
      skill_level = v_new_skill_level,
      streak_count = v_new_streak,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE id = v_user_id;

  INSERT INTO public.user_assessments (
    user_id, assessment_id, score, percentage, time_taken_seconds
  ) VALUES (
    v_user_id, p_assessment_id, v_correct_count, v_score_percentage, p_time_taken_seconds
  ) RETURNING id INTO v_inserted_id;

  RETURN jsonb_build_object(
    'assessment_id', p_assessment_id,
    'user_id', v_user_id,
    'percentage', v_score_percentage,
    'score', v_correct_count,
    'time_taken_seconds', p_time_taken_seconds,
    'score_percentage', v_score_percentage,
    'correct_count', v_correct_count,
    'xp_earned', v_xp_earned,
    'total_points', v_new_total_points,
    'skill_level', v_new_skill_level,
    'skill_score_percent', v_new_skill_score_percent,
    'streak_count', v_new_streak
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.add_arcade_xp(p_xp_to_add INT)
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
  v_last_activity DATE;
  v_streak INT;
  v_new_streak INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT COALESCE(total_points, 0), COALESCE(streak_count, 0), last_activity_date
  INTO v_current_total_points, v_streak, v_last_activity
  FROM public.users WHERE id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    v_current_total_points := 0;
    v_streak := 0;
    v_last_activity := NULL;
  END IF;

  v_new_total_points := v_current_total_points + GREATEST(p_xp_to_add, 0);
  v_new_skill_level := 1 + (v_new_total_points / 500);
  v_new_skill_score_percent := (v_new_total_points / 5) % 100;

  IF v_last_activity = CURRENT_DATE THEN
    v_new_streak := GREATEST(COALESCE(v_streak, 0), 1);
  ELSIF v_last_activity = CURRENT_DATE - 1 THEN
    v_new_streak := COALESCE(v_streak, 0) + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  UPDATE public.users
  SET total_points = v_new_total_points,
      skill_score_percent = v_new_skill_score_percent,
      skill_level = v_new_skill_level,
      streak_count = v_new_streak,
      last_activity_date = CURRENT_DATE,
      updated_at = NOW()
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'total_points', v_new_total_points,
    'skill_level', v_new_skill_level,
    'skill_score_percent', v_new_skill_score_percent,
    'streak_count', v_new_streak
  );
END;
$$;

-- Leaderboard: auth.users has `profile` jsonb, not `raw_user_meta_data`.
CREATE OR REPLACE FUNCTION public.get_leaderboard(p_limit INT DEFAULT 50)
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
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id AS user_id,
    COALESCE(
      au.profile->>'full_name',
      au.profile->>'name',
      au.profile->>'username',
      split_part(au.email, '@', 1)
    ) AS display_name,
    u.profile_picture,
    COALESCE(u.total_points, 0) AS total_points,
    COALESCE(u.skill_level, 1) AS skill_level,
    COALESCE(u.skill_score_percent, 0) AS skill_score_percent
  FROM public.users u
  JOIN auth.users au ON au.id = u.id
  ORDER BY COALESCE(u.total_points, 0) DESC, COALESCE(u.skill_level, 1) DESC
  LIMIT p_limit;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.submit_assessment_secure(uuid, jsonb, int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.submit_assessment_secure(uuid, jsonb, int) FROM anon;
GRANT EXECUTE ON FUNCTION public.submit_assessment_secure(uuid, jsonb, int) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.add_arcade_xp(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.add_arcade_xp(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.add_arcade_xp(int) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard(int) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_leaderboard(int) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(int) TO authenticated;
