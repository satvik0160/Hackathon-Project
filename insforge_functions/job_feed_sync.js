// job_feed_sync — pulls real job listings from trusted public job-board APIs
// and upserts them into public.jobs with a direct apply URL.
//
// Sources (all free, public, ToS-compliant JSON APIs — no HTML scraping):
//   - Remotive   (https://remotive.com/api/remote-jobs)
//   - Arbeitnow  (https://www.arbeitnow.com/api/job-board-api)
//   - RemoteOK   (https://remoteok.com/api)          — link-back required
//   - Himalayas  (https://himalayas.app/jobs/api)
//   - Jobicy     (https://jobicy.com/api/v2/remote-jobs)
//
// Runs on a daily schedule (see `insforge schedules`) and upserts on the
// (source, external_id) unique constraint so job ids are stable across runs.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const UA = 'Mozilla/5.0 (compatible; DevAstra/1.0; +https://6vjqpi3p.insforge.site)';
const MAX_PER_SOURCE = 60;
const DESCRIPTION_LIMIT = 6000;

// ---------- helpers ----------
const stripHtml = (s = '') =>
  String(s)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, DESCRIPTION_LIMIT);

const normType = (t) => {
  const s = String(t || '').toLowerCase();
  if (s.includes('intern')) return 'Internship';
  if (s.includes('part')) return 'Part-time';
  if (s.includes('contract') || s.includes('freelance') || s.includes('temporary')) return 'Contract';
  if (s.includes('full')) return 'Full-time';
  return t ? String(t) : 'Full-time';
};

const skills = (arr) => {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const raw of arr) {
    const s = String(raw || '').trim();
    if (!s || s.length > 40) continue;
    if (!out.some((x) => x.toLowerCase() === s.toLowerCase())) out.push(s);
  }
  return out.slice(0, 15);
};

