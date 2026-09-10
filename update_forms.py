import sys

# LoginForm
with open('frontend/src/components/auth/LoginForm.jsx', 'r') as f:
    content = f.read()

content = content.replace('var(--text-primary)', 'var(--text-main)')
content = content.replace('hover:bg-black/5', 'hover:bg-black/5 dark:hover:bg-white/5')

with open('frontend/src/components/auth/LoginForm.jsx', 'w') as f:
    f.write(content)

# RegisterForm
with open('frontend/src/components/auth/RegisterForm.jsx', 'r') as f:
    content = f.read()

content = content.replace('var(--text-primary)', 'var(--text-main)')
# var(--surface-3) was added to index.css, so it's fine now.

with open('frontend/src/components/auth/RegisterForm.jsx', 'w') as f:
    f.write(content)

print("Auth forms updated")
