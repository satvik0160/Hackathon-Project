const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function (req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const action = payload.action;
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({
        error: 'GEMINI_API_KEY is missing from edge function secrets.',
        is_mock: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    let prompt = '';

    if (action === 'career_copilot') {
      const msg = payload.payload?.message || payload.message || (typeof payload.payload === 'string' ? payload.payload : JSON.stringify(payload.payload));
      prompt = `You are a Career Copilot, an AI mentor for developers. Answer concisely and professionally.\nUser says: ${msg}`;

    } else if (action === 'mock_interview') {
      const subAction = payload.payload?.action;
      if (subAction === 'submit_answer') {
        prompt = `Evaluate the following interview answer for a technical role.\nQuestion: ${payload.payload?.question}\nAnswer: ${payload.payload?.answer}\nReturn a JSON string with this exact format (no markdown fences): {"overall": 85, "technical": 80, "communication": 90, "strengths": ["Clear explanation"], "weaknesses": ["Could provide more technical depth"]}`;
      } else {
        prompt = `Generate 3 challenging interview questions for a ${payload.payload?.job_role || payload.payload?.role || 'Developer'} role with difficulty ${payload.payload?.difficulty || 'medium'} focusing on ${payload.payload?.skills?.join(',') || 'general software engineering'}. Format as a JSON array of strings with no markdown fences.`;
      }

    } else if (action === 'resume_tailor') {
      const target = payload.payload?.job_description || payload.payload?.target_role;
      prompt = `You are an expert ATS resume writer.\nYour task is to improve and tailor this resume to match the target role/job description: ${target}\n\nOriginal Resume:\n${payload.payload?.resume_text}\n\nCRITICAL INSTRUCTIONS:\n1. Do NOT fabricate or hallucinate any data. Do not add experience, skills, jobs, degrees, or qualifications not explicitly present.\n2. Do NOT drop any existing data! Preserve all historical data, jobs, bullet points, and contact info, but improve the phrasing and formatting for ATS.\n3. Rephrase and restructure to emphasize information relevant to the target role.\n4. At the very end of the resume, add a new distinct section titled '### AI Recommendations for Future' and list 3-5 specific new skills, projects, or certifications the user should learn/build in the future to make their resume much stronger for this role.\n\nReturn a markdown tailored resume. On the very first line, output ONLY a number 0-100 representing the match score, then a newline, then the complete markdown resume.`;

    } else if (action === 'resume_analyze') {
      const targetRole = payload.payload?.target_role || 'general';
      prompt = `You are an expert ATS (Applicant Tracking System) analyzer and senior technical recruiter.\nAnalyze the following resume explicitly for a '${targetRole}' role. Provide highly detailed feedback.\n1. Give an ATS match score (0-100).\n2. List at least 5 specific points where the resume lags (weaknesses).\n3. List the strong points of the resume.\n4. Suggest general improvements to fix the weaknesses.\n5. Suggest what other things the user can add to their resume to make it strong.\n\nCRITICAL INSTRUCTION: Return ONLY a valid JSON string (no markdown fences). Use exactly this structure: {"score": 85, "weaknesses": ["1", "2", "3", "4", "5"], "strengths": ["1", "2"], "improvements": "detailed string", "things_to_add": ["skill 1", "cert 2"]}\n\nResume:\n${payload.payload?.resume_text}`;

    } else if (action === 'analyze_job_url') {
      const jobUrl = payload.payload?.url || payload.url;
      if (!jobUrl) {
        return new Response(JSON.stringify({ error: 'A job URL is required.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      let pageText = '';
      try {
        const pageRes = await fetch(jobUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DevAstra/1.0)' },
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
        return new Response(JSON.stringify({ error: `Could not fetch the job URL: ${e.message}` }), {
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    let result = {};

    if (action === 'career_copilot') {
      result = { reply: replyText };

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
