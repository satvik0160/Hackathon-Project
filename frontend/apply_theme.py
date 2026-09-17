import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    original = content

    # 1. Backgrounds & Layout Colors
    content = re.sub(r'bg-slate-950', 'bg-[#f8faff]', content)
    content = re.sub(r'bg-neutral-950', 'bg-[#f8faff]', content)
    content = re.sub(r'bg-slate-900', 'bg-white', content)
    content = re.sub(r'bg-neutral-900', 'bg-white', content)
    content = re.sub(r'bg-slate-800', 'bg-slate-50', content)
    content = re.sub(r'bg-black/40', 'bg-white/80', content)
    content = re.sub(r'bg-black/20', 'bg-slate-100', content)
    content = re.sub(r'bg-black', 'bg-white', content)
    content = re.sub(r'bg-slate-50\b', 'bg-[#f8faff]', content) # Enforce very subtle blue tint

    # 2. Text colors
    content = re.sub(r'text-white', 'text-slate-800', content)
    content = re.sub(r'text-slate-200', 'text-slate-700', content)
    content = re.sub(r'text-slate-300', 'text-slate-600', content)
    content = re.sub(r'text-slate-400', 'text-slate-500', content)
    content = re.sub(r'text-slate-50\b', 'text-slate-900', content)

    # 3. Borders
    content = re.sub(r'border-slate-800', 'border-blue-100', content)
    content = re.sub(r'border-slate-700', 'border-slate-200', content)
    content = re.sub(r'border-white/10', 'border-blue-100', content)
    content = re.sub(r'border-white/20', 'border-purple-100', content)

    # 4. Color System Enforcement (Blue, Purple primary)
    content = re.sub(r'indigo-400', 'blue-500', content)
    content = re.sub(r'indigo-500', 'blue-600', content)
    content = re.sub(r'sky-400', 'blue-500', content)
    content = re.sub(r'sky-500', 'blue-600', content)
    content = re.sub(r'amber-400', 'orange-500', content)
    content = re.sub(r'amber-500', 'orange-600', content)
    
    # 5. Fixes for text-slate-800 inside primary buttons (they should remain white text)
    # This is a bit tricky, so we'll just fix known button classes.
    content = re.sub(r'bg-blue-600 text-slate-800', 'bg-blue-600 text-white', content)
    content = re.sub(r'bg-blue-500 text-slate-800', 'bg-blue-500 text-white', content)
    content = re.sub(r'bg-purple-600 text-slate-800', 'bg-purple-600 text-white', content)
    
    # 6. Specific thematic elements (cards)
    # If there are classes like 'card', ensure they are light.
    # The prompt says: "Cards: White, Slightly off-white, Subtle colored borders, Soft shadows"
    # We will replace basic border-slate-200 with border-blue-50 to make it "subtle colored borders"
    content = re.sub(r'border-slate-200', 'border-blue-50', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))
