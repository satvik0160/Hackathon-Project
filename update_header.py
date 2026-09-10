import sys

with open('frontend/src/components/layout/Header.jsx', 'r') as f:
    content = f.read()

content = content.replace('var(--text-primary)', 'var(--text-main)')
content = content.replace('md:hidden', 'min-[901px]:hidden')
content = content.replace('hidden md:flex', 'hidden min-[901px]:flex')
content = content.replace('md:px-6', 'min-[901px]:px-6')
content = content.replace('md:h-[var(--topbar-height,68px)]', 'min-[901px]:h-[var(--topbar-height,68px)]')
content = content.replace('md:w-[340px]', 'min-[901px]:w-[340px]')

with open('frontend/src/components/layout/Header.jsx', 'w') as f:
    f.write(content)
print("Header.jsx updated")
