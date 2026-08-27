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
            prompt = f"Tailor this resume to match the job description.\nJob Description: {payload.get('job_description')}\nResume: {payload.get('resume_text')}\nReturn a markdown tailored resume. On the very first line, output only a number 0-100 representing the match score, then a newline, then the resume."
            
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

        return JSONResponse(
            content={"data": result},
            status_code=200
        )

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=400
        )
