import os
import httpx
import json
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

@app.options("/")
async def options_handler():
    return JSONResponse(content="ok")

@app.post("/")
async def handle_ai_copilot(request: Request):
    try:
        data = await request.json()
        action = data.get("action")
        api_key = os.environ.get("GEMINI_API_KEY")

        if not api_key:
            return JSONResponse(
                content={
                    "error": "GEMINI_API_KEY is missing from edge function secrets.",
                    "is_mock": True
                }, 
                status_code=500
            )

        prompt = ""
        payload = data.get("payload", {})

        if action == "career_copilot":
            msg = payload.get("message", data.get("message", ""))
            if isinstance(payload, str):
                msg = payload
            prompt = f"You are a Career Copilot, an AI mentor for developers. Answer concisely and professionally.\nUser says: {msg}"
            
        elif action == "mock_interview":
            sub_action = payload.get("action")
            if sub_action == "submit_answer":
                prompt = f"Evaluate the following interview answer for a technical role.\nQuestion: {payload.get('question')}\nAnswer: {payload.get('answer')}\nReturn a JSON string with this exact format (no markdown fences): {{\"overall\": 85, \"technical\": 80, \"communication\": 90, \"strengths\": [\"Clear explanation\"], \"weaknesses\": [\"Could provide more technical depth\"]}}"
            else:
                job_role = payload.get("job_role", payload.get("role", "Developer"))
                difficulty = payload.get("difficulty", "medium")
                skills = payload.get("skills", [])
                skills_text = ",".join(skills) if skills else "general software engineering"
                prompt = f"Generate 3 challenging interview questions for a {job_role} role with difficulty {difficulty} focusing on {skills_text}. Format as a JSON array of strings with no markdown fences."

        elif action == "resume_tailor":
            target = payload.get('job_description') or payload.get('target_role')
            prompt = (
                f"You are an expert ATS resume writer.\n"
                f"Your task is to improve and tailor this resume to match the target role/job description: {target}\n\n"
                f"Original Resume:\n{payload.get('resume_text')}\n\n"
                f"CRITICAL INSTRUCTIONS:\n"
                f"1. Do NOT fabricate or hallucinate any data. Do not add experience, skills, jobs, degrees, or qualifications not explicitly present.\n"
                f"2. Do NOT drop any existing data! Preserve all historical data, jobs, bullet points, and contact info, but improve the phrasing and formatting for ATS.\n"
                f"3. Rephrase and restructure to emphasize information relevant to the target role.\n"
                f"4. At the very end of the resume, add a new distinct section titled '### AI Recommendations for Future' and list 3-5 specific new skills, projects, or certifications the user should learn/build in the future to make their resume much stronger for this role.\n\n"
                f"Return a markdown tailored resume. On the very first line, output ONLY a number 0-100 representing the match score, then a newline, then the complete markdown resume."
            )
            
        elif action == "resume_analyze":
            target_role = payload.get('target_role', 'general')
            prompt = (
                f"You are an expert ATS (Applicant Tracking System) analyzer and senior technical recruiter.\n"
                f"Analyze the following resume explicitly for a '{target_role}' role. Provide highly detailed feedback.\n"
                f"1. Give an ATS match score (0-100).\n"
                f"2. List at least 5 specific points where the resume lags (weaknesses).\n"
                f"3. List the strong points of the resume.\n"
                f"4. Suggest general improvements to fix the weaknesses.\n"
                f"5. Suggest what other things the user can add to their resume to make it strong.\n\n"
                f"CRITICAL INSTRUCTION: Return ONLY a valid JSON string (no markdown fences). Use exactly this structure: {{\"score\": 85, \"weaknesses\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"strengths\": [\"1\", \"2\"], \"improvements\": \"detailed string\", \"things_to_add\": [\"skill 1\", \"cert 2\"]}}\n\n"
                f"Resume:\n{payload.get('resume_text')}"
            )
            
        else:
            return JSONResponse(
                content={"error": f"Unknown action: \"{action}\""},
                status_code=400
            )

        # Call Gemini API
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}]
                },
                timeout=30.0
            )
            
            resp_data = response.json()
            
            if response.status_code != 200:
                raise Exception(json.dumps(resp_data))

            try:
                reply_text = resp_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response generated.")
            except (IndexError, KeyError):
                reply_text = "No response generated."

        result = {}

        if action == "career_copilot":
            result = {"reply": reply_text}
            
        elif action == "mock_interview":
            sub_action = payload.get("action")
            if sub_action == "submit_answer":
                try:
                    clean_text = reply_text.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_text)
                    result = {"ai_evaluation": parsed, "status": "success"}
                except Exception:
                    result = {
                        "ai_evaluation": {
                            "overall": 85, 
                            "technical": 80, 
                            "communication": 90, 
                            "strengths": ["Clear explanation"], 
                            "weaknesses": ["Could provide more technical depth"]
                        },
                        "status": "fallback"
                    }
            else:
                try:
                    clean_text = reply_text.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(clean_text)
                    result = {"questions": parsed, "status": "success"}
                except Exception:
                    result = {"questions": [reply_text], "status": "fallback"}
                    
        elif action == "resume_tailor":
            lines = reply_text.split('\n')
            try:
                score_candidate = int(lines[0].strip())
                has_score = 0 <= score_candidate <= 100
            except ValueError:
                has_score = False
                
            result = {
                "tailored_resume": '\n'.join(lines[1:]).strip() if has_score else reply_text,
                "match_score": score_candidate if has_score else None
            }
            
        elif action == "resume_analyze":
            try:
                clean_text = reply_text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_text)
                result = {"analysis": parsed, "status": "success"}
            except Exception:
                result = {
                    "analysis": {
                        "score": 75,
                        "strengths": ["Basic structure present"],
                        "weaknesses": ["Missing quantifiable achievements", "Generic summary", "Keywords missing for ATS", "Formatting issues", "Lack of relevant projects"],
                        "improvements": "Please tailor your resume more closely to the target role by adding metrics and relevant keywords.",
                        "things_to_add": ["Certifications", "Open source contributions", "Live project links"]
                    },
                    "status": "fallback"
                }

        return JSONResponse(
            content={"data": result},
            status_code=200
        )

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=400
        )
