# OpportunityIQ Backend
## Setup
```
pip install -r requirements.txt
cp .env.example .env
# Add your Anthropic API key to .env
uvicorn main:app --reload --port 8000
```
## Endpoints
- GET /health
- POST /analyze
