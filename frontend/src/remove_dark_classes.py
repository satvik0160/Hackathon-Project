import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content
    
    # Remove all words starting with dark:
    # Example: dark:bg-gray-800, dark:text-white, dark:hover:bg-gray-700
    # Also handle combinations like dark:focus:ring-2
    # Regex breakdown:
    # \bdark:[a-zA-Z0-9_-]+(/[0-9]+)?(\[[^\]]+\])? 
    # to catch dark:bg-red-500, dark:bg-white/10, dark:shadow-[inset_0_...]
    
    # Simple regex to remove dark: prefixed classes
    content = re.sub(r'\bdark:[^\s"\']+', '', content)
    
    # Also clean up any double spaces created by removal
    content = re.sub(r'\s+', ' ', content).replace(' "', '"').replace('" ', '"')
    
    # Since re.sub(r'\s+', ' ', content) removes all newlines, we CANNOT do it this way!
    pass

def process_file_safely(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()
        
    new_lines = []
    changed = False
    for line in lines:
        original_line = line
        # Remove dark: prefixed classes
        line = re.sub(r'\bdark:[^\s"\'`]+', '', line)
        # Clean up multiple spaces, but preserve leading indentation
        
        # A safer way to just replace dark:classes without affecting line spacing:
        # Just replace " dark:class" with ""
        if line != original_line:
            # Clean up extra spaces inside class strings
            # This regex looks for 2 or more spaces inside quotes
            # But let's just do a simple replacement for now
            line = re.sub(r' +', ' ', line)
            changed = True
        new_lines.append(line)
        
    if changed:
        with open(filepath, 'w') as f:
            f.writelines(new_lines)
        print(f"Cleaned {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file_safely(os.path.join(root, file))
