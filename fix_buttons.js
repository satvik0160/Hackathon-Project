const fs = require('fs');
let file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/className="relative p-2 rounded-full hover:bg-violet-50\/50 transition-colors flex items-center justify-center"/, 
  'className="relative p-2 w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 hover:bg-violet-50/50 transition-all flex items-center justify-center"');

content = content.replace(/className="md:hidden p-2 rounded-xl hover:bg-violet-50\/50 transition-colors flex items-center justify-center"/,
  'className="md:hidden p-2 w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 hover:bg-violet-50/50 transition-all flex items-center justify-center"');

content = content.replace(/className="hidden md:flex p-2 rounded-xl hover:bg-violet-50\/50 transition-colors flex items-center justify-center"/,
  'className="hidden md:flex p-2 w-10 h-10 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:border-purple-300 hover:bg-violet-50/50 transition-all flex items-center justify-center"');

fs.writeFileSync(file, content);
console.log("Buttons fixed");
