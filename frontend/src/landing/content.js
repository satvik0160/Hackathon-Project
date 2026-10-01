/**
 * Every piece of copy and sample data on the landing page, in one place.
 *
 * The text here is lifted verbatim from the previous landing page and from
 * LANDING_PAGE_INVENTORY.md — none of it is invented, and the numbers are all
 * illustrative sample data, which is why every panel that shows them carries
 * the "illustrative demo figures — not verified" label.
 */

export const GITHUB_REPO_URL = 'https://github.com/satvik0160/devastra';

/** The single disclaimer used wherever sample data appears. */
export const ILLUSTRATIVE_NOTE = 'Illustrative demo figures — not verified';

export const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#audience', label: "Who it's for" },
];

export const HERO = {
  eyebrow: 'Academia–Industry Skill Platform',
  lineOne: 'Master your skills.',
  lineTwo: 'Shape your career.',
  lede:
    'DevAstra closes the gap between what your syllabus covers and what industry actually hires for — AI coaching, deterministic job matching and progress that keeps you showing up.',
  body:
    'Assess your real skill level, get matched to live roles on evidence rather than keywords, and hand your institution the analytics to fix the curriculum behind you.',
  primaryCta: { label: 'Get Started', to: '/register' },
  secondaryCta: { label: 'See how it works', href: '#how-it-works' },
  chips: ['React 19 + Vite', 'Postgres + RLS', 'Serverless Architecture'],
  /** The three parts of the Signal object, in product order. */
  signalParts: [
    {
      id: 'assessed',
      label: 'ASSESSED',
      description: 'Evidence gathered from adaptive skill assessments.',
    },
    {
      id: 'growth',
      label: 'GROWTH PATH',
      description: 'The route Dhruv builds from the gaps it finds.',
    },
    {
      id: 'match',
      label: 'ROLE MATCH',
      description: 'The roles that assessed evidence qualifies you for.',
    },
  ],
  skills: ['React', 'TypeScript', 'Node.js', 'SQL'],
};

export const STATS = [
  { id: 'assessment', value: 'Adaptive', label: 'Skill Assessment', icon: 'Target', description: 'Tests that adjust to your level in real time' },
  { id: 'matching', value: 'Explainable', label: 'Skill-to-Role Matching', icon: 'Briefcase', description: 'Every match traces back to a verified skill' },
  { id: 'coaching', value: 'Dhruv AI', label: 'Career Coaching', icon: 'Brain', description: 'Mock interviews, resume tailoring, gap analysis' },
  { id: 'analytics', value: 'Cohort', label: 'Skill-Gap Analytics', icon: 'TrendingUp', description: 'Curriculum gaps surfaced before placement season' },
];

export const PROBLEM = {
  eyebrow: 'The problem',
  titleLead: 'Graduates are not underqualified. They are',
  titleAccent: 'unverified',
  paragraphs: [
    'Curricula move in years; industry hiring moves in months. Students graduate with transcripts that say nothing about whether they can actually do the job, and institutions have no early signal that a skill has stopped being relevant.',
    'The result is a widening gap that hurts everyone: students apply blind, recruiters screen on guesswork, and colleges find out too late — after the placement numbers come in.',
  ],
  /** Labels for the 3D comparison — concepts named in the copy above. */
  diagram: {
    curriculum: 'CURRICULUM — MOVES IN YEARS',
    demand: 'INDUSTRY DEMAND — MOVES IN MONTHS',
    gap: 'VERIFICATION GAP',
    phases: [
      {
        id: 'drift',
        label: 'Curricula and hiring drift apart',
        detail: 'A syllabus is revised in years. The roles it feeds are re-written in months.',
      },
      {
        id: 'gap',
        label: 'The mismatch becomes a verification gap',
        detail: 'Nothing on a transcript says whether the graduate can do the job today.',
      },
      {
        id: 'close',
        label: 'Assessed evidence closes it',
        detail: 'Every requirement is pinned to the skill that satisfies it — verifiable, not asserted.',
      },
    ],
  },
};

export const STEPS = [
  {
    id: 'assess',
    index: '01',
    title: 'Assess & Baseline',
    icon: 'Target',
    photo: '/images/step-assess.jpg',
    photoAlt: 'Developer writing code during a timed DevAstra skill assessment',
    body:
      'Take adaptive assessments to map your current skill tree. No more guessing—know exactly where you stand against industry standards.',
  },
  {
    id: 'grow',
    index: '02',
    title: 'AI-Guided Growth',
    icon: 'Brain',
    photo: '/images/step-ai.jpg',
    photoAlt: 'Illustration of AI-guided coaching building a personalised learning roadmap',
    body:
      'Dhruv, your AI Career Copilot, identifies your gaps and builds a personalized daily roadmap to make you job-ready.',
  },
  {
    id: 'match',
    index: '03',
    title: 'Deterministic Matching',
    icon: 'Building2',
    photo: '/images/step-match.jpg',
    photoAlt: 'Candidate and recruiter meeting after an evidence-based role match',
    body:
      'Get matched to live industry roles based on verifiable evidence rather than keyword-stuffed resumes.',
  },
];

