import json

questions_react_beg = [
    ("What is JSX?", ["A syntax extension for JavaScript", "A new language", "A database query language", "A CSS framework"], "A", "JSX allows you to write HTML-like syntax inside JS."),
    ("How do you pass data to a child component?", ["Using props", "Using states", "Using variables", "Using classes"], "A", "Props (properties) are used to pass data down the component tree."),
    ("Which hook is used to perform side effects?", ["useState", "useEffect", "useReducer", "useContext"], "B", "useEffect handles side effects like fetching data or modifying the DOM."),
    ("What does useState return?", ["An array with the current state value and a function to update it", "An object", "A string", "A boolean"], "A", "useState returns [state, setState]."),
    ("Is React a framework or a library?", ["Framework", "Library", "Database", "Browser"], "B", "React is a JavaScript library for building user interfaces."),
    ("What is the virtual DOM?", ["A direct copy of the real DOM kept in memory", "A physical representation", "A backend tool", "An external library"], "A", "React uses the VDOM to optimize rendering."),
    ("How do you handle forms in React?", ["Using controlled components", "Using HTML actions directly", "React does not support forms", "Using jQuery"], "A", "Controlled components manage form state in React."),
    ("What is the main purpose of keys in React lists?", ["To style elements", "To help React identify which items changed", "To fetch data", "To route pages"], "B", "Keys give elements a stable identity."),
    ("Can functional components have state?", ["No", "Yes, by using hooks", "Only class components can", "Yes, automatically"], "B", "Hooks like useState allow functional components to have state."),
    ("Which method is required in a class component?", ["render()", "componentDidMount()", "constructor()", "useState()"], "A", "render() is the only required method in a React class component.")
]

questions_ds_beg = [
    ("What is Pandas used for?", ["Web development", "Data manipulation and analysis", "Game development", "Database management"], "B", "Pandas is a data analysis library in Python."),
    ("What does CSV stand for?", ["Comma Separated Values", "Computer System Values", "Code Source View", "Common Standard Version"], "A", "CSV is a plain text format for tabular data."),
    ("Which library is best for machine learning in Python?", ["React", "Django", "Scikit-learn", "Flask"], "C", "Scikit-learn features various classification, regression, and clustering algorithms."),
    ("What is a DataFrame?", ["A database engine", "A 2-dimensional labeled data structure", "A web framework", "A list of strings"], "B", "A DataFrame is a 2D data structure, like a spreadsheet."),
    ("What is supervised learning?", ["Learning without labels", "Learning with labeled data", "Reinforcement learning", "Clustering"], "B", "Supervised learning algorithms map inputs to outputs based on labeled examples."),
    ("What is the purpose of Matplotlib?", ["Database connection", "Data visualization", "Text processing", "Machine learning"], "B", "Matplotlib is a comprehensive library for creating static, animated, and interactive visualizations."),
    ("Which of the following is a classification algorithm?", ["Linear Regression", "Logistic Regression", "K-Means", "PCA"], "B", "Despite its name, logistic regression is used for classification."),
    ("What is overfitting?", ["Model performs poorly on training data", "Model learns the noise in training data", "Model requires too much memory", "Model is too simple"], "B", "Overfitting occurs when a model is excessively complex and learns noise."),
    ("What does NLP stand for?", ["Natural Language Processing", "New Language Protocol", "Node Local Processing", "None of the above"], "A", "NLP deals with the interaction between computers and human languages."),
    ("What is NumPy primarily used for?", ["Web scraping", "Numerical computing and arrays", "Database ORM", "Routing"], "B", "NumPy provides support for large, multi-dimensional arrays and matrices.")
]

def format_sql(arr, asm_var):
    sql = ""
    for q, options, correct, expl in arr:
        options_json = json.dumps(options).replace("'", "''")
        q = q.replace("'", "''")
        expl = expl.replace("'", "''")
        sql += f"    INSERT INTO questions (assessment_id, question_text, options, correct_option, explanation) VALUES ({asm_var}, '{q}', '{options_json}', '{correct}', '{expl}');\n"
    return sql

with open("seed_assessments_more.sql", "w") as f:
    f.write("""DO $$
DECLARE
    cat_ds UUID;
    cat_react UUID;
    
    asm_react_beg UUID;
    asm_ds_beg UUID := gen_random_uuid();
BEGIN
    SELECT id INTO cat_ds FROM skill_categories WHERE name = 'Data Science' LIMIT 1;
    SELECT id INTO cat_react FROM skill_categories WHERE name = 'React' LIMIT 1;
    
    IF cat_react IS NULL THEN
        RAISE EXCEPTION 'React category not found';
    END IF;
    
    SELECT id INTO asm_react_beg FROM assessments WHERE title = 'React Basics' LIMIT 1;
    
    IF asm_react_beg IS NULL THEN
        asm_react_beg := gen_random_uuid();
        INSERT INTO assessments (id, title, description, category_id, difficulty, time_limit_minutes, is_active) VALUES
        (asm_react_beg, 'React Basics', 'Test your knowledge of React fundamentals.', cat_react, 'beginner', 10, true);
    END IF;

    INSERT INTO assessments (id, title, description, category_id, difficulty, time_limit_minutes, is_active) VALUES
    (asm_ds_beg, 'Data Science Basics', 'Fundamentals of Data Science and ML.', cat_ds, 'beginner', 10, true);
""")
    f.write(format_sql(questions_react_beg, 'asm_react_beg'))
    f.write(format_sql(questions_ds_beg, 'asm_ds_beg'))
    f.write("END $$;\n")
