const fs = require('fs');
const file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

// Theme toggle
content = content.replace(/className="relative p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200\/60 shadow-sm flex items-center justify-center"/,
  'className="relative p-2 rounded-full hover:bg-slate-100/80 text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center"');
content = content.replace(/<Sun className="w-5 h-5 text-amber-500" \/>/, '<Sun className="w-5 h-5" />');
content = content.replace(/<Moon className="w-5 h-5 text-indigo-500" \/>/, '<Moon className="w-5 h-5" />');

// Menu toggle
content = content.replace(/className="hidden md:flex p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200\/60 shadow-sm flex items-center justify-center"/,
  'className="hidden md:flex p-2 rounded-xl hover:bg-slate-100/80 text-slate-400 hover:text-indigo-500 transition-colors flex items-center justify-center"');
content = content.replace(/className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200\/60 shadow-sm"/,
  'className="md:hidden p-2 rounded-xl hover:bg-slate-100/80 text-slate-400 transition-colors flex items-center justify-center"');

fs.writeFileSync(file, content);
console.log("Header styles patched");
