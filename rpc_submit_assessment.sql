CREATE OR REPLACE FUNCTION submit_assessment_secure(
  p_assessment_id UUID,
  p_answers JSONB,
  p_time_taken_seconds INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_question_record RECORD;
  v_correct_count INT := 0;
  v_total_questions INT := 0;
  v_score_percentage INT := 0;
  v_xp_earned INT := 0;
  v_inserted_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Calculate score
  FOR v_question_record IN 
    SELECT id, correct_option FROM questions WHERE assessment_id = p_assessment_id
  LOOP
    v_total_questions := v_total_questions + 1;
    -- check if p_answers has key for this question id and if it matches
    IF p_answers ? (v_question_record.id::text) THEN
      IF (p_answers->>(v_question_record.id::text)) = v_question_record.correct_option THEN
        v_correct_count := v_correct_count + 1;
      END IF;
    END IF;
  END LOOP;

  IF v_total_questions > 0 THEN
    v_score_percentage := ROUND((v_correct_count::numeric / v_total_questions::numeric) * 100);
  END IF;
  
  v_xp_earned := v_correct_count * 10;

  -- Insert into user_assessments
  INSERT INTO user_assessments (
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
    'current_streak', 1
  );
END;
$$;
