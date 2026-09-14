import os

# 1. DevAstraPreloader.jsx
with open("frontend/src/components/common/DevAstraPreloader.jsx", "r") as f:
    content = f.read()
content = content.replace(
"""<<<<<<< HEAD
    const duration = 8000; // 8 seconds
    let req;
    let timeoutId;
=======
    let startTime = null;
    const duration = 2000; // 2 seconds
>>>>>>> 6fd2377 (Save work before pull and deploy)""",
"""    const duration = 2000; // 2 seconds
    let req;
    let timeoutId;"""
)
with open("frontend/src/components/common/DevAstraPreloader.jsx", "w") as f:
    f.write(content)

# 2. Dashboard.jsx
with open("frontend/src/pages/dashboard/Dashboard.jsx", "r") as f:
    content = f.read()

import re
content = re.sub(
    r"<<<<<<< HEAD\n\s*\{week\.map\(\(dateObj, dayIdx\) => \{\n\s*const dateStr = dateObj\.toISOString\(\)\.split\('T'\)\[0\];\n\s*const seconds = timeData\[dateStr\] \|\| 0;\n\s*const minutes = Math\.floor\(seconds / 60\);\n=======(.*?)\n>>>>>>> 6fd2377 \(Save work before pull and deploy\)",
    r"""                  {week.map((dateObj, dayIdx) => {
                    const dateStr = dateObj.toISOString().split('T')[0];
                    const seconds = timeData[dateStr] || 0;
                    const minutes = Math.floor(seconds / 60);""",
    content,
    flags=re.DOTALL
)

content = re.sub(
    r"<<<<<<< HEAD\n(.*?)=======(.*?)\n>>>>>>> 6fd2377 \(Save work before pull and deploy\)",
    r"\1", # take HEAD for any remaining conflicts in Dashboard.jsx
    content,
    flags=re.DOTALL
)
with open("frontend/src/pages/dashboard/Dashboard.jsx", "w") as f:
    f.write(content)

# 3. auth.service.js
with open("frontend/src/services/auth.service.js", "r") as f:
    content = f.read()
content = re.sub(
    r"<<<<<<< HEAD\n(.*?)=======(.*?)\n>>>>>>> 6fd2377 \(Save work before pull and deploy\)",
    r"\1", # take HEAD for auth.service.js
    content,
    flags=re.DOTALL
)
with open("frontend/src/services/auth.service.js", "w") as f:
    f.write(content)

# 4. AI_COORDINATION.md
with open("AI_COORDINATION.md", "r") as f:
    content = f.read()
content = re.sub(
    r"<<<<<<< HEAD\n",
    r"",
    content
)
content = re.sub(
    r"\n=======\n",
    r"\n\n",
    content
)
content = re.sub(
    r"\n>>>>>>> 6fd2377 \(Save work before pull and deploy\)",
    r"",
    content
)
with open("AI_COORDINATION.md", "w") as f:
    f.write(content)

print("Conflicts resolved.")
