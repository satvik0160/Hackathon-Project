-- Fix: Randomize answer positions so correct answers aren't always 'B'
-- This shuffles the option texts randomly while keeping correct_option pointing
-- to whichever position the correct answer text ends up in.

CREATE OR REPLACE FUNCTION randomize_question_options()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  rec RECORD;
  v_options JSONB;
  v_correct_text TEXT;
  v_texts TEXT[];
  v_shuffled TEXT[];
  v_letters TEXT[] := ARRAY['A', 'B', 'C', 'D'];
  v_new_correct VARCHAR(1);
  v_new_options JSONB;
  v_i INT;
  v_j INT;
  v_temp TEXT;
BEGIN
  FOR rec IN SELECT id, options, correct_option FROM public.questions
  LOOP
    v_options := rec.options;
    
    -- Skip if options aren't in expected format
    IF v_options IS NULL OR NOT (v_options ? 'A') THEN
      CONTINUE;
    END IF;
    
    -- Get the correct answer text
    v_correct_text := v_options->>rec.correct_option;
    
    -- Build array of option texts in A,B,C,D order
    v_texts := ARRAY[
      v_options->>'A',
      v_options->>'B', 
      v_options->>'C',
      v_options->>'D'
    ];
    
    -- Fisher-Yates shuffle
    v_shuffled := v_texts;
    FOR v_i IN REVERSE 4..2 LOOP
      v_j := 1 + floor(random() * v_i)::int;
      v_temp := v_shuffled[v_i];
      v_shuffled[v_i] := v_shuffled[v_j];
      v_shuffled[v_j] := v_temp;
    END LOOP;
    
    -- Build new options JSONB
    v_new_options := jsonb_build_object(
      'A', v_shuffled[1],
      'B', v_shuffled[2],
      'C', v_shuffled[3],
      'D', v_shuffled[4]
    );
    
    -- Find where the correct answer text ended up
    v_new_correct := 'A'; -- default
    FOR v_i IN 1..4 LOOP
      IF v_shuffled[v_i] = v_correct_text THEN
        v_new_correct := v_letters[v_i];
        EXIT;
      END IF;
    END LOOP;
    
    -- Update the question
    UPDATE public.questions 
    SET options = v_new_options,
        correct_option = v_new_correct
    WHERE id = rec.id;
  END LOOP;
END;
$$;

-- Run the shuffle
SELECT randomize_question_options();

-- Clean up the function after use
DROP FUNCTION IF EXISTS randomize_question_options();
