import re

file = 'frontend/src/services/api.js'
with open(file, 'r') as f:
    content = f.read()

# Add search_query to getResources local filtering
search_filter_code = """
      if (filters?.search_query) {
        const sq = filters.search_query.toLowerCase();
        combined = combined.filter(r => r.title.toLowerCase().includes(sq) || r.description.toLowerCase().includes(sq) || r.skill_category.toLowerCase().includes(sq));
      }
"""

if 'if (filters?.search_query)' not in content:
    # We have two places where combined is filtered: try block and catch block
    content = content.replace(
        "if (filters?.difficulty_level) combined = combined.filter(r => r.difficulty_level === filters.difficulty_level);",
        "if (filters?.difficulty_level) combined = combined.filter(r => r.difficulty_level === filters.difficulty_level);\n" + search_filter_code
    )

# Add suggestGoals and modify generatePath
ai_methods = """
  suggestGoals: async () => {
    try {
      const res = await insforge.functions.invoke('ai_copilot', { body: { action: 'suggest_goals' } });
      if (res.error) throw res.error;
      return { data: res.data.goals || ['Frontend Engineer', 'Backend Engineer', 'Data Scientist', 'DevOps Specialist'] };
    } catch {
      return { data: ['Full Stack Developer', 'Cloud Architect', 'Machine Learning Engineer', 'Web3 Developer'] };
    }
  },
  generatePath: async (goal) => {
    try {
      const res = await insforge.functions.invoke('ai_copilot', { body: { action: 'generate_path', payload: { goal } } });
      if (res.error) throw res.error;
      return { data: res.data };
    } catch {
      return { data: true };
    }
  },
"""

content = re.sub(r"generatePath: async \(\) => \(\{ data: true \}\),", ai_methods, content)

with open(file, 'w') as f:
    f.write(content)
print("Patched api.js for searching and AI methods.")
