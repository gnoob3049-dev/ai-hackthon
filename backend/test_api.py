import httpx
import json

BASE_URL = 'http://localhost:8000'

def test_health():
    r = httpx.get(f'{BASE_URL}/health')
    assert r.status_code == 200
    assert r.json()['status'] == 'ok'
    print('PASS: /health')

def test_analyze():
    payload = {
        'emails': [
            'Subject: URGENT - $8000 STEM Excellence Scholarship - Deadline April 25\n\nDear Student,\nApplications are open for the STEM Excellence Scholarship worth $8,000. Eligible: CS/Engineering students with GPA 3.5+, graduating 2025 or 2026. Apply at stemexcellence.org/apply by April 25th. Required: transcript, 2 recommendation letters, 500-word essay.'
        ],
        'profile': {
            'name': 'Sara Ahmed',
            'cgpa': 3.7,
            'major': 'Computer Science',
            'grad_year': 2026,
            'location_pref': 'USA',
            'interests': ['AI/ML', 'Research']
        }
    }
    r = httpx.post(f'{BASE_URL}/analyze', json=payload, timeout=30.0)
    assert r.status_code == 200
    data = r.json()
    assert 'opportunities' in data
    assert data['total_found'] > 0
    opp = data['opportunities'][0]
    assert 'title' in opp
    assert 'score' in opp
    assert 'checklist' in opp
    assert isinstance(opp['checklist'], list)
    print(f'PASS: /analyze - found {data["total_found"]} opportunities')
    print(f'Top result: {opp["title"]} (score: {opp["score"]})')
    print(f'Reason: {opp["reason"]}')

if __name__ == '__main__':
    print('Running OpportunityIQ API tests...')
    test_health()
    test_analyze()
    print('All tests passed!')
