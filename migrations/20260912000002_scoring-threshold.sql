CREATE OR REPLACE FUNCTION submit_assessment_secure(
  p_assessment_id UUID,
  p_answers JSONB,
  p_time_taken_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, ''
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
  v_current_skill_score_percent INT;
  v_current_skill_level INT;
  v_points_to_add INT := 0;
  v_new_total_points INT;
  v_new_skill_score_percent INT;
  v_new_skill_level INT;
  v_levels_gained INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get difficulty
  SELECT difficulty INTO v_difficulty
  FROM public.assessments
  WHERE id = p_assessment_id;

  -- Calculate score
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
  
  -- Points based on difficulty
  IF UPPER(v_difficulty) = 'BEGINNER' THEN
    v_points_to_add := 15;
  ELSIF UPPER(v_difficulty) = 'INTERMEDIATE' OR UPPER(v_difficulty) = 'MEDIUM' THEN
    v_points_to_add := 25;
  ELSIF UPPER(v_difficulty) = 'ADVANCED' OR UPPER(v_difficulty) = 'HARD' THEN
    v_points_to_add := 35;
  ELSE
    v_points_to_add := 15; -- fallback
  END IF;

  IF v_score_percentage < 80 THEN
    v_points_to_add := 0;
  END IF;

  v_xp_earned := v_points_to_add;

  -- Get current user stats and lock the row for update
  SELECT COALESCE(total_points, 0), COALESCE(skill_score_percent, 0), COALESCE(skill_level, 1)
  INTO v_current_total_points, v_current_skill_score_percent, v_current_skill_level
  FROM public.users
  WHERE id = v_user_id FOR UPDATE;

  IF NOT FOUND THEN
    -- Fallback in case user row somehow doesn't exist despite triggers
    v_current_total_points := 0;
    v_current_skill_score_percent := 0;
    v_current_skill_level := 1;
  END IF;

  -- Calculate new stats
  v_new_total_points := v_current_total_points + v_points_to_add;
  v_new_skill_score_percent := FLOOR(v_new_total_points / 5);
  
  v_levels_gained := FLOOR(v_new_skill_score_percent / 100);
  v_new_skill_level := v_current_skill_level + v_levels_gained;
  v_new_skill_score_percent := v_new_skill_score_percent % 100;

  -- Update user profile
  UPDATE public.users
  SET total_points = v_new_total_points,
      skill_score_percent = v_new_skill_score_percent,
      skill_level = v_new_skill_level
  WHERE id = v_user_id;

  -- Insert into user_assessments
  INSERT INTO public.user_assessments (
    user_id,
    assessment_id,
    score,
    percentage,
    time_taken_seconds
  ) VALUES (
    v_user_id,
    p_assessment_id,
    v_correct_count,
    v_score_percentage,
    p_time_taken_seconds
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
    'skill_score_percent', v_new_skill_score_percent
  );
END;
$$;

-- Set permissions
GRANT EXECUTE ON FUNCTION submit_assessment_secure TO public;
GRANT EXECUTE ON FUNCTION submit_assessment_secure TO anon;
GRANT EXECUTE ON FUNCTION submit_assessment_secure TO authenticated;