export const ENGINES = {
  eyebrow: 'What DevAstra does',
  titleLead: 'Four engines, one',
  titleAccent: 'verifiable',
  titleTail: 'skill signal.',
  lede:
    'Each engine feeds the next: assessments build your skill tree, the skill tree drives matching, coaching closes the gaps, and the analytics loop back to the curriculum.',
  items: [
    {
      id: 'copilot',
      index: '01',
      eyebrow: 'AI Career Copilot',
      icon: 'Brain',
      title: 'Meet Dhruv — your copilot for interviews and resumes',
      body:
        'Dhruv runs realistic mock interviews and scores every answer, then tailors your resume to the exact role you are targeting. It is the same coach at 2am as it is the day before a placement drive.',
      bullets: [
        'Mock interviews with per-answer scoring on structure, depth and clarity',
        'Resume rewritten against a specific job description, not generic advice',
        'Powered by advanced AI models',
      ],
      mock: {
        role: 'Mock interview · Frontend Engineer',
        question: 'Walk me through how you would optimise a slow-rendering React list.',
        answer:
          'Virtualise the rows, memoise the item component, and move filtering off the render path.',
        feedback: 'Strong answer. Structure 82 · Depth 74 · Clarity 88 — resume tailored below.',
      },
    },
    {
      id: 'matching',
      index: '02',
      eyebrow: 'Deterministic Job Matching',
      icon: 'Target',
      title: 'Your skill tree, mapped to live industry roles',
      body:
        'No keyword guessing. DevAstra diffs your assessed skill tree against real role requirements, so every match is explainable — you can see precisely which skill earned you the match, and which one is holding you back.',
      bullets: [
        'Matches derived from assessed skills, never from resume keywords',
        'A visible gap list telling you exactly what to learn next',
        'Explainable match scores you can defend in an interview',
      ],
      mock: {
        skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'System Design'],
        roles: [
          { name: 'Frontend Engineer', meta: 'Bengaluru · Full-time', score: 92 },
          { name: 'Full Stack Developer', meta: 'Remote · Full-time', score: 78 },
          { name: 'Data Analyst', meta: 'Hybrid · Internship', score: 61 },
        ],
      },
    },
    {
      id: 'gamification',
      index: '03',
      eyebrow: 'Gamification Engine',
      icon: 'Trophy',
      title: 'Streaks, XP and levels that keep you showing up',
      body:
        'Skill building dies on day four — so progress is engineered to be visible. Daily streaks, XP for completed assessments and leaderboards turn a vague promise to "upskill" into something you actually do again tomorrow.',
      bullets: [
        'Daily streaks with a consistency multiplier',
        'XP, levels and achievements tied to real assessment outcomes',
        'Leaderboards that make progress social, not solitary',
      ],
      mock: {
        streak: '18-day streak',
        streakMeta: 'Consistency multiplier active',
        level: 'Level 7',
        xp: '2,480 XP',
        toNext: '520 XP to Level 8',
        progress: 68,
        board: [
          { rank: 1, name: 'Ananya R.', xp: '12,480' },
          { rank: 2, name: 'You', xp: '11,905' },
          { rank: 3, name: 'Rahul K.', xp: '10,220' },
        ],
      },
    },
    {
      id: 'analytics',
      index: '04',
      eyebrow: 'Institutional Analytics',
      icon: 'BarChart3',
      title: 'Dashboards that expose curriculum gaps',
      body:
        'Universities see the macro picture their syllabus never shows them: which skills their cohort is consistently missing, compared with what hiring partners actually demand. Analytics that turn into a curriculum decision.',
      bullets: [
        'Cohort-wide skill gap detection across departments',
        'Live comparison against industry role requirements',
        'Placement-readiness trends for faculty and administration',
      ],
      mock: {
        cohort: 'CSE · 2026',
        bars: [
          { label: 'DSA', value: 78 },
          { label: 'SQL', value: 64 },
          { label: 'Cloud', value: 31 },
          { label: 'Testing', value: 22 },
        ],
        insightTitle: 'Curriculum gap detected',
        insight: 'Cloud and Testing show the lowest cohort coverage — prioritise these in the next syllabus revision.',
      },
    },
  ],
};

