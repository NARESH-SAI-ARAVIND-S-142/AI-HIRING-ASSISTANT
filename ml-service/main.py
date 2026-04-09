"""
FastAPI ML Service — PDF parsing and ML scoring endpoints.
Runs on port 8000.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json

from parser import parse_resume
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


class ScoreRequest(BaseModel):
    parsed_resume: dict
    github_data: Optional[dict] = None
    job_keywords: Optional[list] = None


@app.post("/score")
async def score_candidate(request: ScoreRequest):
    """Compute ML-based scores for a candidate."""
    try:
        resume_score = compute_resume_score(request.parsed_resume)
        github_score = compute_github_score(request.github_data) if request.github_data else 0.0
        match_score = compute_match_score(
            request.parsed_resume.get("skills", []),
            request.job_keywords or []
        )
        final_score = compute_final_score(resume_score, github_score, match_score)
        decision = get_decision(final_score)
        
        return {
            "success": True,
            "scores": {
                "resume_score": resume_score,
                "github_score": github_score,
                "match_score": match_score,
                "final_score": final_score,
            },
            "decision": decision,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scoring failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
