from openai import OpenAI
import json
import asyncio
import os
from typing import List, Dict, Any, Optional
from datetime import datetime

client = OpenAI(
    api_key=os.getenv('GROQ_API_KEY'),
    base_url="https://api.groq.com/openai/v1"
)
MODEL = 'llama-3.3-70b-versatile'

# ─────────────────────────────────────────────
# STEP 1: CLASSIFICATION
# Is this email an academic opportunity?
# ─────────────────────────────────────────────
CLASSIFY_SYSTEM = """You are an email classifier. Your ONLY job is to decide if an email contains an academic opportunity for a university student.

Academic opportunities include: scholarships, internships, research fellowships, competitions, hackathons, grants, study abroad programs, job postings, or application deadlines.

Not opportunities: dining menus, course registration reminders, club socials, spam, general announcements with no actionable opportunity.

Respond with ONLY this JSON. Nothing else. No explanation.
{"is_opportunity": true or false, "confidence": "high" or "medium" or "low", "category": "scholarship" or "internship" or "research" or "competition" or "event" or "deadline" or "spam" or "other"}"""

async def step1_classify(email_text: str, index: int) -> Dict:
    """Returns {index, is_opportunity, confidence, category}"""
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            max_tokens=100,
            temperature=0,
            messages=[
                {'role': 'system', 'content': CLASSIFY_SYSTEM},
                {'role': 'user', 'content': f'Classify this email:\n\n{email_text[:1500]}'}
            ]
        )
        raw = resp.choices[0].message.content.strip()
        result = json.loads(raw)
        result['index'] = index
        result['email_text'] = email_text
        return result
    except Exception as e:
        print(f'Step1 error on email {index}: {e}')
        return {'index': index, 'is_opportunity': False, 'confidence': 'low', 'category': 'other', 'email_text': email_text}

# ─────────────────────────────────────────────
# STEP 2: EXTRACTION
# Pull structured fields from confirmed opportunities
# ─────────────────────────────────────────────
EXTRACT_SYSTEM = """You are a data extraction engine for academic opportunities. Extract all relevant fields from the email and return ONLY a JSON object. No markdown. No explanation. Just raw JSON.

Return this exact structure:
{
  "title": "short descriptive name of the opportunity",
  "organization": "company or institution name",
  "type": "one of: scholarship / internship / research / competition / hackathon / grant / job / event / other",
  "deadline": "YYYY-MM-DD format or null if not mentioned",
  "deadline_text": "human readable deadline like 'April 25, 2025' or 'Rolling' or 'Not specified'",
  "stipend_or_amount": "monetary value if mentioned, else null",
  "location": "city/country or 'Remote' or 'On-campus' or null",
  "duration": "e.g. '12 weeks' or '1 semester' or null",
  "eligibility": {
    "min_cgpa": number or null,
    "majors": ["list of eligible majors or empty array"],
    "year": ["freshman", "sophomore", "junior", "senior", "graduate"] or empty array,
    "citizenship": "e.g. 'US citizens only' or null",
    "other": "any other eligibility text"
  },
  "requirements": ["list of required documents or steps"],
  "apply_link": "URL if mentioned else null",
  "summary": "one sentence describing this opportunity"
}"""

async def step2_extract(email_text: str, category: str) -> Dict:
    """Returns structured fields from the email"""
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            max_tokens=600,
            temperature=0,
            messages=[
                {'role': 'system', 'content': EXTRACT_SYSTEM},
                {'role': 'user', 'content': f'Extract opportunity data from this email (category hint: {category}):\n\n{email_text}'}
            ]
        )
        raw = resp.choices[0].message.content.strip().replace('```json', '').replace('```', '')
        return json.loads(raw)
    except Exception as e:
        print(f'Step2 extraction error: {e}')
        return {'title': 'Unknown Opportunity', 'type': category, 'deadline': None, 'deadline_text': 'Not specified', 'eligibility': {}, 'requirements': [], 'apply_link': None, 'summary': 'Could not extract details.'}

# ─────────────────────────────────────────────
# STEP 3: EXPLANATION + SCORING
# Personalize relevance against student profile
# ─────────────────────────────────────────────
EXPLAIN_SYSTEM = """You are a personalized opportunity advisor for university students. Given a structured opportunity AND a student profile (which includes LLM-generated strengths, weaknesses, and a skill summary), you must:
1. Calculate a match score 0-100 based on their actual strengths vs the opportunity's requirements.
2. Determine urgency (high/medium/low).
3. Write a one-sentence reason explaining why it matches.
4. Identify a 'gap_insight' if they lack a specific skill required.
5. Generate an array of 'application_guidance' (steps to apply).
6. Generate an array of 'interview_guidance' (how to prep based on weaknesses).
7. Create a 'preparation_checklist' (3-5 specific steps).
8. Add a 'deadline_warning' string if it's within 14 days, else null.

Respond ONLY with this JSON. No markdown. No explanation:
{
  "score": integer 0-100,
  "urgency": "high" or "medium" or "low",
  "reason": "one sentence reason",
  "gap_insight": "string or null",
  "application_guidance": ["string"],
  "interview_guidance": ["string"],
  "preparation_checklist": ["string"],
  "deadline_warning": "string or null"
}"""