export const AUDIENCE = {
  eyebrow: 'Who is DevAstra for?',
  titleLead: 'One platform.',
  titleAccent: 'Three perspectives.',
  tabs: [
    {
      id: 'students',
      tab: 'For Students',
      icon: 'GraduationCap',
      heading: 'Stop applying blind.',
      body:
        'Build a verifiable skill profile through assessments and mock interviews. Let AI identify your weak spots and give you a clear, personalized roadmap to get hired.',
      bullets: [
        'Prove your skills to employers instantly.',
        'Get matched to jobs you actually qualify for.',
        'AI-driven interview prep and feedback.',
      ],
      photo: '/images/tab-students.jpg',
      photoAlt: 'Students preparing for technical interviews with AI feedback',
      /** Stage of the same signal this perspective sees. */
      signal: [
        { label: 'Verified skill profile', tone: 'gold' },
        { label: 'Personalised roadmap', tone: 'indigo' },
        { label: 'Matched opportunity', tone: 'teal' },
      ],
      signalCaption: 'Your own evidence, from assessment to matched role.',
    },
    {
      id: 'industry',
      tab: 'For Industry',
      icon: 'Building2',
      heading: 'Hire on evidence, not keywords.',
      body:
        'Stop filtering through thousands of identical resumes. See deterministic matching scores based on actual coding assessments and technical interviews.',
      bullets: [
        'Real-time skill verification of candidates.',
        'Post roles and get perfectly matched shortlists.',
        'Reduce time-to-hire and interview overhead.',
      ],
      photo: '/images/tab-industry.jpg',
      photoAlt: 'Recruiters reviewing verified candidate skill evidence',
      signal: [
        { label: 'Verified candidate evidence', tone: 'gold' },
        { label: 'Explainable shortlist', tone: 'indigo' },
        { label: 'Role demand signal', tone: 'teal' },
      ],
      signalCaption: 'Candidate evidence on one side, live role demand on the other.',
    },
    {
      id: 'institutions',
      tab: 'For Institutions',
      icon: 'Users',
      heading: 'Fix the curriculum in real-time.',
      body:
        "Get aggregate analytics on your students' skill gaps compared to current industry demands. Update your syllabus before graduation, not after placement season.",
      bullets: [
        'Macro-level student performance analytics.',
        'Live industry alignment scores.',
        'Better placement rates through early intervention.',
      ],
      photo: '/images/tab-institutions.jpg',
      photoAlt: 'Faculty reviewing cohort-wide skill gap analytics',
      signal: [
        { label: 'Cohort skill patterns', tone: 'gold' },
        { label: 'Gap detection', tone: 'indigo' },
        { label: 'Curriculum alignment', tone: 'teal' },
      ],
      signalCaption: 'Cohort patterns in, a curriculum decision out.',
    },
  ],
};

/**
 * What each pinned 3D scene is showing, in words.
 *
 * The scenes ARE the chapters' main illustration, so every one of them is
 * named and explained in the DOM as well as drawn in WebGL — nobody should
 * have to guess what the object in front of them represents. Nothing here
 * describes a capability the copy above it does not already state; it only
 * says which parts of the diagram mean what.
 */
export const SCENES = {
  problem: {
    tag: 'Two rails, one gap',
    text: 'The top rail is what a syllabus teaches, revised in years; the bottom rail is what industry hires for, rewritten in months. The wedge between them is the verification gap — and the gold lines are assessed evidence pinning each requirement to the skill that satisfies it.',
  },
  stations: {
    tag: 'One signal, three stations',
    text: 'The signal starts where your skills are measured, branches along the route Dhruv builds for the gaps it finds, then arrives as evidence on the roles it qualifies you for.',
  },
  engines: {
    copilot: 'Dhruv\u2019s interview console: three dials scoring the answer on structure, depth and clarity.',
    matching: 'Five assessed skills wired to three live roles — every line is one skill earning its match.',
    gamification: 'The XP ring, the level block and the streak orbit behind the weekly board.',
    analytics: 'Four cohort columns measured against the industry demand bar.',
  },
};

export const FINAL_CTA = {
  eyebrow: 'For students, institutions and industry',
  titleLead: 'Stop guessing where you stand.',
  titleAccent: 'Prove it instead.',
  body:
    'Create your free account, take your first skill assessment, and see the roles your current skill tree actually qualifies you for.',
  primaryCta: { label: 'Sign Up free', to: '/register' },
  secondaryCta: { label: 'Log In', to: '/login' },
};

export const FOOTER = {
  brand:
    'An AI-powered academia–industry skill intelligence platform. Built for the future of work.',
  exploreLinks: [
    { href: '#problem', label: 'The gap' },
    { href: '#features', label: 'Features' },
  ],
  getStartedLinks: [
    { to: '/login', label: 'Log In' },
    { to: '/register', label: 'Create an account' },
  ],
  tagline: 'Master Your Skills. Shape Your Career.',
};
