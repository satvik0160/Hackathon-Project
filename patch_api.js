const fs = require('fs');
const file = 'frontend/src/services/api.js';
let content = fs.readFileSync(file, 'utf8');

const internalResourcesStr = `
    const internalResources = [
      { id: 'devastra-res-1', title: 'DevAstra Written Curriculum (GFG/W3S)', description: 'Comprehensive written curriculum covering GeeksforGeeks and W3Schools material.', resource_type: 'Article', difficulty_level: 'Intermediate', skill_category: 'Curriculum', duration: 'Self-paced', url: '/resources/DevAstra_Written_GFG_W3S_Final_Fixed.pdf', completed: false },
      { id: 'devastra-res-2', title: 'DevAstra YouTube Master Curriculum', description: 'Master curriculum pulling the best learning paths from YouTube.', resource_type: 'Course', difficulty_level: 'Beginner', skill_category: 'Curriculum', duration: 'Self-paced', url: '/resources/DevAstra_YouTube_Master_Curriculum.pdf', completed: false }
    ];
`;

content = content.replace(
  'getResources: async (filters) => {',
  'getResources: async (filters) => {' + internalResourcesStr
);

content = content.replace(
  'return { data: data || [] };',
  'return { data: [...internalResources, ...(data || [])] };'
);

content = content.replace(
  'return { data: [',
  'return { data: [\n        ...internalResources,'
);

fs.writeFileSync(file, content);
console.log("Patched api.js successfully.");
