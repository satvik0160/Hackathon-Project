import sys

with open('frontend/src/pages/onboarding/Onboarding.jsx', 'r') as f:
    content = f.read()

# 1. Root container positioning and overflow
content = content.replace(
    '''className="min-h-screen bg-[var(--bg-page)] py-10 flex flex-col items-center antialiased tracking-tight relative overflow-hidden"''',
    '''className="min-h-[100dvh] bg-[var(--bg-page)] p-4 sm:p-10 flex flex-col items-center justify-center antialiased tracking-tight relative overflow-y-auto overflow-x-hidden"'''
)

# 2. Stepper nodes & width calculation
content = content.replace(
    '''Array.from({ length: TOTAL_STEPS + 1 }''',
    '''Array.from({ length: TOTAL_STEPS }'''
)

content = content.replace(
    '''style={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}''',
    '''style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}'''
)

# Fix track bleed by adding margin or removing the absolute left-0 right-0 issues.
content = content.replace(
    '''<div className="absolute top-1/2 left-0 right-0 h-[3px] bg-[var(--surface-2)] -z-10 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 h-[3px] bg-[var(--primary)] -z-10 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `${((step - 1) / TOTAL_STEPS) * 100}%` }}></div>''',
    '''<div className="absolute top-1/2 left-4 right-4 h-[3px] bg-[var(--surface-2)] -z-10 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-4 h-[3px] bg-[var(--primary)] -z-10 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" style={{ width: `calc(${((step - 1) / (TOTAL_STEPS - 1)) * 100}% - 32px)` }}></div>'''
)

# 3. Hardcoded colors in Quiz
content = content.replace(
    '''inlineStyle = { backgroundColor: '#dcfce7', borderColor: 'var(--success)', borderWidth: '2px', color: '#166534' };''',
    '''inlineStyle = { backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)', borderColor: 'var(--success)', borderWidth: '2px', color: 'var(--success)' };'''
)
content = content.replace(
    '''inlineStyle = { backgroundColor: '#fef2f2', borderColor: 'var(--danger)', borderWidth: '2px', color: '#991b1b' };''',
    '''inlineStyle = { backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)', borderColor: 'var(--danger)', borderWidth: '2px', color: 'var(--danger)' };'''
)

# 4. Active item color was primary-2 and text-main, which might be ok but we can improve.
content = content.replace(
    '''backgroundColor: isSelected ? 'var(--primary-2)' : 'var(--surface-2)',''',
    '''backgroundColor: isSelected ? 'color-mix(in srgb, var(--primary) 10%, transparent)' : 'var(--surface-2)','''
)

with open('frontend/src/pages/onboarding/Onboarding.jsx', 'w') as f:
    f.write(content)
print("Onboarding fixed")
