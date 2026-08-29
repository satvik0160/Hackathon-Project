CREATE OR REPLACE FUNCTION check_single_answer(
    p_question_id UUID,
    p_selected_option VARCHAR(1)
)
RETURNS TABLE (
    is_correct BOOLEAN,
    correct_option VARCHAR(1)
)
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_correct_option VARCHAR(1);
BEGIN
    SELECT q.correct_option INTO v_correct_option
    FROM questions q
    WHERE q.id = p_question_id;
    
    IF v_correct_option IS NULL THEN
        RAISE EXCEPTION 'Question not found';
    END IF;

    RETURN QUERY SELECT 
        (v_correct_option = p_selected_option) AS is_correct,
        v_correct_option AS correct_option;
END;
$$ LANGUAGE plpgsql;

-- Set permissions
GRANT EXECUTE ON FUNCTION check_single_answer TO public;
GRANT EXECUTE ON FUNCTION check_single_answer TO anon;
GRANT EXECUTE ON FUNCTION check_single_answer TO authenticated;
