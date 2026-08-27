import json
import uuid
import os
import subprocess

def run_query(sql):
    # write to temp file
    # wait, we have to pass it as argument, so it must be small
    res = subprocess.run(["npx", "@insforge/cli", "db", "query", sql], capture_output=True, text=True)
    if res.returncode != 0:
        print("Error:", res.stderr)
        
def seed():
    with open('/home/YoomacKK/Documents/Hackathon-Project-Ai-Manthan-2.0-/insforge_functions/mcq_database2.json', 'r') as f:
        data = json.load(f)
        
    topics = {}
    for row in data:
        topic = row['topic'].strip()
        level = row['level'].strip().lower()
        if topic not in topics:
            topics[topic] = {}
        if level not in topics[topic]:
            topics[topic][level] = []
            
        options = row['options']
        answer_str = row['answer']
        try:
            idx = options.index(answer_str)
            correct_letter = chr(65 + idx)
        except ValueError:
            correct_letter = 'A'
            
        topics[topic][level].append({
            'q': row['question'].replace("'", "''"),
            'opts': json.dumps(options).replace("'", "''"),
            'ans': correct_letter
        })

    # clear existing
    run_query("DELETE FROM questions; DELETE FROM assessments; DELETE FROM skill_categories;")

    for topic, levels in topics.items():
        sql = "DO $$\nDECLARE\n    cat_id UUID := gen_random_uuid();\n    asm_id UUID;\nBEGIN\n"
        sql += f"    INSERT INTO skill_categories (id, name, description) VALUES (cat_id, '{topic}', '{topic} skills');\n"
        
        for level, qs in levels.items():
            qs_to_insert = qs[:10]
            title = f"{topic} {level.capitalize()}"
            sql += f"    asm_id := gen_random_uuid();\n"
            sql += f"    INSERT INTO assessments (id, title, description, category_id, difficulty, time_limit_minutes, is_active) VALUES (asm_id, '{title}', 'Test your {topic} skills.', cat_id, '{level}', 10, true);\n"
            
            for q in qs_to_insert:
                sql += f"    INSERT INTO questions (assessment_id, question_text, options, correct_option, explanation) VALUES (asm_id, '{q['q']}', '{q['opts']}', '{q['ans']}', '');\n"

        sql += "END $$;\n"
        print(f"Executing {topic}...")
        run_query(sql)

seed()
