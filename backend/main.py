from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime
import os
import json
import shutil
from gmail_service import gmail_service
from database import get_db
from resume_parser_service import extract_text_from_pdf
from github_analyzer_service import fetch_github_profile_data
from profile_builder_service import generate_llm_profile

from contextlib import asynccontextmanager
from scheduler_service import start_scheduler, stop_scheduler, get_scheduler_status

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(title='OpportunityIQ API', version='1.0.0', lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class StudentProfile(BaseModel):
    name: str
    cgpa: float
    major: str
    grad_year: int
    location_pref: str
    interests: List[str]
    semester: Optional[str] = None
    department: Optional[str] = None
    skills: Optional[str] = None

class AnalyzeRequest(BaseModel):
    emails: List[str]
    profile: StudentProfile

class AnalyzeGmailRequest(BaseModel):
    profile: StudentProfile

class EligibilityDetail(BaseModel):
    min_cgpa: Optional[float] = None
    majors: List[str] = []
    year: List[str] = []
    citizenship: Optional[str] = None
    other: Optional[str] = None

class Opportunity(BaseModel):
    title: str
    organization: Optional[str] = None
    type: str
    deadline: Optional[str] = None
    deadline_text: str
    stipend_or_amount: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    eligibility: Optional[EligibilityDetail] = None
    requirements: List[str] = []
    apply_link: Optional[str] = None
    summary: Optional[str] = None
    score: int
    urgency: str
    reason: str
    gap_insight: Optional[str] = None
    checklist: List[str] = []
    classify_confidence: Optional[str] = None
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None
    raw_email_index: int

class PipelineStats(BaseModel):
    emails_received: int
    opportunities_found: int
    spam_filtered: int
    duplicates_detected: int
    processing_time_ms: int

class AnalyzeResponse(BaseModel):
    opportunities: List[Opportunity]
    total_found: int
    pipeline_stats: PipelineStats

@app.get('/health')
def health_check():
    return {
        'status': 'ok',
        'service': 'OpportunityIQ API',
        'version': '1.0.0',
    }

@app.post('/analyze', response_model=AnalyzeResponse)
async def analyze_emails(request: AnalyzeRequest):
    import time
    from ai_engine import analyze_with_claude
    start = time.time()
    if not request.emails:
        raise HTTPException(status_code=400, detail='No emails provided')
    if len(request.emails) > 15:
        raise HTTPException(status_code=400, detail='Maximum 15 emails allowed per run.')
    clean_emails = [e for e in request.emails if e.strip()]
    opportunities = await analyze_with_claude(
        clean_emails,
        request.profile.dict()
    )
    elapsed = int((time.time() - start) * 1000)
    duplicates = sum(1 for o in opportunities if o.get('is_duplicate', False))
    stats = PipelineStats(
        emails_received=len(clean_emails),
        opportunities_found=len(opportunities),
        spam_filtered=len(clean_emails) - len(opportunities),
        duplicates_detected=duplicates,
        processing_time_ms=elapsed
    )
    return AnalyzeResponse(
        opportunities=[Opportunity(**o) for o in opportunities],
        total_found=len(opportunities),
        pipeline_stats=stats
    )

@app.get('/auth/status')
def auth_status():
    return {'connected': gmail_service.is_connected()}

@app.get('/scheduler/status')
def scheduler_status():
    from scheduler_service import get_scheduler_status
    return get_scheduler_status()

@app.post('/scheduler/trigger')
async def trigger_jobs():
    from scheduler_service import run_profile_refresh, run_email_rescan
    import asyncio
    await asyncio.gather(run_profile_refresh(), run_email_rescan())
    return {'triggered': True, 'timestamp': datetime.utcnow().isoformat()}

@app.get('/notify/status/{user_id}')
def notification_status(user_id: str):
    from notification_service import get_opportunity_count
    return get_opportunity_count(user_id)

@app.post('/notify/reset/{user_id}')
def reset_notification(user_id: str):
    from notification_service import reset_opportunity_counter
    return reset_opportunity_counter(user_id)

@app.post('/notify/increment/{user_id}')
def increment_notification(user_id: str, count: int = 1):
    from notification_service import increment_opportunity_counter
    return increment_opportunity_counter(user_id, count)

PROFILE_FILE = os.path.join(os.path.dirname(__file__), 'data', 'profile.json')

def _save_profile_local(profile: dict):
    """Save profile to local JSON file as primary storage."""
    os.makedirs(os.path.dirname(PROFILE_FILE), exist_ok=True)
    with open(PROFILE_FILE, 'w') as f:
        json.dump(profile, f, indent=2)

def _load_profile_local():
    """Load profile from local JSON file."""
    if os.path.exists(PROFILE_FILE):
        with open(PROFILE_FILE, 'r') as f:
            return json.load(f)
    return None

@app.post('/profile/setup')
async def setup_profile(
    name: str = Form(...),
    degree: str = Form(""),
    department: str = Form(""),
    cgpa: float = Form(0.0),
    semester: str = Form(""),
    github_url: str = Form(""),
    skills: str = Form(""),
    interests: str = Form(""),
    resume: Optional[UploadFile] = File(None)
):
    try:
        # 1. Parse PDF if provided
        resume_text = ""
        if resume:
            os.makedirs('uploads', exist_ok=True)
            file_path = f"uploads/{resume.filename}"
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(resume.file, buffer)
            resume_text = extract_text_from_pdf(file_path)
            
        # 2. Parse GitHub if provided
        github_data = {}
        if github_url and github_url.strip():
            github_data = fetch_github_profile_data(github_url)
        
        # Form Data Dictionary
        interest_list = [i.strip() for i in interests.split(',') if i.strip()]
        skill_list = [s.strip() for s in skills.split(',') if s.strip()]
        
        form_data = {
            "name": name,
            "degree": degree,
            "department": department,
            "cgpa": cgpa,
            "semester": semester,
            "github_url": github_url,
            "skills": skill_list,
            "interests": interest_list
        }
        
        # Generate Profile Summary via LLM
        profile_summary = generate_llm_profile(form_data, github_data, resume_text)
        
        # Final Profile Object
        final_profile = {
            "user_id": "demo_user",
            "full_name": name,
            "degree": degree,
            "department": department,
            "cgpa": cgpa,
            "semester": semester,
            "github_url": github_url,
            "skills": skill_list,
            "interests": interest_list,
            "resume_text": resume_text,
            "skill_level_summary": profile_summary,
            "last_profile_updated_at": datetime.utcnow().isoformat()
        }
        
        # Save locally (always works)
        _save_profile_local(final_profile)
        
        # Save to Supabase (best-effort backup)
        try:
            db = get_db()
            if db:
                db.table('user_profiles').upsert(final_profile).execute()
        except Exception as db_err:
            print(f"[Profile] Supabase save failed (non-critical): {db_err}")
            
        return {"status": "success", "profile": final_profile}
        
    except Exception as e:
        print(f"Error in setup_profile: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get('/profile')
async def get_profile():
    # 1. Try local file first (fast, always works)
    local_profile = _load_profile_local()
    if local_profile:
        return local_profile
    
    # 2. Fallback to Supabase
    import asyncio
    db = get_db()
    if not db:
        raise HTTPException(status_code=404, detail="No profile found. Please set up your profile.")
    try:
        loop = asyncio.get_event_loop()
        res = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: db.table('user_profiles').select('*').eq('user_id', 'demo_user').execute()),
            timeout=5.0
        )
        if not res.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        # Cache locally for future fast access
        _save_profile_local(res.data[0])
        return res.data[0]
    except asyncio.TimeoutError:
        print("[Profile] Supabase query timed out after 5s")
        raise HTTPException(status_code=404, detail="Database query timed out. Please set up your profile.")
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Profile] Error fetching profile: {e}")
        raise HTTPException(status_code=404, detail="Could not fetch profile. Please set up your profile.")

