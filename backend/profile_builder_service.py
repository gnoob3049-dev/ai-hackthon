from openai import OpenAI
import json
import os

client = OpenAI(
    api_key=os.getenv('GROQ_API_KEY'),
    base_url="https://api.groq.com/openai/v1"
)

PROFILE_SYSTEM = """You are an expert career and academic advisor. Your job is to analyze a student's resume, GitHub profile stats, and self-reported form data to compile a comprehensive "Skill Level Summary".

You MUST return ONLY valid JSON matching this schema:
{
  "skill_level_summary": "A 2-3 sentence summary of their technical level and experience",
  "strengths": ["array of 3-5 confirmed strong skills or traits"],
  "weaknesses": ["array of 2-3 areas they lack or should improve"],
  "domain_focus": ["array of 1-3 primary tech domains they focus on, e.g. 'Backend Web', 'AI/ML'"],
  "readiness_notes": ["array of 2-3 notes on how ready they are for competitive opportunities"]
}
"""

def generate_llm_profile(form_data: dict, github_data: dict, resume_text: str) -> dict:
    """Passes all aggregate user context to LLM to build the final profile structure."""
    
    prompt = f"""
Student Form Data:
- Name: {form_data.get('name')}
- Degree/Dept: {form_data.get('degree')} in {form_data.get('department')}
- CGPA: {form_data.get('cgpa')}
- Semester: {form_data.get('semester')}
- Self-reported Skills: {', '.join(form_data.get('skills', []))}
- Self-reported Interests: {', '.join(form_data.get('interests', []))}
- Preferred Opportunities: {', '.join(form_data.get('preferred_opportunities', []))}

GitHub Data:
{json.dumps(github_data, indent=2)}

Resume Text Extract (may be messy):
{resume_text[:4000]}
"""
    
    try:
        resp = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            max_tokens=600,
            temperature=0.1,
            messages=[
                {'role': 'system', 'content': PROFILE_SYSTEM},
                {'role': 'user', 'content': prompt}
            ]
        )
        raw = resp.choices[0].message.content.strip().replace('```json', '').replace('```', '')
        return json.loads(raw)
    except Exception as e:
        print(f"Error building LLM profile: {e}")
        return {
            "skill_level_summary": "Extracted profile unavailable due to parsing error.",
            "strengths": form_data.get('skills', []),
            "weaknesses": ["Needs deeper resume analysis"],
            "domain_focus": form_data.get('interests', []),
            "readiness_notes": ["Ready to apply"]
        }
