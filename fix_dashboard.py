import sys

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'r') as f:
    content = f.read()

# Grid parent
content = content.replace(
    'className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6"',
    'className="grid grid-cols-1 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-12 gap-6"'
)

# Column spans
content = content.replace('col-span-1 md:col-span-2 lg:col-span-12', 'col-span-1 min-[700px]:col-span-2 min-[1100px]:col-span-12')
content = content.replace('col-span-1 md:col-span-2 lg:col-span-8', 'col-span-1 min-[700px]:col-span-2 min-[1100px]:col-span-8')
content = content.replace('col-span-1 md:col-span-2 lg:col-span-4', 'col-span-1 min-[700px]:col-span-2 min-[1100px]:col-span-4')
content = content.replace('col-span-1 lg:col-span-3', 'col-span-1 min-[1100px]:col-span-3')
content = content.replace('col-span-1 lg:col-span-5', 'col-span-1 min-[700px]:col-span-2 min-[1100px]:col-span-5')
content = content.replace('col-span-1 lg:col-span-4', 'col-span-1 min-[700px]:col-span-2 min-[1100px]:col-span-4')

# Fixed heights
content = content.replace('h-[148px] md:h-[164px]', 'min-h-[164px]')

# Hardcoded colors
content = content.replace("color: '#000'", "color: 'var(--text-main)'")
content = content.replace("text-[#000]", "text-white")

# Gradients
content = content.replace('from-[#3B82F6] to-[#06B6D4]', 'from-[var(--primary)] to-[var(--primary-2)]')
content = content.replace('from-[#F97316] to-[#FB7185]', 'from-[var(--mission)] to-[var(--mission-subtle)]') # fallback if they really want gradient

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'w') as f:
    f.write(content)
print("Dashboard fixed")