@app.post('/auth/connect')
def auth_connect():
    try:
        gmail_service.get_service()
        return {'status': 'connected'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post('/analyze/gmail', response_model=AnalyzeResponse)
async def analyze_gmail():
    import time
    from ai_engine import analyze_with_claude
    start = time.time()
    
    # 1. Verify Profile Exists
    db = get_db()
    if not db:
        raise HTTPException(status_code=500, detail="Database not configured")
    user_res = db.table('user_profiles').select('*').eq('user_id', 'demo_user').execute()
    if not user_res.data:
        raise HTTPException(status_code=400, detail="Profile setup required before analyzing")
    profile = user_res.data[0]
    
    # 2. Verify Gmail Connection
    if not gmail_service.is_connected():
        raise HTTPException(status_code=401, detail='Gmail is not connected. Please connect first.')
        
    # 3. Fetch Incremental Unprocessed Emails
    emails = gmail_service.fetch_recent_unprocessed_emails(limit=15)
    
    if not emails:
        return AnalyzeResponse(
            opportunities=[],
            total_found=0,
            pipeline_stats=PipelineStats(
                emails_received=0,
                opportunities_found=0,
                spam_filtered=0,
                duplicates_detected=0,
                processing_time_ms=0
            )
        )
        
    # 5. Run AI Analysis
    results = await analyze_with_claude(emails, profile)
    
    # 6. Increment notification counter (for future check-ins)
    if results:
        from notification_service import increment_opportunity_counter
        increment_opportunity_counter('demo_user', len(results))
    
    # 7. Deduplicate and Save to Supabase (Optional: already handled inside analyze_with_claude logic or here) * 1000)
    opportunities = results
    elapsed = int((time.time() - start) * 1000)
    duplicates = sum(1 for o in opportunities if o.get('is_duplicate', False))
    stats = PipelineStats(
        emails_received=len(emails),
        opportunities_found=len(opportunities),
        spam_filtered=len(emails) - len(opportunities),
        duplicates_detected=duplicates,
        processing_time_ms=elapsed
    )
    return AnalyzeResponse(
        opportunities=[Opportunity(**o) for o in opportunities],
        total_found=len(opportunities),
        pipeline_stats=stats
    )

if __name__ == '__main__':
    import uvicorn
    port = int(os.getenv('PORT', 8000))
    print(f'Starting OpportunityIQ API on port {port}')
    uvicorn.run('main:app', host='0.0.0.0', port=port, reload=True)
@app.post('/analyze/manual', response_model=AnalyzeResponse)
async def analyze_manual(request: AnalyzeRequest):
    import time
    from ai_engine import analyze_with_claude
    start = time.time()
    
    # Run analysis directly on provided emails
    results = await analyze_with_claude(request.emails, request.profile.dict())
    
    elapsed = int((time.time() - start) * 1000)
    stats = PipelineStats(
        emails_received=len(request.emails),
        opportunities_found=len(results),
        spam_filtered=len(request.emails) - len(results),
        processing_time_ms=elapsed
    )
    
    return AnalyzeResponse(
        opportunities=results,
        total_found=len(results),
        pipeline_stats=stats
    )