const iso = (v) => {
  if (!v && v !== 0) return null;
  const d = typeof v === 'number' ? new Date(v < 1e12 ? v * 1000 : v) : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

const salary = (min, max, currency = '') => {
  if (!min && !max) return null;
  const fmt = (n) => (n ? `${currency}${Number(n).toLocaleString()}`.trim() : '');
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  return fmt(min || max);
};

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

// ---------- source normalizers ----------
async function fetchRemotive() {
  const data = await getJson('https://remotive.com/api/remote-jobs?limit=' + MAX_PER_SOURCE);
  return (data.jobs || []).map((j) => ({
    source: 'remotive',
    external_id: String(j.id),
    title: j.title,
    company_name: j.company_name,
    description: stripHtml(j.description),
    job_type: normType(j.job_type),
    location: j.candidate_required_location || 'Remote',
    is_remote: true,
    required_skills: skills(j.tags),
    salary_range: j.salary || null,
    company_logo: j.company_logo_url || j.company_logo || null,
    apply_url: j.url,
    posted_at: iso(j.publication_date),
  }));
}

async function fetchArbeitnow() {
  const data = await getJson('https://www.arbeitnow.com/api/job-board-api');
  return (data.data || []).slice(0, MAX_PER_SOURCE).map((j) => ({
    source: 'arbeitnow',
    external_id: j.slug,
    title: j.title,
    company_name: j.company_name,
    description: stripHtml(j.description),
    job_type: normType((j.job_types || [])[0]),
    location: j.location || (j.remote ? 'Remote' : 'Unspecified'),
    is_remote: !!j.remote,
    required_skills: skills(j.tags),
    salary_range: null,
    company_logo: null,
    apply_url: j.url,
    posted_at: iso(j.created_at),
  }));
}

async function fetchRemoteOk() {
  const data = await getJson('https://remoteok.com/api');
  // The first element is a legal notice, not a job.
  return (Array.isArray(data) ? data.slice(1, MAX_PER_SOURCE + 1) : []).map((j) => ({
    source: 'remoteok',
    external_id: String(j.id),
    title: j.position,
    company_name: j.company,
    description: stripHtml(j.description),
    job_type: normType((j.tags || []).find((t) => /full|part|contract|intern/i.test(t))),
    location: j.location || 'Remote',
    is_remote: true,
    required_skills: skills(j.tags),
    salary_range: salary(j.salary_min, j.salary_max, '$'),
    company_logo: j.company_logo || j.logo || null,
    apply_url: j.apply_url || j.url,
    posted_at: iso(j.date || j.epoch),
  }));
}

async function fetchHimalayas() {
  const data = await getJson('https://himalayas.app/jobs/api?limit=' + MAX_PER_SOURCE);
  return (data.jobs || []).map((j) => ({
    source: 'himalayas',
    external_id: String(j.guid || j.title + '|' + j.companyName),
    title: j.title,
    company_name: j.companyName,
    description: stripHtml(j.description || j.excerpt),
    job_type: normType(j.employmentType),
    location: Array.isArray(j.locationRestrictions) && j.locationRestrictions.length
      ? j.locationRestrictions.join(', ')
      : 'Remote',
    is_remote: true,
    required_skills: skills([...(j.categories || []), ...(j.parentCategories || []), ...(j.seniority || [])]),
    salary_range: salary(j.minSalary, j.maxSalary, j.currency ? j.currency + ' ' : ''),
    company_logo: j.companyLogo || null,
    apply_url: j.applicationLink || j.guid,
    posted_at: iso(j.pubDate),
  }));
}

async function fetchJobicy() {
  const data = await getJson('https://jobicy.com/api/v2/remote-jobs?count=' + MAX_PER_SOURCE);
  return (data.jobs || []).map((j) => ({
    source: 'jobicy',
    external_id: String(j.id),
    title: j.jobTitle,
    company_name: j.companyName,
    description: stripHtml(j.jobDescription || j.jobExcerpt),
    job_type: normType((j.jobType || [])[0]),
    location: j.jobGeo || 'Remote',
    is_remote: true,
    required_skills: skills([...(j.jobIndustry || []), j.jobLevel]),
    salary_range: salary(j.annualSalaryMin, j.annualSalaryMax, (j.salaryCurrency || '') + ' '),
    company_logo: j.companyLogo || null,
    apply_url: j.url,
    posted_at: iso(j.pubDate),
  }));
}

const FETCHERS = {
  remotive: fetchRemotive,
  arbeitnow: fetchArbeitnow,
  remoteok: fetchRemoteOk,
  himalayas: fetchHimalayas,
  jobicy: fetchJobicy,
};

// ---------- persistence ----------
function pgHeaders() {
  const key = Deno.env.get('API_KEY');
  return {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

async function upsertJobs(rows) {
  if (!rows.length) return 0;
  const base = Deno.env.get('INSFORGE_BASE_URL');
  const now = new Date().toISOString();
  // fetched_at and is_active MUST be in the payload: merge-duplicates only
  // updates the columns it receives, so omitting them would leave stale
  // values and break stale-row deactivation.
  const payload = rows.map((r) => ({ ...r, is_active: true, fetched_at: now }));
  const res = await fetch(
    `${base}/api/database/records/jobs?on_conflict=source,external_id`,
    {
      method: 'POST',
      headers: { ...pgHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(payload),
    },
  );
  if (!res.ok) throw new Error(`upsert failed: HTTP ${res.status} ${await res.text()}`);
  return rows.length;
}

async function deactivateStale(source, since) {
  const base = Deno.env.get('INSFORGE_BASE_URL');
  const q = `source=eq.${source}&is_active=eq.true&or=(fetched_at.lt.${since},fetched_at.is.null)`;
  const res = await fetch(`${base}/api/database/records/jobs?${q}`, {
    method: 'PATCH',
    headers: { ...pgHeaders(), Prefer: 'return=minimal' },
    body: JSON.stringify({ is_active: false }),
  });
  // Deactivation is best-effort — never fail the whole sync over it.
  return res.ok;
}

export default async function (req) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const base = Deno.env.get('INSFORGE_BASE_URL');
  const key = Deno.env.get('API_KEY');
  if (!base || !key) {
    return new Response(JSON.stringify({ error: 'INSFORGE_BASE_URL / API_KEY missing' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const syncStart = new Date().toISOString();
  const summary = {};

  for (const [source, fetcher] of Object.entries(FETCHERS)) {
    try {
      const rows = await fetcher();
      const upserted = await upsertJobs(rows);
      await deactivateStale(source, syncStart);
      summary[source] = { fetched: rows.length, upserted };
    } catch (err) {
      summary[source] = { error: String(err?.message || err) };
    }
  }

  const total = Object.values(summary).reduce((n, s) => n + (s.upserted || 0), 0);
  return new Response(JSON.stringify({ ok: true, synced_at: syncStart, total, sources: summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
