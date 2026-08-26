import json

questions_py_beg = [
    ("What is the output of print(2 ** 3)?", ["6", "8", "9", "12"], "B", "The ** operator performs exponentiation. 2 to the power of 3 is 8."),
    ("Which of the following is a mutable data type in Python?", ["Tuple", "String", "List", "Integer"], "C", "Lists are mutable, meaning their contents can be changed after creation."),
    ("What keyword is used to define a function in Python?", ["func", "define", "def", "function"], "C", "The def keyword is used to create a function."),
    ("How do you insert comments in Python code?", ["// comment", "/* comment */", "# comment", "<!-- comment -->"], "C", "Python uses the hash character (#) for single-line comments."),
    ("What is the correct extension for Python files?", [" .pyth", ".pt", ".py", ".pyt"], "C", "Python scripts are saved with the .py extension."),
    ("Which collection is ordered, changeable, and allows duplicate members?", ["List", "Tuple", "Set", "Dictionary"], "A", "Lists are ordered and changeable."),
    ("What does the len() function do?", ["Returns the length of an object", "Returns the datatype", "Reverses a string", "None of the above"], "A", "len() returns the number of items in a container."),
    ("Which method can be used to remove any whitespace from both the beginning and the end of a string?", ["strip()", "trim()", "len()", "ptrim()"], "A", "The strip() method removes leading and trailing whitespace."),
    ("How do you create a variable with the numeric value 5?", ["x = 5", "x = int(5)", "Both x = 5 and x = int(5) are correct", "int x = 5"], "C", "Python variables are created when assigned."),
    ("What is the result of 10 % 3?", ["3", "1", "0", "10"], "B", "The modulo operator % returns the remainder of the division.")
]

questions_py_int = [
    ("What is a decorator in Python?", ["A module to style text", "A function that modifies the behavior of another function", "A class attribute", "A syntax error"], "B", "Decorators allow you to wrap another function in order to extend its behavior."),
    ("Which of the following is used to create an iterator in Python?", ["iter() and next()", "create_iter()", "yield()", "loop()"], "A", "The iter() method returns an iterator object, and next() gets the next item."),
    ("What is the output of [x for x in range(3)]?", ["[1, 2, 3]", "[0, 1, 2]", "(0, 1, 2)", "{0, 1, 2}"], "B", "List comprehensions generate lists. range(3) produces 0, 1, 2."),
    ("What does the yield keyword do?", ["Returns a value and terminates", "Pauses execution and returns a generator", "Throws an exception", "Imports a module"], "B", "yield is used in generators to return data while maintaining state."),
    ("How do you handle exceptions in Python?", ["try-catch", "try-except", "do-catch", "catch-exception"], "B", "Python uses try and except blocks to handle errors."),
    ("Which module is used for regular expressions in Python?", ["regex", "re", "regexp", "patterns"], "B", "The re module provides regular expression matching operations."),
    ("What is a lambda function?", ["An anonymous function", "A recursive function", "A multi-line function", "A built-in class"], "A", "Lambda functions are small anonymous functions defined with the lambda keyword."),
    ("What is the difference between deepcopy and shallow copy?", ["They are the same", "Deep copy creates a new object and recursively copies contents", "Shallow copy is faster but recursive", "None of the above"], "B", "Deepcopy creates fully independent clones."),
    ("How can you swap the values of variables x and y?", ["x, y = y, x", "swap(x, y)", "x = y; y = x", "y, x = x, y"], "A", "Tuple unpacking allows swapping without a temporary variable."),
    ("What is the purpose of the __init__ method?", ["To terminate a class", "To initialize instance variables", "To import libraries", "To define class methods"], "B", "__init__ is the constructor method in Python classes.")
]

def format_sql(arr, asm_var):
    sql = ""
    for q, options, correct, expl in arr:
        options_json = json.dumps(options).replace("'", "''")
        q = q.replace("'", "''")
        expl = expl.replace("'", "''")
        sql += f"    INSERT INTO questions (assessment_id, question_text, options, correct_option, explanation) VALUES ({asm_var}, '{q}', '{options_json}', '{correct}', '{expl}');\n"
    return sql

with open("seed_assessments.sql", "w") as f:
    f.write("""DO $$
DECLARE
    cat_python UUID := gen_random_uuid();
    cat_react UUID := gen_random_uuid();
    cat_ds UUID := gen_random_uuid();
    
    asm_py_beg UUID := gen_random_uuid();
    asm_py_int UUID := gen_random_uuid();
    asm_py_adv UUID := gen_random_uuid();
BEGIN
    INSERT INTO skill_categories (id, name, description) VALUES
    (cat_python, 'Python', 'Core Python programming'),
    (cat_react, 'React', 'Frontend development with React'),
    (cat_ds, 'Data Science', 'Data analysis and machine learning');
    
    INSERT INTO assessments (id, title, description, category_id, difficulty, time_limit_minutes, is_active) VALUES
    (asm_py_beg, 'Python Basics', 'Test your knowledge of Python fundamentals.', cat_python, 'beginner', 10, true),
    (asm_py_int, 'Intermediate Python', 'Data structures, OOP, and decorators.', cat_python, 'intermediate', 15, true),
    (asm_py_adv, 'Advanced Python', 'Concurrency, metaprogramming, and internals.', cat_python, 'advanced', 20, true);
""")
    f.write(format_sql(questions_py_beg, 'asm_py_beg'))
    f.write(format_sql(questions_py_int, 'asm_py_int'))
    f.write("END $$;\n")
