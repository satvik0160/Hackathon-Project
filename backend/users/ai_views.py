import json
import random
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from django.conf import settings

# In a real setup, import google.generativeai as genai
has_api_key = False

def get_generative_model():
    pass

class MockInterviewEngineView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        action = request.data.get('action')
        
        if action == 'start_interview':
            role = request.data.get('role', 'Developer')
            if not has_api_key:
                return Response({
                    "interview_id": "mock_123",
                    "questions": [
                        f"Tell me about a time you solved a complex problem as a {role}.",
                        f"How do you keep your skills sharp given your career goal of {request.user.career_goal}?",
                        f"What is the most challenging technical project you've completed, and what did you learn?"
                    ]
                })

        elif action == 'submit_answer':
            answer = request.data.get('answer', '')
            question = request.data.get('question', '')
            if not has_api_key:
                word_count = len(answer.split())
                is_good = word_count > 20
                
                overall = random.randint(80, 95) if is_good else random.randint(50, 70)
                tech = overall - random.randint(0, 5)
                comm = overall + random.randint(0, 5)
                
                strengths = ["Structured approach", "Confident communication"] if is_good else ["Attempted the question"]
                weaknesses = ["Could dive deeper into specifics"] if is_good else ["Answer was far too brief", "Lacked technical terminology", "Felt rushed"]
                
                if "react" in answer.lower() or "python" in answer.lower():
                    strengths.append("Good mention of specific technologies")

                return Response({
                    "ai_evaluation_raw": json.dumps({
                        "overall": overall,
                        "technical": tech,
                        "communication": comm,
                        "strengths": strengths,
                        "weaknesses": weaknesses
                    })
                })
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)

class AIResumeTailorView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        target_role = request.data.get('target_role', 'Professional')
        user_skills = request.user.skills
        
        if not has_api_key:
            skills_str = ", ".join(user_skills.keys()) if isinstance(user_skills, dict) and user_skills else "modern software development methodologies"
            
            resume_markdown = f"### Professional Summary\n\nHighly driven and results-oriented **{target_role}** (Currently pursuing {request.user.career_goal}). Proven ability to leverage expertise in **{skills_str}** to solve complex problems and deliver high-quality solutions.\n\n"
            resume_markdown += f"**Key Value Proposition for {target_role} Roles:**\n"
            resume_markdown += f"- Continuously upskilling in high-demand technologies\n"
            resume_markdown += f"- Strong analytical foundation developed through rigorous academic and project work\n"
            resume_markdown += f"- Adaptable team player ready to contribute immediately to production environments."
            
            return Response({
                "status": "success",
                "resume_markdown": resume_markdown,
                "ats_score_estimate": random.randint(88, 98)
            })

class CareerCopilotChatbotView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user_query = request.data.get('query', '').lower()
        goal = request.user.career_goal or "Professional"
        name = request.user.username or "there"
        
        if not has_api_key:
            reply = f"That is an interesting question, {name}."
            
            if "hello" in user_query or "hi" in user_query:
                reply = f"Hello {name}! I am your AI Career Copilot. How can I help you reach your goal of becoming a {goal} today?"
            elif "salary" in user_query or "pay" in user_query:
                reply = f"When aiming for a {goal} role, entry-level salaries typically range from $70k-$90k depending on the market. Building a strong portfolio is the best way to negotiate higher!"
            elif "skills" in user_query or "learn" in user_query:
                reply = f"To become a highly competitive {goal}, you should focus heavily on the core skills listed in your 'Skill Profile'. Mastering just 2-3 of those deeply will set you apart from other candidates, {name}."
            elif "resume" in user_query or "cv" in user_query:
                reply = f"I'd highly recommend using our **AI Resume Tailor** tool. It will automatically re-write your experience to highlight exactly what hiring managers for {goal} positions are looking for."
            elif "interview" in user_query:
                reply = f"Interviews for {goal} positions can be tough. Have you tried our **Mock Interview Engine**? It simulates real technical questions tailored directly to your profile."
            else:
                reply = f"That's a great question about '{request.data.get('query')}'. Based on your profile ({goal}), I recommend focusing on building practical projects to showcase those specific abilities. You can also review your Daily Planner to make sure you are allocating enough time!"

            return Response({
                "reply": reply,
                "security_context_applied": True
            })

