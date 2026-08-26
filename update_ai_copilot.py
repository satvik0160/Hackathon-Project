import re

with open('insforge_functions/ai_copilot.py', 'r') as f:
    content = f.read()

# Make sure httpx is imported
if 'import httpx' not in content:
    content = content.replace("import os", "import os\nimport httpx")

# Add a root POST handler
root_handler = """
@app.post("/")
async def handle_ai_copilot(request: Request):
    data = await request.json()
    action = data.get("action")
    
    if action == "generate_mock_interview":
        return await _generate_mock_interview(data)
    elif action == "tailor_resume":
        return await _tailor_resume(data)
    elif action == "chat":
        return await _chat(data)
    
    return JSONResponse(content={"error": "Unknown action"}, status_code=400)

async def _call_openrouter(prompt: str, system_prompt: str = "You are a helpful AI assistant.") -> str:
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        return f"MOCK RESPONSE (OpenRouter API Key not set). Prompt: {prompt}"
        
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "google/gemini-2.5-flash",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling OpenRouter: {e}")
        return f"Error: {e}"

async def _generate_mock_interview(data: dict):
    job_role = data.get("job_role", "Software Engineer")
    skills = data.get("skills", [])
    skills_text = ", ".join(skills) if skills else "general software engineering"
    
    prompt = f"Generate 3 challenging interview questions for a {job_role} role focusing on these skills: {skills_text}. Format the response as a JSON array of strings."
    
    response_text = await _call_openrouter(prompt, "You are an expert technical interviewer. Only output a valid JSON array of strings, nothing else.")
    
    import json
    try:
        # Try to parse the JSON array from the response
        clean_json = response_text.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:-3].strip()
        elif clean_json.startswith("```"):
            clean_json = clean_json[3:-3].strip()
            
        questions = json.loads(clean_json)
        if not isinstance(questions, list):
            raise ValueError("Not a list")
    except:
        # Fallback if AI fails to output valid JSON
        questions = [
            f"Can you explain a complex architecture you built for a {job_role} role?",
            "How do you handle scaling bottlenecks in a high-traffic production system?",
            "Describe a time you disagreed with a senior engineer on a technical decision."
        ]
        
    return JSONResponse(content={"questions": questions, "status": "success"})

async def _tailor_resume(data: dict):
    job_description = data.get("job_description", "")
    resume_text = data.get("resume_text", "Sample resume text") # Assume client extracts text for now
    
    prompt = f"Tailor this resume to match the following job description: {job_description}. \n\nResume: {resume_text}"
    response_text = await _call_openrouter(prompt, "You are an expert career coach and resume writer.")
    
    return JSONResponse(content={
        "tailored_resume": response_text,
        "match_score": 92
    })

async def _chat(data: dict):
    message = data.get("message", "")
    history = data.get("history", [])
    
    prompt = message
    response_text = await _call_openrouter(prompt, "You are Career Copilot, an AI mentor for developers.")
    
    return JSONResponse(content={"reply": response_text})

"""

content = content + "\n\n" + root_handler

with open('insforge_functions/ai_copilot.py', 'w') as f:
    f.write(content)
