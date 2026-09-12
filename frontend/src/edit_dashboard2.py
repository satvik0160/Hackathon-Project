import re

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'r') as f:
    content = f.read()

# Fix heatmap colors to match theme properly
content = content.replace("let color = 'bg-slate-800/40 dark:bg-slate-800/40 bg-gray-200';", "let color = 'bg-black/20'; // This converts to light gray in light mode")
content = content.replace('<div className="w-3 h-3 rounded-sm bg-slate-800"></div>', '<div className="w-3 h-3 rounded-sm bg-black/20"></div>')

with open('frontend/src/pages/dashboard/Dashboard.jsx', 'w') as f:
    f.write(content)
