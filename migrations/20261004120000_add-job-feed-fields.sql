-- Job feed integration: store listings pulled from trusted public job-board APIs
-- (Remotive, Arbeitnow, RemoteOK, Himalayas, Jobicy) with a direct apply URL.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS external_id TEXT,
  ADD COLUMN IF NOT EXISTS apply_url TEXT,
  ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS company_logo TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS fetched_at TIMESTAMPTZ DEFAULT NOW();

-- One row per external listing. NULLs are distinct in Postgres unique
-- constraints, so manually created jobs (source/external_id NULL) are unaffected.
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_source_external_id_key;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_source_external_id_key UNIQUE (source, external_id);

CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON public.jobs (posted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_jobs_source ON public.jobs (source);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON public.jobs (is_active) WHERE is_active;

-- The 10 hand-seeded sample listings are not real postings and have no apply
-- URL. Deactivate them so the feed only surfaces real, redirectable jobs.
UPDATE public.jobs SET is_active = FALSE WHERE source IS NULL;
