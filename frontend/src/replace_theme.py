import os
import re

files = [
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/Profile.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/Settings.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/jobs/Jobs.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/learning/LearningResources.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/learning/DailyPlanner.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/learning/Roadmap.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/ai/AICareerGuidance.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/ai/AIResume.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/ai/MockInterview.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/assessments/SkillTests.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/assessments/TestQuiz.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/dashboard/Achievements.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/dashboard/Analytics.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/admin/InstitutionDashboard.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/admin/IndustryDashboard.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/pages/onboarding/Onboarding.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/components/auth/LoginForm.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/components/auth/RegisterForm.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/components/auth/ForgotPasswordModal.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/components/auth/ParticleCanvas.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/components/common/DevAstraPreloader.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/components/features/CareerCopilot.jsx",
    "/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/components/layout/ErrorBoundary.jsx"
]

replacements = [
    (r'bg-\[\#050811\]', 'bg-neutral-950'),
    (r'bg-\[\#090d16\]', 'bg-neutral-950'),
    (r'bg-\[\#0B101B\]', 'bg-neutral-950'),
    (r'bg-\[\#0F172A\]', 'bg-neutral-950'),
    
    (r'bg-\[\#0B101B\]/60', 'bg-white/[0.03]'),
    (r'bg-\[\#0B101B\]/50', 'bg-white/[0.03]'),
    (r'bg-\[\#0f172a\]/80', 'bg-white/[0.03]'),
    (r'bg-slate-900/80', 'bg-white/[0.03]'),
    
    (r'border-indigo-500', 'border-amber-500/50'),
    (r'border-indigo-400', 'border-amber-400/50'),
    
    (r'text-indigo-400', 'text-amber-400'),
    (r'text-indigo-300', 'text-amber-300'),
    (r'text-indigo-500', 'text-amber-500'),
    
    (r'text-cyan-400', 'text-amber-400'),
    
    (r'bg-indigo-500/10', 'bg-amber-500/[0.08]'),
    
    (r'focus:border-indigo-500', 'focus:border-amber-500/50'),
    (r'focus:ring-indigo-500', 'focus:ring-amber-500/20'),
    
    (r'from-indigo-500 to-cyan-400', 'from-amber-400 to-amber-600'),
    (r'from-indigo-500', 'from-amber-500'),
    (r'to-cyan-400', 'to-amber-600'),
    (r'to-indigo-500', 'to-amber-500'),
    
    (r'(?<!focus:ring-)(?<!focus:border-)(?<!border-)(?<!text-)(?<!from-)(?<!to-)(?<!shadow-)bg-indigo-500(?!\/)', 'bg-gradient-to-r from-amber-500 to-amber-600'),
    (r'hover:bg-indigo-400', 'hover:from-amber-400 hover:to-amber-500'),
    (r'hover:bg-indigo-600', 'hover:from-amber-500 hover:to-amber-600'),
    
    (r'shadow-indigo-500/20', 'shadow-[0_0_15px_rgba(217,175,103,0.2)]'),
    (r'shadow-\[0_0_15px_rgba\(99,102,241,0\.5\)\]', 'shadow-[0_0_15px_rgba(217,175,103,0.3)]'),
    (r'shadow-\w*-?indigo-\d+(/\d+)?', 'shadow-[0_0_15px_rgba(217,175,103,0.2)]'),
    
    (r'stroke="#3b82f6"', 'stroke="#D9AF67"'),
    (r'stroke="#6366f1"', 'stroke="#D9AF67"'),
    (r'fill="#3b82f6"', 'fill="#D9AF67"'),
    (r'fill="#6366f1"', 'fill="#D9AF67"'),
    
    (r'stroke="#e5e7eb"', 'stroke="rgba(255,255,255,0.08)"'),
    (r"fill: '#6b7280'", "fill: '#a3a3a3'")
]

changed_files = []
skipped_files = []

for file_path in files:
    if not os.path.exists(file_path):
        skipped_files.append((file_path, "File not found"))
        continue
        
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
        
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        changed_files.append(file_path)
    else:
        skipped_files.append((file_path, "No changes needed"))

print("CHANGED:")
for f in changed_files:
    print(f)
print("\nSKIPPED:")
for f, r in skipped_files:
    print(f"{f} - {r}")
