const fs = require('fs');
const file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/export default function Header\({ onMenuClick, onDesktopMenuClick }\) {/, 'export default function Header({ onMenuClick, onDesktopMenuClick, sidebarCollapsed }) {');

content = content.replace(/{document.documentElement.classList.contains\('sidebar-collapsed'\) \? <PanelLeftOpen className="w-5 h-5" \/> : <PanelLeftClose className="w-5 h-5" \/>}/g, 
  `{sidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}`);

fs.writeFileSync(file, content);
console.log("Header props fixed");
