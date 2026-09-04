import re

with open('/home/sandy/Documents/Hackathon-Project-Ai-Manthan-2.0-/frontend/src/index.css', 'r') as f:
    lines = f.readlines()

def replace_lines(start, end, replacement):
    global lines
    # 1-indexed to 0-indexed
    start_idx = start - 1
    end_idx = end
    lines = lines[:start_idx] + [replacement + "\n"] + lines[end_idx:]

# We'll just read the user's instructions and apply them.
# However, line numbers might shift if we don't do it carefully, or if we replace with a different number of lines.
# It's better to do it from bottom to top, or just use string replacements.
