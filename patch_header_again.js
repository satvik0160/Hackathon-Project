const fs = require('fs');
const file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Sun/Moon with a standard icon in case it's missing or use standard ones
// Actually Sun and Moon are standard. Let's just fix the buttons to have strong colors.
content = content.replace(/<button onClick={toggleTheme}[\s\S]*?<\/button>/, 
  `<button onClick={toggleTheme} className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/60 shadow-sm flex items-center justify-center" title="Toggle Theme">
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>`);

// Fix Sidebar Menu toggle button
content = content.replace(/<button\n          onClick={onDesktopMenuClick}[\s\S]*?<\/button>/,
  `<button
          onClick={onDesktopMenuClick}
          className="hidden md:flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200/60 shadow-sm flex items-center justify-center"
          title="Toggle Navigation Bar"
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>`);

fs.writeFileSync(file, content);
console.log("Header patched again");
