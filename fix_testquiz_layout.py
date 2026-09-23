import re

with open("frontend/src/pages/assessments/TestQuiz.jsx", "r") as f:
    content = f.read()

# Fix the opening tags
content = content.replace(
    'className="max-w-4xl mx-auto p-6"\n      >',
    'className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8"\n      >\n        <div className="lg:col-span-2 space-y-8">'
)

# In case it already has the wrong closing tags, we can just fix it.
# We know right_panel added the following:
#         </div>
#         <div className="space-y-6">
# ...
#         </div>

# We just need to make sure the opening tag <div className="lg:col-span-2 space-y-8"> is present.

with open("frontend/src/pages/assessments/TestQuiz.jsx", "w") as f:
    f.write(content)
