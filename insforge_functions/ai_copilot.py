import os
from insforge import InsforgeClient
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# Initialize InsForge Client
# In production, these are securely injected into the serverless environment
client = InsforgeClient(
    base_url=os.environ.get("INSFORGE_URL", "https://api.insforge.dev"),
    api_key=os.environ.get("INSFORGE_API_KEY", "")
)

@app.post("/ai-mock-interview")
async def generate_mock_interview(request: Request):
    """
    InsForge Serverless Function.
    Generates a personalized mock interview based on the user's role and skills.
    Uses InsForge's native AI Gateway.
    """
    data = await request.json()
    user_id = data.get("user_id")
    job_role = data.get("job_role", "Software Engineer")
    
    # 1. Fetch user profile from InsForge Database
    # (Assuming the client provides async DB querying or we use a sync wrapper)
    # user = client.database.from_table('users').select('*').eq('id', user_id).execute()
    
    prompt = f"You are an expert technical interviewer. Generate 3 challenging interview questions for a {job_role}."
    
    try:
        # 2. Call InsForge Native AI API
        # Using the hypothetical structure of insforge AI module
        # ai_response = client.ai.generate(prompt=prompt, model="gemini-1.5-flash")
        
        # Placeholder response
        mock_questions = [
            f"Can you explain a complex architecture you built for a {job_role} role?",
            "How do you handle scaling bottlenecks in a high-traffic production system?",
            "Describe a time you disagreed with a senior engineer on a technical decision."
        ]
        
        return JSONResponse(content={"questions": mock_questions, "status": "success"})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/tailor-resume")
async def tailor_resume(request: Request):
    """
    InsForge Serverless Function.
    Analyzes a user's resume PDF from InsForge Storage and tailors it to a job description.
    """
    data = await request.json()
    file_path = data.get("resume_file_path")
    job_description = data.get("job_description")
    
    # 1. Download file from InsForge Storage
    # file_data = client.storage.from_bucket("resumes").download(file_path)
    
    # 2. Extract text and prompt AI
    prompt = f"Tailor this resume to match the following job description: {job_description}."
    
    return JSONResponse(content={
        "tailored_resume": "Your tailored resume content will appear here...",
        "match_score": 92
    })
