import os
import glob
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # Backgrounds
    content = content.replace('bg-neutral-950/80', 'bg-white')
    content = content.replace('bg-neutral-950', 'bg-slate-50')
    content = content.replace('bg-black/20', 'bg-slate-50')
    content = content.replace('bg-black/50', 'bg-slate-100')
    content = content.replace('bg-black/60', 'bg-slate-900/20')
    content = content.replace('bg-black', 'bg-white')
    content = content.replace('bg-white/5', 'bg-slate-50')
    content = content.replace('bg-white/10', 'bg-slate-100')
    content = content.replace('bg-neutral-900', 'bg-slate-100')
    content = content.replace('bg-[#0f172a]', 'bg-white')
    
    # Borders
    content = content.replace('border-white/10', 'border-slate-200')
    content = content.replace('border-white/[0.08]', 'border-slate-200')
    content = content.replace('border-white/[0.06]', 'border-slate-200')
    content = content.replace('border-white/5', 'border-slate-200')
    content = content.replace('border-white/20', 'border-slate-300')
    
    # Text colors
    content = content.replace('text-slate-400', 'text-slate-500')
    content = content.replace('text-slate-300', 'text-slate-700')
    content = content.replace('text-slate-200', 'text-slate-700')
    
    # Amber/Indigo to Sky/Violet for consistency with light mode Enterprise theme
    content = content.replace('amber-400', 'sky-600')
    content = content.replace('amber-500', 'sky-600')
    content = content.replace('amber-300', 'sky-700')
    content = content.replace('indigo-400', 'violet-600')
    content = content.replace('indigo-500', 'violet-600')
    
    # Shadows
    content = content.replace('shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]', 'shadow-sm')
    
    # Text-white to slate-900? This is tricky because text-white on primary buttons should stay white.
    # We will ONLY replace text-white if it's accompanied by text-white/X or specific cases.
    content = content.replace('text-white/40', 'text-slate-400')
    content = content.replace('text-white/80', 'text-slate-600')
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.css'):
            process_file(os.path.join(root, file))
