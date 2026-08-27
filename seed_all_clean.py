import json
import subprocess
import sys

def run_query(sql):
    res = subprocess.run(["npx", "@insforge/cli", "db", "query", sql], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"  DB ERROR: {res.stderr.strip()}", file=sys.stderr)
        return False
    return True

# Load all 3 JSON files
all_questions = []
base = '/home/YoomacKK/Documents/Hackathon-Project-Ai-Manthan-2.0-/insforge_functions'
for fname in ['mcq_database2.json', 'mcq_database_batch_3.json', 'mcq_database_final_7_domains.json']:
    path = f"{base}/{fname}"
    try:
        with open(path, 'r') as f:
            data = json.load(f)
            all_questions.extend(data)
            print(f"Loaded {len(data)} questions from {fname}")
    except Exception as e:
        print(f"ERROR loading {fname}: {e}", file=sys.stderr)

# Group by (topic, level)
topics = {}
for row in all_questions:
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
        print(f"  WARNING: answer '{answer_str}' not found in options for question '{row['question'][:50]}...' — defaulting to A")
        correct_letter = 'A'

    topics[topic][level].append({
        'q': row['question'].replace("'", "''"),
        'opts': json.dumps(options).replace("'", "''"),
        'ans': correct_letter
    })

# Print summary
print(f"\nTotal domains found: {len(topics)}")
for t, levels in sorted(topics.items()):
    for l, qs in sorted(levels.items()):
        print(f"  {t} / {l}: {len(qs)} questions (will use first 10)")

# Step 1: Wipe everything clean
print("\n--- Step 1: Wiping all existing questions, assessments, categories ---")
run_query("DELETE FROM questions;")
run_query("DELETE FROM assessments;")
run_query("DELETE FROM skill_categories;")
print("Database wiped clean.")

# Step 2: Insert domain by domain
print("\n--- Step 2: Inserting all domains ---")
for topic, levels in sorted(topics.items()):
    sql = "DO $$\nDECLARE\n    cat_id UUID := gen_random_uuid();\n    asm_id UUID;\nBEGIN\n"
    sql += f"    INSERT INTO skill_categories (id, name, description) VALUES (cat_id, '{topic}', '{topic} skills');\n"

    for level in ['beginner', 'intermediate', 'advanced']:
        qs = levels.get(level, [])
        if not qs:
            print(f"  WARNING: No {level} questions for {topic}, skipping")
            continue
        qs_to_insert = qs[:10]
        title = f"{topic} {level.capitalize()}"
        sql += f"    asm_id := gen_random_uuid();\n"
        sql += f"    INSERT INTO assessments (id, title, description, category_id, difficulty, time_limit_minutes, is_active) VALUES (asm_id, '{title}', 'Test your {topic} skills at the {level} level.', cat_id, '{level}', 10, true);\n"

        for q in qs_to_insert:
            sql += f"    INSERT INTO questions (assessment_id, question_text, options, correct_option, explanation) VALUES (asm_id, '{q['q']}', '{q['opts']}', '{q['ans']}', '');\n"

    sql += "END $$;\n"
    
    ok = run_query(sql)
    status = "OK" if ok else "FAILED"
    print(f"  [{status}] {topic}")

# Step 3: Verify
print("\n--- Step 3: Verification ---")
res = subprocess.run(["npx", "@insforge/cli", "db", "query", 
    "SELECT c.name as domain, a.difficulty, count(q.id) as questions FROM assessments a JOIN skill_categories c ON a.category_id = c.id JOIN questions q ON q.assessment_id = a.id GROUP BY c.name, a.difficulty ORDER BY c.name, a.difficulty;"
], capture_output=True, text=True)
print(res.stdout)

