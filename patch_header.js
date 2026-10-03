const fs = require('fs');
const file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Import Sun, Moon, PanelLeftClose, PanelLeftOpen
content = content.replace(/Search, Bell, Menu, ChevronDown, LogOut, Home, BookOpen, Brain, Briefcase, Flame/g, 'Search, Bell, Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon, LogOut, Home, BookOpen, Brain, Briefcase, Flame');

// Add theme state
content = content.replace('const [profileOpen, setProfileOpen] = useState(false);', "const [profileOpen, setProfileOpen] = useState(false);\n  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.getAttribute('data-theme') !== 'light');\n  const toggleTheme = () => {\n    const newTheme = isDarkMode ? 'light' : 'dark';\n    document.documentElement.setAttribute('data-theme', newTheme);\n    setIsDarkMode(!isDarkMode);\n  };");

// Replace Desktop Hamburger Menu button icon
content = content.replace(/<Menu className="w-5 h-5" \/>/g, (match, offset) => {
  if (offset > 1200 && offset < 1500) { // Targeting the second Menu which is the desktop one
     return `{document.documentElement.classList.contains('sidebar-collapsed') ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}`;
  }
  return match;
});

// Replace Bell with Sun/Moon
content = content.replace(/{hasNotifications && \([\s\S]*?\)}/g, ''); // Remove red dot
content = content.replace(/<button className="relative p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-colors text-slate-500 hover:text-purple-500">[\s\S]*?<Bell className="w-5 h-5" \/>[\s\S]*?<\/button>/, 
  `<button onClick={toggleTheme} className="relative p-2 rounded-full bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-colors text-slate-500 hover:text-purple-500" title="Toggle Theme">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>`);

// Fix Center Navigation Pills absolute positioning
content = content.replace(/<div className="hidden lg:flex items-center bg-white\/70 backdrop-blur-md border border-slate-200\/80 rounded-full p-1 shadow-sm">/,
  `<div className="hidden lg:flex items-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="flex items-center bg-white/70 backdrop-blur-md border border-slate-200/80 rounded-full p-1 shadow-sm pointer-events-auto">`);
// Close the extra div
content = content.replace(/<\/NavLink>\n        \)\)}\n      <\/div>/, `</NavLink>\n        ))}\n        </div>\n      </div>`);

fs.writeFileSync(file, content);
console.log("Header patched");
