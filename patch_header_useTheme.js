const fs = require('fs');
const file = 'frontend/src/components/layout/Header.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import { useAuth } from '\.\.\/\.\.\/contexts\/AuthContext';/, "import { useAuth } from '../../contexts/AuthContext';\nimport { useTheme } from '../../hooks/useTheme';");

content = content.replace(/const \[isDarkMode, setIsDarkMode\] = useState\(document\.documentElement\.getAttribute\('data-theme'\) !== 'light'\);\n  const toggleTheme = \(\) => {\n    const newTheme = isDarkMode \? 'light' : 'dark';\n    document\.documentElement\.setAttribute\('data-theme', newTheme\);\n    setIsDarkMode\(!isDarkMode\);\n  };/, 
  `const { theme, toggleTheme } = useTheme();\n  const isDarkMode = theme === 'dark';`);

fs.writeFileSync(file, content);
console.log("Header useTheme patched");
