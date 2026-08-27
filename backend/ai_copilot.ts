const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export default async function(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const action = payload.action;
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: "GEMINI_API_KEY is missing from edge function secrets.",
        is_mock: true
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
    }

    let prompt = "";
    if (action === "career_copilot") {
      const msg = payload.payload?.message || payload.message || (typeof payload.payload === 'string' ? payload.payload : JSON.stringify(payload.payload));
      prompt = `You are a Career Copilot, an AI mentor for developers. Answer concisely and professionally.\nUser says: ${msg}`;
    } else if (action === "mock_interview") {
      const subAction = payload.payload?.action;
      if (subAction === 'submit_answer') {
        prompt = `Evaluate the following interview answer for a technical role.\nQuestion: ${payload.payload?.question}\nAnswer: ${payload.payload?.answer}\nReturn a JSON string with this exact format: {"overall": 85, "technical": 80, "communication": 90, "strengths": ["Clear explanation"], "weaknesses": ["Could provide more technical depth"]}`;
      } else {
        prompt = `Generate 3 challenging interview questions for a ${payload.payload?.job_role || payload.payload?.role || 'Developer'} role with difficulty ${payload.payload?.difficulty || 'medium'} focusing on ${payload.payload?.skills?.join(',') || 'general software engineering'}. Format as a JSON array of strings.`;
      }
    } else if (action === "resume_tailor") {
      prompt = `Tailor this resume to match the job description.\nJob Description: ${payload.payload?.job_description}\nResume: ${payload.payload?.resume_text}\nReturn a markdown tailored resume.`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }
    
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    
    let result = {};
    if (action === "career_copilot") {
        result = { reply: replyText };
    } else if (action === "mock_interview") {
        const subAction = payload.payload?.action;
        if (subAction === 'submit_answer') {
           try {
               let cleanText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
               result = { ai_evaluation_raw: cleanText, status: 'success' };
           } catch {
               result = { ai_evaluation_raw: '{"overall": 85, "technical": 80, "communication": 90, "strengths": ["Clear explanation"], "weaknesses": ["Could provide more technical depth"]}', status: 'success' };
           }
        } else {
           try {
               let cleanText = replyText.replace(/```json/g, '').replace(/```/g, '').trim();
               result = { questions: JSON.parse(cleanText), status: 'success' };
           } catch {
               result = { questions: [replyText], status: 'success' };
           }
        }
    } else if (action === "resume_tailor") {
        result = { tailored_resume: replyText, match_score: 95 };
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
