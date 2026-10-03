const fs = require('fs');
const file = 'frontend/src/services/api.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('...internalResources')) {
  // Add internalResources if not already there
  if (!content.includes('const internalResources = [')) {
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
  }

  content = content.replace(
    'return { data: data || [] };',
    'return { data: [...internalResources, ...(data || [])] };'
  );

  content = content.replace(
    "return { data: [\n        { id: 'lr-1'",
    "return { data: [\n        ...internalResources,\n        { id: 'lr-1'"
  );
  
  fs.writeFileSync(file, content);
  console.log("Patched api.js successfully.");
} else {
  console.log("Already patched.");
}
