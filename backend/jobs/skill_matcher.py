"""
SkillMaster Pro — Skill Matching Engine
========================================
Uses cosine similarity from scikit-learn to compare a student's skill ratings
against career profiles stored in a CSV file, returning the top matching careers
with a match percentage.

How it works:
  1. Student's skill ratings are represented as a vector (e.g., [7, 3, 5, ...])
  2. Each career in the CSV also has a skill vector (same dimensions)
  3. Cosine similarity measures the angle between these two vectors
     - 1.0 = perfect match (vectors point in the same direction)
     - 0.0 = no match (vectors are perpendicular)
  4. We convert similarity to a percentage and return the top N careers
"""

import os
import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

# Path to the career data CSV
CAREERS_CSV_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'careers.csv')

# All skill columns in the CSV (must match the CSV header exactly)
SKILL_COLUMNS = [
    'python', 'javascript', 'react', 'django', 'sql',
    'machine_learning', 'data_analysis', 'html_css', 'nodejs',
    'communication', 'problem_solving', 'teamwork', 'git',
    'docker', 'cloud_computing', 'cybersecurity', 'ui_ux_design',
    'agile', 'testing', 'api_design',
]


def load_career_data():
    """
    Load and cache the career data from the CSV file.

    Returns:
        pd.DataFrame: Career data with skill columns and metadata.
    """
    if not os.path.exists(CAREERS_CSV_PATH):
        raise FileNotFoundError(
            f"Career data CSV not found at: {CAREERS_CSV_PATH}. "
            "Please ensure the file exists in backend/data/careers.csv"
        )
    return pd.read_csv(CAREERS_CSV_PATH)


def get_skill_match(student_skills: dict, top_n: int = 3) -> list[dict]:
    """
    Match a student's skills against career profiles using cosine similarity.

    Args:
        student_skills (dict): A dictionary mapping skill names to ratings (0-10).
            Example: {
                'python': 8,
                'javascript': 6,
                'react': 7,
                'django': 5,
                'sql': 4,
                'machine_learning': 3,
                ...
            }
            Any missing skills will default to 0.

        top_n (int): Number of top matching careers to return. Default is 3.

    Returns:
        list[dict]: Top N matching careers, each containing:
            - career_title (str): Name of the career
            - category (str): Career category (e.g., "Engineering", "Data & AI")
            - match_percentage (float): How well the student matches (0-100%)
            - skill_gaps (list[dict]): Skills where the student falls short,
              each with 'skill', 'student_level', 'required_level', and 'gap'
            - skill_strengths (list[dict]): Skills where the student excels,
              each with 'skill', 'student_level', and 'required_level'

    Example:
        >>> skills = {'python': 9, 'machine_learning': 8, 'data_analysis': 7, 'sql': 6}
        >>> results = get_skill_match(skills, top_n=3)
        >>> print(results[0]['career_title'])
        'Data Scientist'
        >>> print(results[0]['match_percentage'])
        92.5
    """
    # Load career data
    careers_df = load_career_data()

    # Build the student's skill vector (same order as CSV columns)
    # Missing skills default to 0
    student_vector = np.array(
        [[student_skills.get(skill, 0) for skill in SKILL_COLUMNS]]
    )

    # Extract career skill vectors from the DataFrame
    career_vectors = careers_df[SKILL_COLUMNS].values

    # ──────────────────────────────────────────────────────────────
    # COSINE SIMILARITY
    # Computes the cosine of the angle between the student vector
    # and each career vector. Result is a 1×N matrix of similarities.
    # ──────────────────────────────────────────────────────────────
    similarities = cosine_similarity(student_vector, career_vectors)[0]

    # Convert to percentage (0-100) and round to 1 decimal place
    match_percentages = np.round(similarities * 100, 1)

    # Get indices of the top N matches (sorted descending)
    top_indices = np.argsort(match_percentages)[::-1][:top_n]

    # Build the results
    results = []
    for idx in top_indices:
        career_row = careers_df.iloc[idx]
        career_skills = career_row[SKILL_COLUMNS]

        # Identify skill gaps (where student is below career requirement)
        skill_gaps = []
        skill_strengths = []

        for skill in SKILL_COLUMNS:
            student_level = student_skills.get(skill, 0)
            required_level = int(career_skills[skill])

            if student_level < required_level:
                skill_gaps.append({
                    'skill': skill.replace('_', ' ').title(),
                    'student_level': student_level,
                    'required_level': required_level,
                    'gap': required_level - student_level,
                })
            elif student_level >= required_level and required_level >= 5:
                # Only highlight strengths for skills that actually matter
                skill_strengths.append({
                    'skill': skill.replace('_', ' ').title(),
                    'student_level': student_level,
                    'required_level': required_level,
                })

        # Sort gaps by size (biggest gaps first — most important to improve)
        skill_gaps.sort(key=lambda x: x['gap'], reverse=True)

        # Sort strengths by student level (strongest first)
        skill_strengths.sort(key=lambda x: x['student_level'], reverse=True)

        results.append({
            'career_title': career_row['career_title'],
            'category': career_row['category'],
            'match_percentage': float(match_percentages[idx]),
            'skill_gaps': skill_gaps[:5],       # Top 5 biggest gaps
            'skill_strengths': skill_strengths[:5],  # Top 5 strengths
        })

    return results


def get_all_skill_names() -> list[str]:
    """
    Returns a list of all skill names used in the matching engine.
    Useful for the frontend to build the skill rating form.

    Returns:
        list[str]: Human-readable skill names.
    """
    return [skill.replace('_', ' ').title() for skill in SKILL_COLUMNS]


def get_skill_keys() -> list[str]:
    """
    Returns a list of all raw skill keys (as used in the CSV and matching engine).
    Useful for building API requests.

    Returns:
        list[str]: Raw skill column names.
    """
    return SKILL_COLUMNS.copy()
