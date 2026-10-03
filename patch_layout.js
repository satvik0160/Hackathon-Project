const fs = require('fs');
const file = 'frontend/src/components/layout/Layout.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<Header \n          onMenuClick/g, `<Header \n          sidebarCollapsed={desktopSidebarCollapsed}\n          onMenuClick`);

fs.writeFileSync(file, content);
console.log("Layout patched");
