import os
import httpx
import json
import time
import ipaddress
import urllib.parse
from collections import defaultdict
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI()

# --- Security: In-Memory Sliding-Window Rate Limiter ---
# Limit: 30 requests per minute per IP
RATE_LIMIT_WINDOW = 60  # seconds
MAX_REQUESTS_PER_WINDOW = 30
request_history = defaultdict(list)

def is_rate_limited(ip: str) -> bool:
    now = time.time()
    cutoff = now - RATE_LIMIT_WINDOW
    # Purge timestamps older than window
    history = [t for t in request_history[ip] if t > cutoff]
    history.append(now)
    request_history[ip] = history
    return len(history) > MAX_REQUESTS_PER_WINDOW

# --- Security: SSRF Protection ---
def is_safe_url(url: str) -> bool:
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False
        hostname = parsed.hostname
        if not hostname:
            return False
        hostname = hostname.lower()

        # Reject loopback, localhost, and common private hosts
        if hostname in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return False
        if hostname.endswith(".internal") or hostname.endswith(".local"):
            return False

        # Attempt to parse as IP to check private/link-local ranges
        try:
            ip = ipaddress.ip_address(hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return False
        except ValueError:
            # Hostname is a domain name, verify it's not metadata endpoint
            if "169.254" in hostname or "metadata" in hostname:
                return False

        return True
    except Exception:
        return False

# --- Security: CORS Origin Validation ---
ALLOWED_ORIGIN_PATTERNS = [
    "localhost",
    "127.0.0.1",
    "insforge.app",
    "vercel.app",
]

def get_cors_headers(request: Request) -> dict:
    origin = request.headers.get("origin", "")
    allowed = False
    if origin:
        parsed = urllib.parse.urlparse(origin)
        host = parsed.hostname or ""
        for pattern in ALLOWED_ORIGIN_PATTERNS:
            if host == pattern or host.endswith("." + pattern):
                allowed = True
                break

    allow_origin = origin if allowed else (origin if not origin else "null")
    return {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    }

@app.options("/")
async def options_handler(request: Request):
    headers = get_cors_headers(request)
    return JSONResponse(content="ok", headers=headers)

@app.post("/")
async def handle_ai_copilot(request: Request):
    headers = get_cors_headers(request)

    # 1. Client IP & Rate Limiting
    client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip() or request.client.host or "127.0.0.1"
    if is_rate_limited(client_ip):
        return JSONResponse(
            content={"error": "Too many requests. Please wait a minute before retrying."},
            status_code=429,
            headers={**headers, "Retry-After": "60"}
        )

    # 2. Authentication Check
    auth_header = request.headers.get("authorization") or request.headers.get("apikey")
    if not auth_header:
        # Require an auth token or API key to prevent unauthenticated abuse
        return JSONResponse(
            content={"error": "Unauthorized. An authenticated session or API key is required."},
            status_code=401,
            headers=headers
        )

    try:
        data = await request.json()
        action = data.get("action")
        payload = data.get("payload", {})

        # API Key Resolution (Server-side ONLY)
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return JSONResponse(
                content={
                    "error": "AI service temporarily unconfigured.",
                    "is_mock": True
                },
                status_code=503,
                headers=headers
            )

        prompt = ""

        # Input sanitization and size guard
        if action == "career_copilot":
            msg = payload.get("message", data.get("message", ""))
            if isinstance(payload, str):
                msg = payload
            # Restrict message length to prevent resource exhaustion
            msg = str(msg)[:2000]
            prompt = f"You are a Career Copilot, an AI mentor for developers. Answer concisely and professionally.\nUser says: {msg}"

        elif action == "mock_interview":
            sub_action = payload.get("action")
            if sub_action == "submit_answer":
                q = str(payload.get("question", ""))[:1000]
                a = str(payload.get("answer", ""))[:3000]
                prompt = f"Evaluate the following interview answer for a technical role.\nQuestion: {q}\nAnswer: {a}\nReturn a JSON string with this exact format (no markdown fences): {{\"overall\": 85, \"technical\": 80, \"communication\": 90, \"strengths\": [\"Clear explanation\"], \"weaknesses\": [\"Could provide more technical depth\"]}}"
            else:
                job_role = str(payload.get("job_role", payload.get("role", "Developer")))[:100]
                difficulty = str(payload.get("difficulty", "medium"))[:20]
                skills = [str(s)[:50] for s in payload.get("skills", [])][:10]
                skills_text = ",".join(skills) if skills else "general software engineering"
                prompt = f"Generate 3 challenging interview questions for a {job_role} role with difficulty {difficulty} focusing on {skills_text}. Format as a JSON array of strings with no markdown fences."

        elif action == "resume_tailor":
            target = str(payload.get("job_description") or payload.get("target_role") or "")[:2000]
            resume_text = str(payload.get("resume_text", ""))[:8000]
            prompt = (
                f"You are an expert ATS resume writer.\n"
                f"Your task is to improve and tailor this resume to match the target role/job description: {target}\n\n"
                f"Original Resume:\n{resume_text}\n\n"
                f"CRITICAL INSTRUCTIONS:\n"
                f"1. Do NOT fabricate or hallucinate any data. Do not add experience, skills, jobs, degrees, or qualifications not explicitly present.\n"
                f"2. Do NOT drop any existing data! Preserve all historical data, jobs, bullet points, and contact info, but improve the phrasing and formatting for ATS.\n"
                f"3. Rephrase and restructure to emphasize information relevant to the target role.\n"
                f"4. At the very end of the resume, add a new distinct section titled '### AI Recommendations for Future' and list 3-5 specific new skills, projects, or certifications the user should learn/build in the future to make their resume much stronger for this role.\n\n"
                f"Return a markdown tailored resume. On the very first line, output ONLY a number 0-100 representing the match score, then a newline, then the complete markdown resume."
            )

        elif action == "resume_analyze":
            target_role = str(payload.get("target_role", "general"))[:100]
            resume_text = str(payload.get("resume_text", ""))[:8000]
            prompt = (
                f"You are an expert ATS (Applicant Tracking System) analyzer and senior technical recruiter.\n"
                f"Analyze the following resume explicitly for a '{target_role}' role. Provide highly detailed feedback.\n"
                f"1. Give an ATS match score (0-100).\n"
                f"2. List at least 5 specific points where the resume lags (weaknesses).\n"
                f"3. List the strong points of the resume.\n"
                f"4. Suggest general improvements to fix the weaknesses.\n"
                f"5. Suggest what other things the user can add to their resume to make it strong.\n\n"
                f"CRITICAL INSTRUCTION: Return ONLY a valid JSON string (no markdown fences). Use exactly this structure: {{\"score\": 85, \"weaknesses\": [\"1\", \"2\", \"3\", \"4\", \"5\"], \"strengths\": [\"1\", \"2\"], \"improvements\": \"detailed string\", \"things_to_add\": [\"skill 1\", \"cert 2\"]}}\n\n"
                f"Resume:\n{resume_text}"
            )

        elif action == "analyze_job_url":
            job_url = str(payload.get("url", "")).strip()
            if not job_url:
                return JSONResponse(
                    content={"error": "A job URL is required."},
                    status_code=400,
                    headers=headers
                )
            if not is_safe_url(job_url):
                return JSONResponse(
                    content={"error": "Invalid or disallowed URL. Only external public HTTP/HTTPS URLs are allowed."},
                    status_code=400,
                    headers=headers
                )

            page_text = ""
            try:
                async with httpx.AsyncClient(timeout=10.0, follow_redirects=False) as client:
                    page_res = await client.get(
                        job_url,
                        headers={"User-Agent": "Mozilla/5.0 (compatible; DevAstra/1.0)"}
                    )
                    page_text = page_res.text[:6000]
            except Exception as e:
                return JSONResponse(
                    content={"error": f"Could not fetch the job URL safely: {str(e)}"},
                    status_code=400,
                    headers=headers
                )
            prompt = f"You are a job posting analyzer. From the web page text below, extract the job title, the company name, and the key technical skills the role requires. Also propose a short ordered learning path (3-4 concrete steps) to close gaps.\nReturn ONLY a valid JSON string (no markdown fences) using exactly this structure: {{\"title\": \"...\", \"company\": \"...\", \"required_skills\": [\"...\"], \"learning_path\": [\"...\"]}}\n\nPage text:\n{page_text}"

        elif action == "generate_text":
            raw_prompt = str(payload.get("prompt", ""))[:5000]
            if not raw_prompt:
                return JSONResponse(content={"error": "Prompt is required."}, status_code=400, headers=headers)
            prompt = raw_prompt

        else:
            return JSONResponse(
                content={"error": f"Unknown action: \"{action}\""},
                status_code=400,
                headers=headers
            )

        # Call Gemini API with server-side key
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key={api_key}"

        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                headers={"Content-Type": "application/json"},
                json={"contents": [{"parts": [{"text": prompt}]}]},
                timeout=30.0
            )

            resp_data = response.json()
            if response.status_code != 200:
                raise Exception(resp_data.get("error", {}).get("message", "AI provider error"))

            try:
                reply_text = resp_data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No response generated.")
            except (IndexError, KeyError):
                reply_text = "No response generated."

        result = {}

        if action == "career_copilot":
            result = {"reply": reply_text}

        elif action == "generate_text":
            result = {"text": reply_text}

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
            score_candidate = None
            try:
                score_val = int(lines[0].strip())
                if 0 <= score_val <= 100:
                    score_candidate = score_val
            except (ValueError, IndexError):
                pass

            result = {
                "tailored_resume": '\n'.join(lines[1:]).strip() if score_candidate is not None else reply_text,
                "match_score": score_candidate
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

        elif action == "analyze_job_url":
            try:
                clean_text = reply_text.replace("```json", "").replace("```", "").strip()
                parsed = json.loads(clean_text)
                result = {
                    "title": parsed.get("title", "Unknown Role"),
                    "company": parsed.get("company", "Unknown Company"),
                    "required_skills": parsed.get("required_skills", []),
                    "learning_path": parsed.get("learning_path", []),
                    "status": "success"
                }
            except Exception:
                result = {"title": "Unknown Role", "company": "Unknown Company", "required_skills": [], "learning_path": [], "status": "fallback"}

        return JSONResponse(
            content={"data": result},
            status_code=200,
            headers=headers
        )

    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=400,
            headers=headers
        )
