import os
import re

files = [
    "frontend/src/pages/arcade/AlgorithmSpeedrun.jsx",
    "frontend/src/pages/arcade/CSSBattle.jsx",
    "frontend/src/pages/arcade/SQLMurderMystery.jsx"
]

def add_rpc_call(filepath, key):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if "insforge" not in content:
        content = content.replace("import React", "import { insforge } from '../../services/insforgeClient';\nimport React")

    pattern = rf"const bestScore = localStorage.getItem\('{key}'\) \|\| 0;\s+if \(score > bestScore\) {{\s+localStorage.setItem\('{key}', score\);\s+}}"
    
    replacement = f"""const bestScore = localStorage.getItem('{key}') || 0;
    if (score > bestScore) {{
      localStorage.setItem('{key}', score);
      // Update backend XP for difference
      const diff = score - bestScore;
      insforge.rpc('add_arcade_xp', {{ p_xp_to_add: diff }}).catch(e => console.error('Failed to add XP', e));
    }}"""
    
    new_content = re.sub(pattern, replacement, content)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

add_rpc_call(files[0], 'algoSpeedrunBestScore')
add_rpc_call(files[1], 'cssBattleBestScore')
add_rpc_call(files[2], 'sqlMysteryBestScore')

