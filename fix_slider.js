const fs = require('fs');

let file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the slider code
content = content.replace(
  /<button \n          onClick=\{toggleTheme\} \n          className="relative flex items-center w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors shadow-inner border border-slate-300\/50 hover:ring-2 hover:ring-purple-300"\n          title="Toggle Theme"\n        >[\s\S]*?<\/button>/m,
  `<button 
          onClick={toggleTheme} 
          className="relative flex items-center w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors shadow-inner border border-slate-300/50 hover:ring-2 hover:ring-purple-300"
          title="Toggle Theme"
        >
          <div className="absolute left-2 flex items-center justify-center">
            <Moon className="w-4 h-4 text-slate-400 dark:text-indigo-300" />
          </div>
          <div className="absolute right-2 flex items-center justify-center">
            <Sun className="w-4 h-4 text-amber-500 dark:text-slate-500" />
          </div>
          <div 
            className={\`absolute w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-300 z-10 flex items-center justify-center \${isDarkMode ? 'translate-x-[2px]' : 'translate-x-[34px]'}\`}
          >
             {isDarkMode ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </div>
        </button>`
);

fs.writeFileSync(file, content);
console.log("Slider fixed");
