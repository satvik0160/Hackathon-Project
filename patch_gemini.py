import re
import json

file = 'frontend/src/services/api.js'
with open(file, 'r') as f:
    content = f.read()

categories = ['Machine Learning (Ml)', 'Javascript', 'Cybersecurity', 'Node.Js', 'Kubernetes (K8S)', 'Git & Github', 'Data Analysis', 'Ui/Ux Design', 'React', 'C++', 'Django', 'Docker', 'Html & Css', 'Cloud Computing', 'Sql & Relational Databases', 'Golang (Go)', 'Python']
cat_str = json.dumps(categories)

gemini_methods = f"""
  suggestGoals: async () => {{
    try {{
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {{
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${{apiKey}}`, {{
          method: "POST",
          headers: {{ "Content-Type": "application/json" }},
          body: JSON.stringify({{ 
            contents: [{{ parts: [{{ text: "You are an AI career advisor. Generate a JSON array of 4 distinct, exciting tech career goals (e.g. 'Frontend Engineer', 'Cloud Architect'). Reply ONLY with the raw JSON array of strings, nothing else." }}] }}] 
          }})
        }});
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return {{ data: JSON.parse(cleaned) }};
      }}
      return {{ data: ['Frontend Engineer', 'Backend Engineer', 'Data Scientist', 'DevOps Specialist'] }};
    }} catch {{
      return {{ data: ['Full Stack Developer', 'Cloud Architect', 'Machine Learning Engineer', 'Web3 Developer'] }};
    }}
  }},
  generatePath: async (goal) => {{
    try {{
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (apiKey) {{
        const prompt = `The user wants to become a or is searching for: '${{goal}}'. Which of the following skill categories are highly relevant? {cat_str}. Return ONLY a JSON array of strings matching the relevant categories exactly as written. No markdown, no explanation.`;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${{apiKey}}`, {{
          method: "POST",
          headers: {{ "Content-Type": "application/json" }},
          body: JSON.stringify({{ contents: [{{ parts: [{{ text: prompt }}] }}] }})
        }});
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return {{ data: JSON.parse(cleaned) }};
      }}
      return {{ data: [] }};
    }} catch (err) {{
      console.error(err);
      return {{ data: [] }};
    }}
  }},
"""

content = re.sub(
    r"suggestGoals: async \(\) => \{.*?generatePath: async \(goal\) => \{.*?\},",
    gemini_methods.strip() + ",",
    content,
    flags=re.DOTALL
)

with open(file, 'w') as f:
    f.write(content)
print("api.js patched to use robust Gemini semantic category mapping!")
