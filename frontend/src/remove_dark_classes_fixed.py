import os
import re

def process_file_safely(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    
    # regex for dark:classes
    # We replace " dark:something" or "dark:something " or just "dark:something"
    
    # 1. Replace dark:xxx followed by space
    content = re.sub(r'\bdark:[^\s"\'`]+\s+', '', content)
    
    # 2. Replace remaining dark:xxx not followed by space (end of string)
    content = re.sub(r'\bdark:[^\s"\'`]+', '', content)
    
    # Fix double spaces caused by replacement
    # We only want to collapse multiple spaces that are NOT leading spaces
    # So we can just leave double spaces, or replace them safely
    # Actually double spaces inside class strings are totally fine in HTML/JSX.
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Cleaned {filepath}")

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.jsx'):
            process_file_safely(os.path.join(root, file))
