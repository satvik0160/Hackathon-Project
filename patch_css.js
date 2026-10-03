const fs = require('fs');
const file = 'frontend/src/landing-v3.css';
let content = fs.readFileSync(file, 'utf8');

// Replace @media (max-width: 1000px) with something that won't trigger, like @media (max-width: 1px)
content = content.replace(/@media \(max-width: 1000px\)/g, '@media (max-width: 1px)');
content = content.replace(/@media \(max-width: 700px\)/g, '@media (max-width: 1px)');

fs.writeFileSync(file, content);
console.log("Patched landing-v3.css successfully.");
