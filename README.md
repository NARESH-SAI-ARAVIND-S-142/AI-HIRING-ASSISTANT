# AI-HIRING-ASSISTANT

A decentralized, multi-agent AI hiring platform that evaluates candidates through deep resume parsing, GitHub activity verification, and automated recruiter debates.

## Features
- **Premium UI**: Modern obsidian glassmorphism dashboard with fluid animations.
- **Multi-Agent Engine**: 6 specialized agents collaborating via LLM (Groq Llama-3).
- **GitHub Audit**: Verifiable proof-of-work metrics matched against resume claims.
- **Dynamic Matching**: Real-time evaluation against custom, dynamic job requirements.

## Tech Stack
- **Frontend**: React, Vite, Framer Motion, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB
- **ML Service**: Python, FastAPI, Scikit-Learn, PyMuPDF

## Initial Setup
1. Configure credentials in `.env` (refer to `.env.example`).
2. Install dependencies in `frontend/`, `backend/`, and `ml-service/`.
3. Run `npm run dev` in frontend/backend and `uvicorn` in ml-service.