async def step3_explain(extracted: Dict, profile: Dict) -> Dict:
    """Returns score, urgency, reason, gap_insight, checklist"""
    today = datetime.now().strftime('%Y-%m-%d')
    profile_text = f"""Student Profile:
- Name: {profile.get('name')}
- CGPA: {profile.get('cgpa')}
- Degree: {profile.get('degree')} in {profile.get('department')}
- Semester: {profile.get('semester')}
- Skills: {profile.get('skills', 'Not specified')}
- Interests: {', '.join(profile.get('interests', []))}
- Inferred Skill Summary: {profile.get('skill_level_summary', 'None')}
- Strengths: {', '.join(profile.get('strengths', []))}
- Weaknesses: {', '.join(profile.get('weaknesses', []))}
- Readiness Notes: {', '.join(profile.get('readiness_notes', []))}
Today's date: {today}"""
    opp_text = json.dumps(extracted, indent=2)
    try:
        resp = client.chat.completions.create(
            model=MODEL,
            max_tokens=400,
            temperature=0,
            messages=[
                {'role': 'system', 'content': EXPLAIN_SYSTEM},
                {'role': 'user', 'content': f'{profile_text}\n\nOpportunity:\n{opp_text}'}
            ]
        )
        raw = resp.choices[0].message.content.strip().replace('```json', '').replace('```', '')
        return json.loads(raw)
    except Exception as e:
        print(f'Step3 explain error: {e}')
        return {'score': 50, 'urgency': 'medium', 'reason': 'Error generating explanation', 'gap_insight': None, 'application_guidance': [], 'interview_guidance': [], 'preparation_checklist': [], 'deadline_warning': None}

# ─────────────────────────────────────────────
# MAIN PIPELINE ORCHESTRATOR
# ─────────────────────────────────────────────
async def analyze_with_claude(emails: List[str], profile: Dict[str, Any]) -> List[Dict]:
    """Runs all 3 steps and returns sorted opportunities list"""
    print(f'Pipeline: classifying {len(emails)} emails...')
    
    # Step 1: Classify all emails IN PARALLEL
    classify_tasks = [step1_classify(email, i) for i, email in enumerate(emails)]
    classifications = await asyncio.gather(*classify_tasks)
    
    opportunities_raw = [c for c in classifications if c.get('is_opportunity')]
    print(f'Pipeline: {len(opportunities_raw)}/{len(emails)} emails are opportunities')
    
    if not opportunities_raw:
        return []
    
    # Step 2: Extract from each opportunity (parallel)
    extract_tasks = [step2_extract(c['email_text'], c['category']) for c in opportunities_raw]
    extractions = await asyncio.gather(*extract_tasks)
    
    # Step 3: Explain + score each (parallel)
    explain_tasks = [step3_explain(ext, profile) for ext in extractions]
    explanations = await asyncio.gather(*explain_tasks)
    
    # Merge all three steps into final objects
    results = []
    for i, (classify, extract, explain) in enumerate(zip(opportunities_raw, extractions, explanations)):
        results.append({
            'title': extract.get('title', 'Unknown'),
            'organization': extract.get('organization'),
            'type': extract.get('type', classify['category']),
            'deadline': extract.get('deadline'),
            'deadline_text': extract.get('deadline_text', 'Not specified'),
            'stipend_or_amount': extract.get('stipend_or_amount'),
            'location': extract.get('location'),
            'duration': extract.get('duration'),
            'eligibility': extract.get('eligibility', {}),
            'requirements': extract.get('requirements', []),
            'apply_link': extract.get('apply_link'),
            'summary': extract.get('summary', ''),
            'score': explain.get('score', 0),
            'urgency': explain.get('urgency', 'low'),
            'reason': explain.get('reason', ''),
            'gap_insight': explain.get('gap_insight'),
            'application_guidance': explain.get('application_guidance', []),
            'interview_guidance': explain.get('interview_guidance', []),
            'preparation_checklist': explain.get('preparation_checklist', []),
            'deadline_warning': explain.get('deadline_warning'),
            'classify_confidence': classify.get('confidence', 'low'),
            'raw_email_index': classify.get('index', i)
        })
    
    # Sort by score descending
    results.sort(key=lambda x: x['score'], reverse=True)
    
    # Duplicate detection: flag items with same title or very similar deadlines
    seen_titles = {}
    for r in results:
        key = r['title'].lower()[:40]
        if key in seen_titles:
            r['is_duplicate'] = True
            r['duplicate_of'] = seen_titles[key]
        else:
            r['is_duplicate'] = False
            seen_titles[key] = r['title']
    
    print(f'Pipeline complete: {len(results)} opportunities ranked')
    return results
