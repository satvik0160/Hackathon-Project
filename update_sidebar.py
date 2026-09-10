import sys

with open('frontend/src/components/layout/Sidebar.jsx', 'r') as f:
    content = f.read()

# Replace variables
content = content.replace('var(--text-primary)', 'var(--text-main)')
content = content.replace('var(--sidebar-width, 216px)', '216px')
content = content.replace('md:translate-x-0', 'min-[901px]:translate-x-0')
content = content.replace('md:hidden', 'max-[900px]:block min-[901px]:hidden')
# But wait, md:hidden is used for the overlay and mobile header.
# Let's fix them manually.

content = content.replace('''      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"''', '''      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 min-[901px]:hidden"''')

content = content.replace('''        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden px-4 h-[56px] border-b" style={{ borderColor: 'var(--border)' }}>''', '''        {/* Mobile Header */}
        <div className="flex items-center justify-between min-[901px]:hidden px-4 h-[60px] border-b" style={{ borderColor: 'var(--border)' }}>''')

content = content.replace('''        {/* Brand */}
        <div className="hidden md:flex items-center gap-3 pt-[24px] pl-[24px]">''', '''        {/* Brand */}
        <div className="hidden min-[901px]:flex items-center gap-3 pt-[24px] pl-[24px]">''')

content = content.replace('''        {/* Nav Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 mt-8 md:mt-[92px] space-y-6 pb-6">''', '''        {/* Nav Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 mt-6 space-y-6 pb-6">''')

content = content.replace('h-screen', 'h-[100dvh]')

with open('frontend/src/components/layout/Sidebar.jsx', 'w') as f:
    f.write(content)
print("Sidebar.jsx updated")
