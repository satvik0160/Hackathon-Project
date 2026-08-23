import os
import re

def check_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find lucide-react imports
    lucide_import = re.search(r"import\s+\{([^}]+)\}\s+from\s+['\"]lucide-react['\"]", content)
    if not lucide_import:
        return
    
    imported_components = [x.strip() for x in lucide_import.group(1).split(',')]
    
    # Find all JSX tags <ComponentName
    jsx_tags = re.findall(r'<([A-Z][a-zA-Z0-9_]*)', content)
    
    # Check if any JSX tag is not imported (ignoring standard React components usually)
    missing = []
    
    # Let's just find things that look like lucide icons but aren't imported.
    # We can check all Capitalized tags and see if they are defined anywhere in the file.
    for tag in set(jsx_tags):
        # check if tag is in content as an import or class/function definition
        if not re.search(r'\b' + tag + r'\b', content.replace(f'<{tag}', '')):
             pass
        # actually a better way: just check if tag is defined
        if not re.search(r'(import\s+.*' + tag + r'|class\s+' + tag + r'|function\s+' + tag + r'|const\s+' + tag + r'|let\s+' + tag + r')', content):
            missing.append(tag)
            
    if missing:
        print(f"{path}: Possible missing imports: {missing}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.jsx'):
            check_file(os.path.join(root, file))

