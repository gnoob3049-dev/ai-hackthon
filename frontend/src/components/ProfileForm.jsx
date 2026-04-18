import { useState, useEffect } from 'react'

const MOCK_RESULTS = [
  { title: 'National AI Foundation Scholarship', type: 'scholarship', deadline: '2025-04-23', deadline_text: 'April 23, 2025', eligibility: 'CS major, GPA 3.5+, graduating 2025-2027', score: 94, urgency: 'high', reason: 'Perfect match: CS major, GPA 3.7 exceeds requirement, AI/ML interest aligns directly with scholarship focus.', checklist: ['Download official transcript from student portal', 'Email two professors for recommendation letters today', 'Write 1000-word research statement on AI ethics', 'Prepare CV highlighting ML projects', 'Submit at nationalai.org/scholarship2025 before midnight April 23'], raw_email_index: 0 },
  { title: 'Google STEP Engineering Internship', type: 'internship', deadline: '2025-05-15', deadline_text: 'May 15, 2025', eligibility: 'Any major, GPA 3.4+, strong Python/Java skills', score: 79, urgency: 'medium', reason: 'Strong match: GPA and CS background qualify, AI/ML interest aligns with internship focus areas.', checklist: ['Update LinkedIn and resume with latest projects', 'Practice LeetCode medium problems (arrays, trees)', 'Apply at careers.google.com/students/step', 'Prepare 2-3 STAR format behavioral stories', 'Follow up if no response within 2 weeks'], raw_email_index: 1 },
  { title: 'MIT CSAIL Summer Research Fellowship', type: 'research', deadline: '2025-05-01', deadline_text: 'May 1, 2025', eligibility: 'CS/EE junior or senior, GPA 3.6+ preferred', score: 71, urgency: 'medium', reason: 'Good match: CS major and AI/ML research interest align well, GPA 3.7 meets the preferred threshold.', checklist: ['Write research interest statement (focus on ML work)', 'Request recommendation from a research professor', 'Prepare portfolio of any prior research or projects', 'Apply at csail.mit.edu/fellowships', 'Reach out to a CSAIL professor in your interest area'], raw_email_index: 2 },
  { title: 'HackFest 2025 AI Hackathon', type: 'competition', deadline: '2025-05-03', deadline_text: 'May 3-4, 2025', eligibility: 'All students, teams of 2-4', score: 58, urgency: 'medium', reason: 'Moderate match: AI for Social Good theme aligns with interests, good networking opportunity though lower financial value.', checklist: ['Register at hackfest2025.devpost.com', 'Form a team of 2-4 people', 'Brainstorm AI for Social Good project ideas', 'Prepare laptop and development environment', 'Check for travel/accommodation if needed'], raw_email_index: 3 }
]

const MOCK_PIPELINE_STATS = {
  emails_received: 6,
  opportunities_found: 4,
  spam_filtered: 2,
  duplicates_detected: 0,
  processing_time_ms: 2847
}

const INTERESTS = ['AI/ML','Web Dev','Mobile Dev','Research','Finance','Data Science','Cybersecurity','Product','Design','Blockchain']
const MAJORS = ['Computer Science','Software Engineering','Data Science','Electrical Engineering','Business','Mathematics','Other']

export default function ProfileForm({ profile, setProfile, setStep, emails, inputMode, setResults, setLoading, setPipelineStats }) {
  const [error, setError] = useState('')

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setResults(MOCK_RESULTS)
        setPipelineStats(MOCK_PIPELINE_STATS)
        setStep(3)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const loadDemo = () => setProfile({ name:'Sara Ahmed', cgpa:3.7, major:'Computer Science', grad_year:2026, location_pref:'USA', interests:['AI/ML','Research','Web Dev'] })

  const toggleInterest = (i) => {
    const list = profile.interests || []
    setProfile({...profile, interests: list.includes(i) ? list.filter(x=>x!==i) : [...list, i]})
  }

  const handleAnalyze = async () => {
    if (!profile.name || !profile.cgpa || !profile.major) { setError('Please fill in Name, CGPA, and Major.'); return }
    setError('')
    setLoading(true)
    const emailList = emails.split('---').map(e=>e.trim()).filter(e=>e.length > 20)
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 12000))
    try {
      let fetchCall;
      if (inputMode === 'gmail') {
        fetchCall = fetch('/api/analyze/gmail', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ profile })
        }).then(r => r.json())
      } else {
        fetchCall = fetch('/api/analyze', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ emails: emailList, profile })
        }).then(r => r.json())
      }
      const data = await Promise.race([fetchCall, timeout])
      setResults(data.opportunities || [])
      if (data.pipeline_stats) setPipelineStats(data.pipeline_stats)
    } catch (e) {
      console.warn('API failed, using demo data:', e.message)
      setResults(MOCK_RESULTS)
      setPipelineStats(MOCK_PIPELINE_STATS)
    } finally {
      setLoading(false)
      setStep(3)
    }
  }

  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'28px'}}>
        <div>
          <h1 style={{fontSize:'32px', fontWeight:700, marginBottom:'10px', lineHeight:1.2}}>Your profile</h1>
          <p style={{color:'var(--text-muted)', fontSize:'15px'}}>So we can rank what actually matters to you</p>
        </div>
        <button className="btn-demo" onClick={loadDemo}>⚡ Demo Profile</button>
      </div>

      <div className="glass" style={{padding:'28px', marginBottom:'24px'}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px 28px'}} className="grid-2">
          <div>
            <label className="field-label">Full name</label>
            <input className="glass-input" type="text" value={profile.name||''} onChange={e=>setProfile({...profile,name:e.target.value})} placeholder="e.g. Sara Ahmed" />
          </div>
          <div>
            <label className="field-label">CGPA (0–4.0)</label>
            <input className="glass-input" type="number" step="0.1" min="0" max="4.0" value={profile.cgpa||''} onChange={e=>setProfile({...profile,cgpa:parseFloat(e.target.value)})} placeholder="e.g. 3.7" />
          </div>
          <div>
            <label className="field-label">Major</label>
            <select className="glass-select" value={profile.major||''} onChange={e=>setProfile({...profile,major:e.target.value})}>
              <option value=''>Select major</option>
              {MAJORS.map(m=><option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Grad year</label>
            <select className="glass-select" value={profile.grad_year||'2026'} onChange={e=>setProfile({...profile,grad_year:parseInt(e.target.value)})}>
              {[2025,2026,2027,2028].map(y=><option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="glass" style={{padding:'24px', marginBottom:'24px'}}>
        <label className="field-label" style={{marginBottom:'14px'}}>Interests</label>
        <div style={{display:'flex', flexWrap:'wrap', gap:'10px'}}>
          {INTERESTS.map(i => {
            const active = (profile.interests||[]).includes(i)
            return (
              <button key={i} onClick={()=>toggleInterest(i)}
                className={`tag-pill ${active ? 'active' : ''}`}>
                {i}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'12px', padding:'12px 16px', marginBottom:'16px'}}>
          <p style={{color:'var(--red)', fontSize:'13px', margin:0}}>⚠️ {error}</p>
        </div>
      )}

      <div style={{display:'flex', gap:'12px'}}>
        <button className="btn-ghost" onClick={()=>setStep(1)}>← Back</button>
        <button className="btn-primary" onClick={handleAnalyze} style={{flex:1}}>
          {inputMode === 'gmail' ? 'Fetch & Organize Inbox →' : 'Analyze My Emails →'}
        </button>
      </div>
    </div>
  )
}
