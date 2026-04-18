import { useState } from 'react'

export default function ProfileSetupWizard({ onComplete }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Data State
  const [name, setName] = useState('')
  const [degree, setDegree] = useState('')
  const [department, setDepartment] = useState('')
  const [cgpa, setCgpa] = useState('')
  const [semester, setSemester] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [skills, setSkills] = useState('')
  const [interests, setInterests] = useState('')
  const [preferredOpps, setPreferredOpps] = useState('')
  const [resumeFile, setResumeFile] = useState(null)

  const handleSubmit = async () => {
    if (!resumeFile) { alert("Please attach a PDF resume."); return; }
    
    setLoading(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('degree', degree)
    formData.append('department', department)
    formData.append('cgpa', cgpa)
    formData.append('semester', semester)
    formData.append('github_url', githubUrl)
    formData.append('skills', skills)
    formData.append('interests', interests)
    formData.append('preferred_opportunities', preferredOpps)
    formData.append('resume', resumeFile)

    try {
      const res = await fetch('/api/profile/setup', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        onComplete(data.profile)
      } else {
        alert("Failed to setup profile: " + JSON.stringify(data))
      }
    } catch (e) {
      alert("Error uploading profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass tilt-card" style={{ padding: '36px', maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Let's build your AI Profile</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        We need this one-time setup to accurately match and rank opportunities against your actual skills.
      </p>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>FULL NAME</label>
            <input className="glass-input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sara Ahmed" />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>DEGREE</label>
              <input className="glass-input" value={degree} onChange={e=>setDegree(e.target.value)} placeholder="e.g. BS" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>DEPARTMENT</label>
              <input className="glass-input" value={department} onChange={e=>setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>CGPA</label>
              <input className="glass-input" value={cgpa} onChange={e=>setCgpa(e.target.value)} placeholder="e.g. 3.7" type="number" step="0.01" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>SEMESTER</label>
              <input className="glass-input" value={semester} onChange={e=>setSemester(e.target.value)} placeholder="e.g. 6th" />
            </div>
          </div>
          <button className="btn-primary" onClick={() => setStep(2)}>Next Step →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>GITHUB PROFILE URL</label>
            <input className="glass-input" value={githubUrl} onChange={e=>setGithubUrl(e.target.value)} placeholder="https://github.com/username" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>SKILLS (Comma separated)</label>
            <input className="glass-input" value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, Python, Machine Learning..." />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>INTERESTS</label>
            <input className="glass-input" value={interests} onChange={e=>setInterests(e.target.value)} placeholder="Web3, FinTech, Autonomous Vehicles..." />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>PREFERRED OPPORTUNITIES</label>
            <input className="glass-input" value={preferredOpps} onChange={e=>setPreferredOpps(e.target.value)} placeholder="Research, Summer Internship..." />
          </div>
          <div style={{ padding: '24px', border: '1px dashed var(--border)', borderRadius: '12px', textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <label style={{ cursor: 'pointer', color: 'var(--accent)', fontWeight: 600 }}>
              📄 Upload Resume PDF
              <input type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e=>setResumeFile(e.target.files[0])} />
            </label>
            {resumeFile && <div style={{ marginTop: '8px', fontSize: '12px', color: '#4ade80' }}>✔ {resumeFile.name} attached</div>}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Building LLM Profile...' : 'Complete & Generate Blueprint'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
