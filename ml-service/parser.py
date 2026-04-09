"""
Resume PDF Parser — Extracts structured data from resume PDFs using PyMuPDF.
"""

import fitz  # PyMuPDF
import re
import io
from typing import Optional


# Common skills to look for in resumes
KNOWN_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "ruby",
    "swift", "kotlin", "php", "scala", "r", "matlab", "sql", "html", "css", "sass",
    "react", "angular", "vue", "next.js", "nuxt.js", "svelte", "node.js", "express",
    "django", "flask", "fastapi", "spring", "spring boot", ".net", "rails",
    "tensorflow", "pytorch", "keras", "scikit-learn", "pandas", "numpy", "opencv",
    "docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ansible",
    "jenkins", "github actions", "ci/cd", "git", "linux",
    "mongodb", "postgresql", "mysql", "redis", "elasticsearch", "cassandra",
    "graphql", "rest api", "grpc", "websocket", "kafka", "rabbitmq",
    "machine learning", "deep learning", "nlp", "computer vision",
    "data science", "data engineering", "devops", "cloud computing",
    "agile", "scrum", "jira", "figma", "tailwind", "bootstrap",
]


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract all text from a PDF file."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
        # Extract embedded hyperlinks because many resumes don't type the full literal URL out
        for link in page.get_links():
            if 'uri' in link:
                text += link['uri'] + "\n"
    doc.close()
    return text


