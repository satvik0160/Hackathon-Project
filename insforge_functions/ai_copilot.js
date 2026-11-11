// In-memory sliding window rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS = 30;

function isRateLimited(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const history = rateLimitMap.get(ip) || [];
  const validHistory = history.filter((t) => t > windowStart);
  validHistory.push(now);
  rateLimitMap.set(ip, validHistory);
  return validHistory.length > MAX_REQUESTS;
}

// SSRF prevention: validate external URL
function isSafeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '0.0.0.0') return false;
    if (hostname.endsWith('.internal') || hostname.endsWith('.local')) return false;
    // Private IPv4 ranges
    if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.)/.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

// CORS headers with origin validation
function getCorsHeaders(req) {
  const origin = req.headers.get('origin') || '';
  const isAllowed = !origin || 
    origin.includes('localhost') || 
    origin.includes('127.0.0.1') || 
    origin.endsWith('.insforge.app') || 
    origin.endsWith('.vercel.app');
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? (origin || '*') : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

export default async function (req) {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Rate Limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: 'Too many requests. Please retry in a minute.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': '60' },
      status: 429,
    });
  }

  // Auth Header Check
  const authHeader = req.headers.get('authorization') || req.headers.get('apikey');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Unauthorized. Authenticated session required.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 401,
    });
  }

  try {
    const payload = await req.json();
    const action = payload.action;
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'AI service temporarily unavailable.',
        is_mock: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 });
    }

    let prompt = '';

    if (action === 'career_copilot') {
      const msg = String(payload.payload?.message || payload.message || '').slice(0, 2000);
      prompt = `You are a Career Copilot, an AI mentor for developers. Answer concisely and professionally.\nUser says: ${msg}`;

    } else if (action === 'generate_text') {
      prompt = String(payload.payload?.prompt || '').slice(0, 5000);

    } else if (action === 'mock_interview') {
      const subAction = payload.payload?.action;
      if (subAction === 'submit_answer') {
        const q = String(payload.payload?.question || '').slice(0, 1000);
        const a = String(payload.payload?.answer || '').slice(0, 3000);
        prompt = `Evaluate the following interview answer for a technical role.\nQuestion: ${q}\nAnswer: ${a}\nReturn a JSON string with this exact format (no markdown fences): {"overall": 85, "technical": 80, "communication": 90, "strengths": ["Clear explanation"], "weaknesses": ["Could provide more technical depth"]}`;
      } else {
        const role = String(payload.payload?.job_role || payload.payload?.role || 'Developer').slice(0, 100);
        const diff = String(payload.payload?.difficulty || 'medium').slice(0, 20);
        const skills = (payload.payload?.skills || []).map((s) => String(s).slice(0, 50)).join(',');
        prompt = `Generate 3 challenging interview questions for a ${role} role with difficulty ${diff} focusing on ${skills || 'general software engineering'}. Format as a JSON array of strings with no markdown fences.`;
      }

    } else if (action === 'resume_tailor') {
      const target = String(payload.payload?.job_description || payload.payload?.target_role || '').slice(0, 2000);
      const resume = String(payload.payload?.resume_text || '').slice(0, 8000);
      prompt = `You are an expert ATS resume writer.\nYour task is to improve and tailor this resume to match the target role/job description: ${target}\n\nOriginal Resume:\n${resume}\n\nCRITICAL INSTRUCTIONS:\n1. Do NOT fabricate or hallucinate any data. Do not add experience, skills, jobs, degrees, or qualifications not explicitly present.\n2. Do NOT drop any existing data! Preserve all historical data, jobs, bullet points, and contact info, but improve the phrasing and formatting for ATS.\n3. Rephrase and restructure to emphasize information relevant to the target role.\n4. At the very end of the resume, add a new distinct section titled '### AI Recommendations for Future' and list 3-5 specific new skills, projects, or certifications the user should learn/build in the future to make their resume much stronger for this role.\n\nReturn a markdown tailored resume. On the very first line, output ONLY a number 0-100 representing the match score, then a newline, then the complete markdown resume.`;

    } else if (action === 'resume_analyze') {
      const targetRole = String(payload.payload?.target_role || 'general').slice(0, 100);
      const resume = String(payload.payload?.resume_text || '').slice(0, 8000);
      prompt = `You are an expert ATS (Applicant Tracking System) analyzer and senior technical recruiter.\nAnalyze the following resume explicitly for a '${targetRole}' role. Provide highly detailed feedback.\n1. Give an ATS match score (0-100).\n2. List at least 5 specific points where the resume lags (weaknesses).\n3. List the strong points of the resume.\n4. Suggest general improvements to fix the weaknesses.\n5. Suggest what other things the user can add to their resume to make it strong.\n\nCRITICAL INSTRUCTION: Return ONLY a valid JSON string (no markdown fences). Use exactly this structure: {"score": 85, "weaknesses": ["1", "2", "3", "4", "5"], "strengths": ["1", "2"], "improvements": "detailed string", "things_to_add": ["skill 1", "cert 2"]}\n\nResume:\n${resume}`;

    } else if (action === 'analyze_job_url') {
      const jobUrl = String(payload.payload?.url || payload.url || '').trim();
      if (!jobUrl || !isSafeUrl(jobUrl)) {
        return new Response(JSON.stringify({ error: 'Valid public HTTP/HTTPS job URL is required.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      let pageText = '';
      try {
        const pageRes = await fetch(jobUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevAstra/1.0)' },
          signal: AbortSignal.timeout(8000),
        });
        const html = await pageRes.text();
        pageText = html
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 6000);
      } catch (e) {
        return new Response(JSON.stringify({ error: `Could not fetch job posting safely: ${e.message}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      prompt = `You are a job posting analyzer. From the web page text below, extract the job title, the company name, and the key technical skills the role requires. Also propose a short ordered learning path (3-4 concrete steps) to close gaps.\nReturn ONLY a valid JSON string (no markdown fences) using exactly this structure: {"title": "...", "company": "...", "required_skills": ["..."], "learning_path": ["..."]}\n\nPage text:\n${pageText}`;

    } else {
      return new Response(JSON.stringify({ error: `Unknown action: "${action}"` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'AI generation failed');
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    let result = {};

    if (action === 'career_copilot') {
      result = { reply: replyText };

    } else if (action === 'generate_text') {
      result = { text: replyText };

    } else if (action === 'mock_interview') {
      const subAction = payload.payload?.action;
      if (subAction === 'submit_answer') {
        try {
          const cleanText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
          result = { ai_evaluation: JSON.parse(cleanText), status: 'success' };
        } catch {
          result = {
            ai_evaluation: { overall: 85, technical: 80, communication: 90, strengths: ['Clear explanation'], weaknesses: ['Could provide more technical depth'] },
            status: 'fallback',
          };
        }
      } else {
        try {
          const cleanText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
          result = { questions: JSON.parse(cleanText), status: 'success' };
        } catch {
          result = { questions: [replyText], status: 'fallback' };
        }
      }

    } else if (action === 'resume_tailor') {
      const lines = replyText.split('\n');
      const scoreCandidate = parseInt(lines[0].trim(), 10);
      const hasScore = !isNaN(scoreCandidate) && scoreCandidate >= 0 && scoreCandidate <= 100;
      result = {
        tailored_resume: hasScore ? lines.slice(1).join('\n').trim() : replyText,
        match_score: hasScore ? scoreCandidate : null,
      };

    } else if (action === 'resume_analyze') {
      try {
        const cleanText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
        result = { analysis: JSON.parse(cleanText), status: 'success' };
      } catch {
        result = {
          analysis: {
            score: 75,
            strengths: ['Basic structure present'],
            weaknesses: ['Missing quantifiable achievements', 'Generic summary', 'Keywords missing for ATS', 'Formatting issues', 'Lack of relevant projects'],
            improvements: 'Please tailor your resume more closely to the target role by adding metrics and relevant keywords.',
            things_to_add: ['Certifications', 'Open source contributions', 'Live project links'],
          },
          status: 'fallback',
        };
      }

    } else if (action === 'analyze_job_url') {
      try {
        const cleanText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);
        result = {
          title: parsed.title || 'Unknown Role',
          company: parsed.company || 'Unknown Company',
          required_skills: parsed.required_skills || [],
          learning_path: parsed.learning_path || [],
          status: 'success',
        };
      } catch {
        result = { title: 'Unknown Role', company: 'Unknown Company', required_skills: [], learning_path: [], status: 'fallback' };
      }
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}
