-- Jobs write access, applications, and real analytics RPCs.

-- Industry partners can create and edit job listings (previously only a
-- SELECT policy existed, so every "Post Job" was rejected by RLS).
DROP POLICY IF EXISTS "Industry can insert jobs" ON public.jobs;
CREATE POLICY "Industry can insert jobs"
  ON public.jobs FOR INSERT
  WITH CHECK (public.current_user_role() = 'INDUSTRY');

DROP POLICY IF EXISTS "Industry can update jobs" ON public.jobs;
CREATE POLICY "Industry can update jobs"
  ON public.jobs FOR UPDATE
  USING (public.current_user_role() = 'INDUSTRY');

GRANT SELECT, INSERT, UPDATE ON public.jobs TO authenticated;

-- Industry partners can view student profiles for recruiting.
DROP POLICY IF EXISTS "Industry can view student profiles" ON public.users;
CREATE POLICY "Industry can view student profiles"
  ON public.users FOR SELECT
  USING (public.current_user_role() = 'INDUSTRY' AND role = 'STUDENT');

-- ---------- Job applications ----------
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL DEFAULT 'Applied',
  cover_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_applications_user ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own applications" ON public.job_applications;
CREATE POLICY "Users manage own applications"
  ON public.job_applications FOR ALL
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Industry can view applications" ON public.job_applications;
CREATE POLICY "Industry can view applications"
  ON public.job_applications FOR SELECT
  USING (public.current_user_role() = 'INDUSTRY');

DROP POLICY IF EXISTS "Industry can update applications" ON public.job_applications;
CREATE POLICY "Industry can update applications"
  ON public.job_applications FOR UPDATE
  USING (public.current_user_role() = 'INDUSTRY');

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;

-- ---------- Real institution analytics ----------
CREATE OR REPLACE FUNCTION public.get_institution_analytics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total INT := 0;
  v_avg NUMERIC := 0;
  v_ready NUMERIC := 0;
  v_gap_count INT := 0;
  v_skill_gaps JSONB := '[]'::jsonb;
  v_career JSONB := '[]'::jsonb;
  v_curriculum JSONB := '[]'::jsonb;
BEGIN
  IF public.current_user_role() <> 'INSTITUTION_ADMIN' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT count(*) INTO v_total FROM public.users WHERE role = 'STUDENT';

  SELECT COALESCE(round(avg(ua.percentage)), 0)
  INTO v_avg
  FROM public.user_assessments ua
  JOIN public.users u ON u.id = ua.user_id
  WHERE u.role = 'STUDENT';

  SELECT COALESCE(round(100.0 * count(*) FILTER (WHERE ua.percentage >= 60) / NULLIF(count(*), 0)), 0)
  INTO v_ready
  FROM public.user_assessments ua
  JOIN public.users u ON u.id = ua.user_id
  WHERE u.role = 'STUDENT';

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'skill', skill, 'current', current, 'required', required) ORDER BY cnt DESC), '[]'::jsonb)
  INTO v_skill_gaps
  FROM (
    SELECT s AS skill, count(*) AS cnt,
           round(100.0 * count(*) / GREATEST(v_total, 1)) AS current,
           LEAST(round(100.0 * count(*) / GREATEST(v_total, 1)) + 20, 100) AS required
    FROM public.users u,
         jsonb_array_elements_text(COALESCE(u.skills, '[]'::jsonb)) AS s
    WHERE u.role = 'STUDENT'
    GROUP BY s
    ORDER BY cnt DESC
    LIMIT 5
  ) t;

  SELECT count(*) INTO v_gap_count
  FROM public.skill_categories sc
  WHERE NOT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.role = 'STUDENT'
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(COALESCE(u.skills, '[]'::jsonb)) s
        WHERE lower(s) LIKE '%' || lower(sc.name) || '%'
      )
  );

  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', name, 'value', cnt) ORDER BY cnt DESC), '[]'::jsonb)
  INTO v_career
  FROM (
    SELECT COALESCE(u.skills->>0, 'Undecided') AS name, count(*) AS cnt
    FROM public.users u
    WHERE u.role = 'STUDENT'
    GROUP BY 1
    ORDER BY cnt DESC
    LIMIT 5
  ) t;

  SELECT COALESCE(jsonb_agg(jsonb_build_object('topic', name, 'rating', rating)), '[]'::jsonb)
  INTO v_curriculum
  FROM (
    SELECT sc.name,
           CASE
             WHEN COALESCE(cov, 0) >= 60 THEN 'Strong'
             WHEN COALESCE(cov, 0) >= 30 THEN 'Moderate'
             WHEN COALESCE(cov, 0) > 0 THEN 'Weak'
             ELSE 'Missing'
           END AS rating
    FROM (
      SELECT sc.name,
             100.0 * (
               SELECT count(*) FROM public.users u
               WHERE u.role = 'STUDENT'
                 AND EXISTS (
                   SELECT 1 FROM jsonb_array_elements_text(COALESCE(u.skills, '[]'::jsonb)) s
                   WHERE lower(s) LIKE '%' || lower(sc.name) || '%'
                 )
             ) / GREATEST(v_total, 1) AS cov
      FROM public.skill_categories sc
      ORDER BY sc.name
      LIMIT 5
    ) sc
  ) t;

  RETURN jsonb_build_object(
    'stats', jsonb_build_object(
      'totalStudents', v_total,
      'averageScore', v_avg,
      'topGaps', v_gap_count,
      'placementReadiness', v_ready
    ),
    'skillGaps', v_skill_gaps,
    'careerDistribution', v_career,
    'curriculumAlignment', v_curriculum
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_institution_analytics() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_institution_analytics() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_institution_analytics() TO authenticated;

-- ---------- Real industry skill intelligence ----------
CREATE OR REPLACE FUNCTION public.get_industry_skill_intelligence()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_total_jobs INT := 0;
  v_total_students INT := 0;
  v_result JSONB := '[]'::jsonb;
BEGIN
  IF public.current_user_role() <> 'INDUSTRY' THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT count(*) INTO v_total_jobs FROM public.jobs;
  SELECT count(*) INTO v_total_students FROM public.users WHERE role = 'STUDENT';

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
           'skill', skill,
           'demand', demand,
           'supply', supply,
           'critical', (demand - supply) >= 20
         ) ORDER BY (demand - supply) DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT s AS skill,
           round(100.0 * (SELECT count(*) FROM public.jobs j
                          WHERE EXISTS (
                            SELECT 1 FROM jsonb_array_elements_text(COALESCE(j.required_skills, '[]'::jsonb)) rs
                            WHERE lower(rs) = lower(s))) / GREATEST(v_total_jobs, 1)) AS demand,
           round(100.0 * (SELECT count(*) FROM public.users u
                          WHERE u.role = 'STUDENT' AND EXISTS (
                            SELECT 1 FROM jsonb_array_elements_text(COALESCE(u.skills, '[]'::jsonb)) us
                            WHERE lower(us) = lower(s))) / GREATEST(v_total_students, 1)) AS supply
    FROM (
      SELECT DISTINCT rs AS s
      FROM public.jobs j,
           jsonb_array_elements_text(COALESCE(j.required_skills, '[]'::jsonb)) rs
      LIMIT 12
    ) skills
  ) t;

  RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_industry_skill_intelligence() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_industry_skill_intelligence() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_industry_skill_intelligence() TO authenticated;
