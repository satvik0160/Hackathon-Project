import sys

# 1. ForgotPasswordModal.jsx
with open('frontend/src/components/auth/ForgotPasswordModal.jsx', 'r') as f:
    content = f.read()

content = content.replace('bg-[#0f172a]', 'bg-[var(--surface-1)]')
content = content.replace('border-white/10', 'border-[var(--border)]')
content = content.replace('text-slate-400', 'text-[var(--text-secondary)]')
content = content.replace('text-white', 'text-[var(--text-main)]')
content = content.replace('bg-black/20', 'bg-[var(--surface-2)]')
content = content.replace('placeholder-slate-500', 'placeholder-[var(--text-muted)]')
content = content.replace('focus:ring-indigo-500', 'focus:ring-[var(--primary)]')
content = content.replace('text-red-400', 'text-[var(--danger)]')
content = content.replace('bg-indigo-500', 'bg-[var(--primary)]')
content = content.replace('hover:bg-indigo-600', 'hover:opacity-90')
content = content.replace('w-12 h-14', 'w-10 h-12 sm:w-12 sm:h-14')
content = content.replace('text-indigo-400', 'text-[var(--primary)]')
content = content.replace('hover:text-white', 'hover:text-[var(--text-main)]')

with open('frontend/src/components/auth/ForgotPasswordModal.jsx', 'w') as f:
    f.write(content)

# 2. AuthCallback.jsx
with open('frontend/src/pages/auth/AuthCallback.jsx', 'r') as f:
    content = f.read()

content = content.replace('bg-[#050811]', 'bg-[var(--bg-page)]')
content = content.replace('border-indigo-500/30', 'border-[var(--primary)]/30')
content = content.replace('border-t-indigo-500', 'border-t-[var(--primary)]')
content = content.replace('text-slate-400', 'text-[var(--text-muted)]')
content = content.replace('shadow-[0_0_20px_rgba(99,102,241,0.5)]', '')

with open('frontend/src/pages/auth/AuthCallback.jsx', 'w') as f:
    f.write(content)

print("Modal and Callback fixed")
