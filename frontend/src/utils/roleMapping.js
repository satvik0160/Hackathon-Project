export const getCategoriesForGoal = (goal) => {
  if (!goal) return [];
  const lowerGoal = goal.toLowerCase();
  
  const roleMappings = [
    { keywords: ['frontend', 'front-end', 'front end', 'react', 'web dev', 'ui', 'front'], skills: ['React', 'Javascript', 'Html & Css', 'Ui/Ux Design'] },
    { keywords: ['backend', 'back-end', 'back end', 'node', 'django', 'api', 'server', 'back'], skills: ['Node.Js', 'Python', 'Django', 'Sql & Relational Databases', 'Golang (Go)'] },
    { keywords: ['fullstack', 'full-stack', 'full stack', 'software engineer', 'software dev', 'mern', 'sde'], skills: ['React', 'Node.Js', 'Javascript', 'Sql & Relational Databases', 'Git & Github'] },
    { keywords: ['data', 'machine learning', 'ml', 'ai', 'artificial intelligence', 'scientist', 'analytics', 'data scientist', 'data engineer'], skills: ['Machine Learning (Ml)', 'Data Analysis', 'Python', 'Sql & Relational Databases'] },
    { keywords: ['devops', 'dev ops', 'cloud', 'aws', 'docker', 'kubernetes', 'k8s', 'infrastructure', 'cloud architect'], skills: ['Cloud Computing', 'Docker', 'Kubernetes (K8S)', 'Git & Github'] },
    { keywords: ['security', 'cyber', 'hacker', 'pentest', 'infosec', 'ethical hacker'], skills: ['Cybersecurity', 'Cloud Computing', 'Python'] },
    { keywords: ['design', 'ux', 'ui', 'product designer', 'designer'], skills: ['Ui/Ux Design', 'Html & Css'] },
    { keywords: ['c++', 'cpp', 'systems', 'game', 'engine'], skills: ['C++', 'Git & Github'] },
    { keywords: ['blockchain', 'web3', 'crypto', 'smart contract'], skills: ['Node.Js', 'Javascript', 'Golang (Go)'] }
  ];

  const directSkills = ["Machine Learning (Ml)", "Javascript", "Cybersecurity", "Node.Js", "Kubernetes (K8S)", "Git & Github", "Data Analysis", "Ui/Ux Design", "React", "C++", "Django", "Docker", "Html & Css", "Cloud Computing", "Sql & Relational Databases", "Golang (Go)", "Python"];
  
  let matched = new Set();
  
  for (const skill of directSkills) {
    if (lowerGoal.includes(skill.toLowerCase().split(' ')[0])) {
      matched.add(skill);
    }
  }

  const levenshteinDistance = (a, b) => {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
        }
      }
    }
    return matrix[b.length][a.length];
  };

  const words = lowerGoal.split(/[^a-z0-9]+/);
  for (const mapping of roleMappings) {
    for (const kw of mapping.keywords) {
      if (lowerGoal.includes(kw)) {
        mapping.skills.forEach(s => matched.add(s));
        continue;
      }
      const kwWords = kw.split(/\s+/);
      for (const word of words) {
        if (word.length > 3) {
           for (const kwWord of kwWords) {
              if (kwWord.length > 3 && (kwWord.includes(word) || word.includes(kwWord) || levenshteinDistance(word, kwWord) <= 1)) {
                  mapping.skills.forEach(s => matched.add(s));
              }
           }
        }
      }
    }
  }

  if (matched.size === 0) {
     return ['Git & Github', 'Python', 'Javascript']; 
  }

  return Array.from(matched);
};
