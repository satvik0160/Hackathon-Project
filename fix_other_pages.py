import sys
import glob

files = glob.glob('frontend/src/pages/**/*.jsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()

    # Generic replacements
    content = content.replace("color: '#fff'", "color: 'var(--text-main)'")
    content = content.replace("color: '#000'", "color: 'var(--text-main)'")
    content = content.replace("color: '#ffffff'", "color: 'var(--text-main)'")
    content = content.replace("backgroundColor: '#0a0a0a'", "backgroundColor: 'var(--bg-page)'")
    content = content.replace("backgroundColor: '#111827'", "backgroundColor: 'var(--surface-1)'")
    
    # Specific replacements
    if 'DailyPlanner.jsx' in file:
        content = content.replace("display: 'flex', flexWrap: 'wrap'", "display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: '16px'")
        
    if 'Roadmap.jsx' in file:
        content = content.replace("height: '90vh'", "height: 'calc(100dvh - 200px)'")
        
    if 'AICareerGuidance.jsx' in file:
        content = content.replace("height: 'calc(100vh - 80px)'", "height: 'calc(100dvh - 120px)'")
        
    if 'AIResume.jsx' in file:
        content = content.replace("gridTemplateColumns: '1fr 1fr'", "gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'")
        
    if 'MockInterview.jsx' in file:
        content = content.replace("gridTemplateColumns: '1fr 1fr'", "gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'")
        
    if 'TestQuiz.jsx' in file:
        content = content.replace("gridTemplateColumns: 'repeat(4, 1fr)'", "gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'")
        # Disable mobile block
        content = content.replace("if (isMobile) {", "if (false) {")
        
    if 'Profile.jsx' in file:
        content = content.replace("gridTemplateColumns: '1fr 2fr'", "gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'")

    with open(file, 'w') as f:
        f.write(content)

print("Other pages fixed")
