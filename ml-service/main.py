"""
FastAPI ML Service — PDF parsing and ML scoring endpoints.
Runs on port 8000.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json

import re

from parser import parse_resume, parse_resume_text
from scorer import (
    compute_resume_score,
    compute_github_score,
    compute_match_score,
    compute_final_score,
    get_decision,
)

app = FastAPI(title="AI Hiring Assistant — ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "service": "ml-service"}


@app.post("/parse")
async def parse_pdf(file: UploadFile = File(...)):
    """Parse a PDF resume and return structured data."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    try:
        pdf_bytes = await file.read()
        result = parse_resume(pdf_bytes)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse PDF: {str(e)}")


def run_bias_audit(parsed_resume: dict, github_data: dict, job_keywords: list, original_final_score: float, github_status: str = "audited") -> dict:
    text = parsed_resume.get("raw_text", "")
    
    # 1. Strip candidate name
    name = parsed_resume.get("name", "")
    if name and name != "Unknown":
        text = text.replace(name, "[REDACTED]")
    
    # Strip gender-coded words
    gender_words = [r"\bhe\b", r"\bhim\b", r"\bhis\b", r"\bshe\b", r"\bher\b", r"\bhers\b", r"\bmale\b", r"\bfemale\b"]
    for gw in gender_words:
        text = re.sub(gw, "[REDACTED]", text, flags=re.IGNORECASE)
        
    # Strip university names (simple heuristic)
    text = re.sub(r"(?i)\b(?:university|college|institute|academy)[a-z\s]*", "[REDACTED]", text)
    
    # 2. Re-score
    anonymized_resume = parse_resume_text(text)
    r_score, _, _ = compute_resume_score(anonymized_resume)
    g_score, _, _ = compute_github_score(github_data) if github_data else (0.0, "", 0.0)
    m_score, _, _ = compute_match_score(anonymized_resume.get("skills", []), job_keywords)
    anonymized_final_score, _, _ = compute_final_score(r_score, g_score, m_score, github_status)
    
    # 3. Compute delta
    bias_delta = round(original_final_score - anonymized_final_score, 1)
    bias_risk = abs(bias_delta) > 8.0
    
    warning = f"Bias risk detected. Delta: {abs(bias_delta)} pts." if bias_risk else None
        
    return {
        "original_score": original_final_score,
        "anonymized_score": anonymized_final_score,
        "bias_delta": bias_delta,
        "bias_risk": bias_risk,
        "warning": warning
    }


class ScoreRequest(BaseModel):
    parsed_resume: dict
    github_data: Optional[dict] = None
    job_keywords: Optional[list] = None
    github_status: Optional[str] = "audited"


@app.post("/score")
async def score_candidate(request: ScoreRequest):
    """Compute ML-based scores for a candidate."""
    try:
        resume_score, r_res, r_conf = compute_resume_score(request.parsed_resume)
        github_score, g_res, g_conf = compute_github_score(request.github_data) if request.github_data else (0.0, "No GitHub data", 0.0)
        match_score, m_res, m_conf = compute_match_score(
            request.parsed_resume.get("skills", []),
            request.job_keywords or []
        )
        final_score, f_res, f_conf = compute_final_score(resume_score, github_score, match_score, request.github_status)
        decision = get_decision(final_score)
        
        bias_audit = run_bias_audit(request.parsed_resume, request.github_data, request.job_keywords or [], final_score, request.github_status)
        
        return {
            "success": True,
            "scores": {
                "resume_score": resume_score,
                "github_score": github_score,
                "match_score": match_score,
                "final_score": final_score,
                "reasoning": {
                    "resume": r_res,
                    "github": g_res,
                    "match": m_res,
                    "final": f_res
                },
                "confidence_score": round((r_conf + g_conf + m_conf) / 3, 2)
            },
            "bias_audit": bias_audit,
            "decision": decision,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
