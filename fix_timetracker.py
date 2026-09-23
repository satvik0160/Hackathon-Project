import re

with open("frontend/src/utils/timeTracker.js", "r") as f:
    content = f.read()

# Replace:
# const today = new Date().toISOString().split('T')[0];
# With:
# const d = new Date();
# const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

content = content.replace(
    "const today = new Date().toISOString().split('T')[0];",
    "const d = new Date();\n  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;"
)

with open("frontend/src/utils/timeTracker.js", "w") as f:
    f.write(content)
