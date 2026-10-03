const fs = require('fs');
let file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the Theme Button with a Toggle Switch Pill
content = content.replace(/<button onClick={toggleTheme} className="relative p-2 w-10 h-10 rounded-full bg-white border border-slate-200\/80 shadow-sm hover:border-purple-300 hover:bg-violet-50\/50 transition-all flex items-center justify-center" title="Toggle Theme">\n          \{isDarkMode \? <Sun className="w-5 h-5 text-amber-500 drop-shadow-\[0_0_8px_rgba\(245,158,11,0.8\)\]" \/> : <Moon className="w-5 h-5 text-indigo-400 drop-shadow-\[0_0_8px_rgba\(129,140,248,0.8\)\]" \/>\}\n        <\/button>/, 
  `<button onClick={toggleTheme} className="relative flex items-center w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none shadow-inner border border-slate-300/50 cursor-pointer hover:ring-2 hover:ring-purple-300" title="Toggle Theme">
          <div className={\`absolute w-6 h-6 rounded-full bg-white shadow flex items-center justify-center transition-transform duration-300 \${isDarkMode ? 'translate-x-7 bg-slate-800' : 'translate-x-0.5'}\`}>
            {isDarkMode ? <Moon className="w-3.5 h-3.5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" /> : <Sun className="w-3.5 h-3.5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />}
          </div>
        </button>`);

fs.writeFileSync(file, content);
console.log("Theme Toggle Pill fixed");