def extract_name(text: str) -> str:
    """Extract candidate name (usually the first line of a resume)."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    if lines:
        # First non-empty line is typically the name
        name = lines[0]
        # Filter out common non-name first lines
        skip_words = ["resume", "curriculum", "cv", "vitae", "portfolio"]
        if any(w in name.lower() for w in skip_words) and len(lines) > 1:
            name = lines[1]
        return name[:100]  # cap length
    return "Unknown"


def extract_email(text: str) -> Optional[str]:
    """Extract email address from text."""
    match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    """Extract phone number from text."""
    match = re.search(r'[\+]?[\d\s\-\(\)]{10,15}', text)
    if match:
        phone = re.sub(r'[^\d+]', '', match.group(0))
        if len(phone) >= 10:
            return phone
    return None


def extract_github_url(text: str) -> Optional[str]:
    """Extract GitHub profile URL from text."""
    match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9\-_]+)', text)
    if match:
        url = match.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        return url
    return None


def extract_github_username(text: str) -> Optional[str]:
    """Extract GitHub username from text."""
    match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([a-zA-Z0-9\-_]+)', text)
    return match.group(1) if match else None


def extract_linkedin_url(text: str) -> Optional[str]:
    """Extract LinkedIn profile URL."""
    match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9\-_]+)', text)
    if match:
        url = match.group(0)
        if not url.startswith("http"):
            url = "https://" + url
        return url
    return None


def extract_skills(text: str) -> list:
    """Extract skills by matching against known skill keywords."""
    text_lower = text.lower()
    found_skills = []
    for skill in KNOWN_SKILLS:
        # Use word boundary matching for short skills, substring for longer ones
        if len(skill) <= 3:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found_skills.append(skill)
        else:
            if skill in text_lower:
                found_skills.append(skill)
    return sorted(list(set(found_skills)))


def extract_experience(text: str) -> list:
    """Extract work experience entries."""
    experiences = []
    # Look for patterns like "Company Name | Role | Date" or "Role at Company"
    # Also look for date ranges
    date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{4})\s*[-–—to]+\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]*\d{4}|[Pp]resent|[Cc]urrent)'
    
    lines = text.split('\n')
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        date_match = re.search(date_pattern, line)
        if date_match:
            # Try to extract role and company from surrounding lines
            context_start = max(0, i - 2)
            context_end = min(len(lines), i + 3)
            context = ' '.join(lines[context_start:context_end]).strip()
            experiences.append({
                "period": f"{date_match.group(1)} - {date_match.group(2)}",
                "description": context[:300]
            })
        i += 1
    
    # Also try to find year-based patterns like "2020 - 2023"
    year_pattern = r'(20\d{2})\s*[-–—to]+\s*(20\d{2}|[Pp]resent|[Cc]urrent)'
    for i, line in enumerate(lines):
        year_match = re.search(year_pattern, line)
        if year_match:
            already_found = any(year_match.group(1) in e.get("period", "") for e in experiences)
            if not already_found:
                context_start = max(0, i - 1)
                context_end = min(len(lines), i + 2)
                context = ' '.join(lines[context_start:context_end]).strip()
                experiences.append({
                    "period": f"{year_match.group(1)} - {year_match.group(2)}",
                    "description": context[:300]
                })
    
    return experiences[:10]  # cap at 10 entries


def extract_projects(text: str) -> list:
    """Extract project entries from resume."""
    projects = []
    text_lower = text.lower()
    
    # Find project section
    project_section_patterns = [
        r'(?:projects?|personal projects?|key projects?|notable projects?)\s*[:\n]',
    ]
    
    for pattern in project_section_patterns:
        match = re.search(pattern, text_lower)
        if match:
            # Extract text after the project header
            start = match.end()
            # Find the next section header
            next_section = re.search(
                r'\n\s*(?:education|experience|skills|certifications?|awards?|publications?|references?)\s*[:\n]',
                text_lower[start:]
            )
            end = start + next_section.start() if next_section else min(start + 2000, len(text))
            project_text = text[start:end]
            
            # Split by bullet points or numbered items
            items = re.split(r'\n\s*[•●▪▸\-\*]\s*|\n\s*\d+[\.\)]\s*', project_text)
            for item in items:
                item = item.strip()
                if len(item) > 15:  # minimum meaningful length
                    projects.append({
                        "name": item[:100].split('\n')[0],
                        "description": item[:500]
                    })
            break
    
    return projects[:10]


def extract_education(text: str) -> list:
    """Extract education entries."""
    education = []
    degree_patterns = [
        r'(?:B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|Bachelor|Master|Doctor|MBA|B\.?Tech|M\.?Tech|B\.?E\.?|M\.?E\.?)',
    ]
    
    lines = text.split('\n')
    for i, line in enumerate(lines):
        for pattern in degree_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                context_start = max(0, i - 1)
                context_end = min(len(lines), i + 3)
                context = ' '.join(l.strip() for l in lines[context_start:context_end] if l.strip())
                education.append(context[:300])
                break
    
    return list(set(education))[:5]


def compute_years_experience(experiences: list) -> float:
    """Estimate total years of experience from date ranges."""
    import datetime
    total_months = 0
    
    for exp in experiences:
        period = exp.get("period", "")
        years = re.findall(r'20\d{2}', period)
        if len(years) >= 2:
            try:
                start_year = int(years[0])
                end_year = int(years[1])
                total_months += (end_year - start_year) * 12
            except ValueError:
                pass
        elif len(years) == 1 and ('present' in period.lower() or 'current' in period.lower()):
            try:
                start_year = int(years[0])
                current_year = datetime.datetime.now().year
                total_months += (current_year - start_year) * 12
            except ValueError:
                pass
    
    return round(total_months / 12, 1)


def parse_resume(pdf_bytes: bytes) -> dict:
    """Main entry point — parse a PDF resume and return structured data."""
    text = extract_text_from_pdf(pdf_bytes)
    
    skills = extract_skills(text)
    experience = extract_experience(text)
    projects = extract_projects(text)
    education = extract_education(text)
    years_exp = compute_years_experience(experience)
    
    return {
        "name": extract_name(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
        "github_url": extract_github_url(text),
        "github_username": extract_github_username(text),
        "linkedin_url": extract_linkedin_url(text),
        "skills": skills,
        "experience": experience,
        "projects": projects,
        "education": education,
        "years_experience": years_exp,
        "skill_count": len(skills),
        "project_count": len(projects),
        "raw_text": text[:5000],  # cap raw text for LLM context
    }
