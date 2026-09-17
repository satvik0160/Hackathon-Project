import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # Common cases in form inputs and specific headings inside modals/forms
    content = content.replace('bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-white', 'bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900')
    content = content.replace('bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-white', 'bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900')
    content = content.replace("text-white placeholder-slate-500", "text-slate-900 placeholder-slate-400")
    
    # For RegisterForm / LoginForm dynamic classes
    content = content.replace("rounded-xl px-4 py-2.5 text-white placeholder-slate-500", "rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400")
    content = content.replace("rounded-xl px-4 py-3 text-white placeholder-slate-500", "rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400")
    
    # "text-slate-500 hover:text-white" -> "text-slate-500 hover:text-slate-900"
    content = content.replace("hover:text-white", "hover:text-slate-900")
    # Except if it's on a primary button where we WANT it to be white, but usually that's just `text-white` not `hover:text-white`
    
    # Specific modal texts
    content = content.replace('text-xl font-bold text-white mb-2', 'text-xl font-bold text-slate-900 mb-2')
    content = content.replace('text-white font-medium">{email}', 'text-slate-900 font-medium">{email}')
    content = content.replace('font-bold text-white focus:outline-none', 'font-bold text-slate-900 focus:outline-none')
    
    # shadow-[0_0_15px_rgba(217,175,103,0.3)] which is the old amber glow
    content = content.replace('shadow-[0_0_15px_rgba(217,175,103,0.3)]', 'shadow-sm')
    
    # text-white tracking-widest in devAstraPreloader might need text-slate-900? Let's be careful.
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Fixed {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file(os.path.join(root, file))
