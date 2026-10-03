const fs = require('fs');

let file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Menu icons
content = content.replace(
  /\{\(!isMobile && !sidebarCollapsed\) \? \n            <PanelLeftClose className="w-5 h-5 text-violet-500 " \/> : \n            <Menu className="w-5 h-5 text-violet-500 " \/>\n          \}/g,
  `{(!isMobile && !sidebarCollapsed) ? 
            <span className="text-xl leading-none">✖</span> : 
            <span className="text-xl leading-none">☰</span>
          }`
);

// Replace Slider icons
content = content.replace(
  /<div className="absolute left-2 flex items-center justify-center">\n            <Moon className="w-4 h-4 text-slate-400 dark:text-indigo-300" \/>\n          <\/div>\n          <div className="absolute right-2 flex items-center justify-center">\n            <Sun className="w-4 h-4 text-amber-500 dark:text-slate-500" \/>\n          <\/div>\n          <div \n            className=\{\`absolute w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-300 z-10 flex items-center justify-center \$\{isDarkMode \? 'translate-x-\[2px\]' : 'translate-x-\[34px\]'\}\`\}\n          >\n             \{isDarkMode \? <Moon className="w-4 h-4 text-indigo-500" \/> : <Sun className="w-4 h-4 text-amber-500" \/>\}\n          <\/div>/m,
  `<div className="absolute left-1.5 flex items-center justify-center text-sm opacity-50 dark:opacity-100">
            🌙
          </div>
          <div className="absolute right-1.5 flex items-center justify-center text-sm opacity-100 dark:opacity-50">
            ☀️
          </div>
          <div 
            className={\`absolute w-7 h-7 rounded-full bg-white shadow-md transform transition-transform duration-300 z-10 flex items-center justify-center text-sm \${isDarkMode ? 'translate-x-[2px]' : 'translate-x-[34px]'}\`}
          >
             {isDarkMode ? "🌙" : "☀️"}
          </div>`
);

fs.writeFileSync(file, content);
console.log("Emojis applied");
