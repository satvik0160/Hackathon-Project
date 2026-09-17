import re

with open('frontend/src/pages/Landing.jsx', 'r') as f:
    content = f.read()

# 1. Remove nav link
content = re.sub(
    r'\s*<a className="landing-nav-link" href="#sih">\s*SIH 2026\s*</a>',
    '',
    content
)

# 2. Change eyebrow text
content = content.replace(
    'Smart India Hackathon 2026 · PS 26044',
    'Academia–Industry Skill Platform'
)

# 3. Remove SIH credibility strip
content = re.sub(
    r'\s*\{/\* ---------------- SIH 2026 credibility strip ---------------- \*/\}\s*<section id="sih" className="landing-strip">.*?</section>',
    '',
    content,
    flags=re.DOTALL
)

# 4. Update footer description
content = content.replace(
    'Built natively on InsForge\n                for Smart India Hackathon 2026, Problem Statement 26044.',
    'Built natively on InsForge.'
)

# 5. Remove footer link
content = re.sub(
    r'\s*<a className="landing-footer-link" href="#sih">\s*SIH 2026\s*</a>',
    '',
    content
)

# 6. Update copyright
content = content.replace(
    '© {new Date().getFullYear()} DevAstra · SIH 2026',
    '© {new Date().getFullYear()} DevAstra'
)

with open('frontend/src/pages/Landing.jsx', 'w') as f:
    f.write(content)
