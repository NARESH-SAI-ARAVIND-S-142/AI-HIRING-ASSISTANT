"""
ML Scoring Engine — Computes resume_score, github_score, and match_score
using feature engineering + a simple sklearn model.
"""

import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import MinMaxScaler
import json


def _train_resume_model():
    """
    Train a simple GradientBoosting model on synthetic resume features.
    Features: [skill_count, years_experience, project_count, education_level, experience_entries]
    Target: resume_score (0-100)
    """
    np.random.seed(42)
    n = 200
    
    skill_count = np.random.randint(1, 25, n).astype(float)
    years_exp = np.random.uniform(0, 15, n)
    project_count = np.random.randint(0, 12, n).astype(float)
    education_level = np.random.randint(0, 4, n).astype(float)  # 0=none, 1=bachelor, 2=master, 3=phd
    experience_entries = np.random.randint(0, 8, n).astype(float)
    
    # Synthetic target based on weighted combination + noise
    score = (
        skill_count * 2.0 +
        years_exp * 3.5 +
        project_count * 2.5 +
        education_level * 5.0 +
        experience_entries * 3.0 +
        np.random.normal(0, 5, n)
    )
    
    # Normalize to 0-100
    score = np.clip(score, 0, 100)
    scaler = MinMaxScaler(feature_range=(0, 100))
    score = scaler.fit_transform(score.reshape(-1, 1)).flatten()
    
    X = np.column_stack([skill_count, years_exp, project_count, education_level, experience_entries])
    
    model = GradientBoostingRegressor(n_estimators=50, max_depth=3, random_state=42)
    model.fit(X, score)
    
    return model


def _train_github_model():
    """
    Train a model for GitHub scoring.
    Features: [total_repos, total_stars, total_forks, languages_count, avg_commits_per_week, has_readme_pct]
    """
    np.random.seed(123)
    n = 200
    
    total_repos = np.random.randint(0, 60, n).astype(float)
    total_stars = np.random.randint(0, 500, n).astype(float)
    total_forks = np.random.randint(0, 100, n).astype(float)
    languages_count = np.random.randint(1, 10, n).astype(float)
    avg_commits = np.random.uniform(0, 30, n)
    readme_pct = np.random.uniform(0, 1, n)
    
    score = (
        np.log1p(total_repos) * 8.0 +
        np.log1p(total_stars) * 6.0 +
        np.log1p(total_forks) * 4.0 +
        languages_count * 3.0 +
        avg_commits * 1.5 +
        readme_pct * 10.0 +
        np.random.normal(0, 5, n)
    )
    
    scaler = MinMaxScaler(feature_range=(0, 100))
    score = scaler.fit_transform(score.reshape(-1, 1)).flatten()
    
    X = np.column_stack([total_repos, total_stars, total_forks, languages_count, avg_commits, readme_pct])
    
    model = GradientBoostingRegressor(n_estimators=50, max_depth=3, random_state=42)
    model.fit(X, score)
    
    return model


# Pre-train models on import
_resume_model = _train_resume_model()
_github_model = _train_github_model()


def compute_resume_score(parsed_resume: dict) -> float:
    """Compute resume score from parsed resume data."""
    education = parsed_resume.get("education", [])
    edu_text = " ".join(education).lower() if education else ""
    
    if "phd" in edu_text or "doctor" in edu_text:
        edu_level = 3
    elif "master" in edu_text or "m.s" in edu_text or "m.tech" in edu_text or "mba" in edu_text:
        edu_level = 2
    elif "bachelor" in edu_text or "b.s" in edu_text or "b.tech" in edu_text or "b.e" in edu_text:
        edu_level = 1
    else:
        edu_level = 0
    
    features = np.array([[
        parsed_resume.get("skill_count", 0),
        parsed_resume.get("years_experience", 0),
        parsed_resume.get("project_count", 0),
        edu_level,
        len(parsed_resume.get("experience", [])),
    ]])
    
    score = _resume_model.predict(features)[0]
    return round(float(np.clip(score, 0, 100)), 1)


def compute_github_score(github_data: dict) -> float:
    """Compute GitHub score from GitHub API data."""
    if not github_data or not github_data.get("repos"):
        return 0.0
    
    repos = github_data.get("repos", [])
    total_repos = len(repos)
    total_stars = sum(r.get("stars", 0) for r in repos)
    total_forks = sum(r.get("forks", 0) for r in repos)
    
    all_languages = set()
    for r in repos:
        langs = r.get("languages", [])
        if isinstance(langs, list):
            all_languages.update(langs)
        elif isinstance(langs, dict):
            all_languages.update(langs.keys())
    
    languages_count = len(all_languages)
    avg_commits = github_data.get("avg_commits_per_week", 0)
    
    # Estimate readme percentage
    readme_count = sum(1 for r in repos if r.get("has_readme", False))
    readme_pct = readme_count / max(total_repos, 1)
    
    features = np.array([[
        total_repos,
        total_stars,
        total_forks,
        languages_count,
        avg_commits,
        readme_pct,
    ]])
    
    score = _github_model.predict(features)[0]
    return round(float(np.clip(score, 0, 100)), 1)


def compute_match_score(skills: list, job_keywords: list) -> float:
    """
    Compute a simple keyword-based match score.
    This is a fallback — the real match scoring uses LLM semantic matching.
    """
    if not skills or not job_keywords:
        return 50.0  # neutral
    
    skills_lower = [s.lower() for s in skills]
    keywords_lower = [k.lower() for k in job_keywords]
    
    if not keywords_lower:
        return 50.0
    
    # Check if any job keyword is a substring of any skill (or vice versa)
    matched = 0
    for kw in keywords_lower:
        if any(kw in sk or sk in kw for sk in skills_lower):
            matched += 1
            
    match_ratio = matched / len(keywords_lower)
    
    score = match_ratio * 100
    return round(float(np.clip(score, 0, 100)), 1)


def compute_final_score(resume_score: float, github_score: float, match_score: float) -> float:
    """
    Compute final weighted score.
    final_score = 0.5 * resume_score + 0.4 * github_score + 0.1 * match_score
    """
    final = 0.5 * resume_score + 0.4 * github_score + 0.1 * match_score
    return round(float(np.clip(final, 0, 100)), 1)


def get_decision(final_score: float) -> str:
    """Get hiring decision based on final score."""
    if final_score >= 70:
        return "Shortlist"
    elif final_score >= 50:
        return "Review"
    else:
        return "Reject"
