const fs = require('fs');

// 1. Header.jsx
let headerFile = 'frontend/src/components/layout/Header.jsx';
let headerContent = fs.readFileSync(headerFile, 'utf8');

headerContent = headerContent.replace(/<Sun className="w-5 h-5" \/>/, '<Sun className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />');
headerContent = headerContent.replace(/<Moon className="w-5 h-5" \/>/, '<Moon className="w-5 h-5 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" />');
headerContent = headerContent.replace(/<Menu className="w-5 h-5" \/>/g, '<Menu className="w-5 h-5 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />');
headerContent = headerContent.replace(/<PanelLeftClose className="w-5 h-5" \/>/, '<PanelLeftClose className="w-5 h-5 text-violet-500 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" />');
headerContent = headerContent.replace(/<Search className="w-4 h-4 text-slate-400 group-hover:text-purple-500" \/>/, '<Search className="w-4 h-4 text-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.6)] group-hover:text-sky-400" />');

// Ensure background isn't boring gray either
headerContent = headerContent.replace(/hover:bg-slate-100\/80 text-slate-400 hover:text-indigo-500/g, 'hover:bg-violet-50/50');
headerContent = headerContent.replace(/text-slate-400 transition-colors flex items-center justify-center/g, 'hover:bg-violet-50/50 transition-colors flex items-center justify-center');

fs.writeFileSync(headerFile, headerContent);
console.log("Header glow patched");

// 2. LearningResources.jsx
let lrFile = 'frontend/src/pages/learning/LearningResources.jsx';
let lrContent = fs.readFileSync(lrFile, 'utf8');
lrContent = lrContent.replace(/<Search className="absolute left-4 top-1\/2 -translate-y-1\/2 w-4 h-4 text-slate-400 z-10 pointer-events-none" \/>/g, '<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500 drop-shadow-[0_0_8px_rgba(14,165,233,0.6)] z-10 pointer-events-none" />');
fs.writeFileSync(lrFile, lrContent);
console.log("LearningResources glow patched");

