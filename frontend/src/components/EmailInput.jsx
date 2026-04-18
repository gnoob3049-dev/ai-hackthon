import { useState } from 'react'

const DEMO_DATA = [
  `Subject: URGENT: $10,000 AI Research Scholarship - Deadline in 5 Days

Dear CS Students,

The National AI Foundation is offering a $10,000 scholarship for outstanding Computer Science students passionate about Artificial Intelligence and Machine Learning research.

Eligibility:
- Computer Science or related major
- Minimum GPA: 3.5
- Currently enrolled (graduating 2025-2027)
- US universities only

Deadline: April 23, 2025

Required documents:
- Official transcript
- 2 faculty recommendation letters  
- 1000-word research statement on AI ethics
- CV/Resume

Apply at: nationalai.org/scholarship2025

Do not miss this opportunity!`,

  `Subject: Google STEP Internship - Now Accepting Applications

Hi there,

Google's STEP (Student Training in Engineering Program) internship is now open for applications.

About STEP:
- 12-week paid summer internship at Google
- For students in their 1st or 2nd year (or penultimate year internationally)
- Focus areas: Software Engineering, AI/ML, Data Science
- Stipend: $35/hr + relocation assistance

Preferred background:
- Strong programming skills (Python, Java, or C++)
- Interest in large-scale systems
- Any GPA considered, competitive applicants typically 3.4+

Application portal: careers.google.com/students/step
Rolling deadline, apply before May 15, 2025

Best,
Google University Programs`,

  `Subject: MIT OpenCourseWare Research Fellowship - Application Open

Dear Graduate and Advanced Undergraduate Students,

MIT's Computer Science and AI Laboratory (CSAIL) is accepting applications for summer research fellowships.

Fellowship Details:
- 10-week intensive research position
- Work alongside MIT PhD students and faculty
- Stipend: $6,000 for the summer
- Focus: Machine Learning, Computer Vision, NLP

Requirements:
- Junior or Senior CS/EE student (3.6+ GPA preferred)
- Prior research experience a plus
- Must be available June - August 2025

Application deadline: May 1, 2025
Submit at: csail.mit.edu/fellowships

Contact: fellowships@csail.mit.edu`,

  `Subject: HackFest 2025 - 48-Hour Hackathon Registration Now Open

Yo hackers!

HackFest 2025 is back and we need YOU!

Event Details:
- Date: May 3-4, 2025
- Location: Engineering Building, Room 301
- Prizes: $2000 first place, $1000 second, $500 third
- Theme: AI for Social Good
- Team size: 2-4 people
- Free food and swag!

All majors welcome! No experience needed! Just bring your laptop and your ideas.

Register at: hackfest2025.devpost.com
Spots limited to 200 participants.

See you there,
HackFest Team`,

  `Subject: DINING SERVICES: New Lunch Menu This Week!

Hi Campus Community,

Check out our new spring lunch menu available Monday-Friday 11am-2pm.

This week's specials:
- Monday: Grilled chicken with roasted veggies - $8.50
- Tuesday: Veggie burger deluxe - $7.00
- Wednesday: Fish tacos - $9.00

Swipe your student card for 10% discount!

Location: Main Cafeteria, Building A

Bon appetit!
Dining Services Team`,

  `Subject: Final Reminder: Course Registration Opens Monday

Dear Students,

This is your final reminder that Spring 2025 course registration opens this Monday at 8:00 AM.

Important notes:
- Log in to your student portal
- Have your advisor PIN ready
- Check prerequisites before registering
- Some courses fill within hours

Popular CS courses expected to fill fast:
- CS 445: Machine Learning
- CS 478: Computer Vision  
- CS 492: Natural Language Processing

Contact registrar@university.edu with questions.

Academic Affairs Office`
]

export default function EmailInput({ emails, setEmails, setStep, inputMode, setInputMode }) {
  const [charCount, setCharCount] = useState(emails.length)
  const [connecting, setConnecting] = useState(false)
  const [gmailStatus, setGmailStatus] = useState(null)
  
  const MAX_EMAILS = 15

  const handleChange = (e) => {
    setEmails(e.target.value)
    setCharCount(e.target.value.length)
  }

  const loadDemo = () => {
    const joined = DEMO_DATA.join('\n\n---\n\n')
    setEmails(joined)
    setCharCount(joined.length)
  }

  const emailCount = emails.trim()
    ? emails.split('---').map(e => e.trim()).filter(e => e.length > 20).length
    : 0
    
  const isOverLimit = emailCount > MAX_EMAILS

  const connectGmail = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/auth/connect', { method: 'POST' })
      if (res.ok) {
        setGmailStatus('connected')
      } else {
        alert('Failed to connect Gmail.')
      }
    } catch (e) {
      alert('Error connecting Gmail.')
    } finally {
      setConnecting(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '10px', lineHeight: 1.2 }}>
            Input Source
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
            Choose how you want to auto-organize your opportunities. Max {MAX_EMAILS} emails per run.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button 
          onClick={() => setInputMode('manual')}
          style={{ flex: 1, padding: '16px', borderRadius: '12px', border: `1px solid ${inputMode === 'manual' ? 'var(--accent)' : 'var(--border)'}`, background: inputMode === 'manual' ? 'rgba(124,58,237,0.1)' : 'transparent', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '24px' }}>📝</span>
          <span style={{ fontWeight: 600 }}>Manual Paste</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Paste emails separated by ---</span>
        </button>
        
        <button 
          onClick={() => setInputMode('gmail')}
          style={{ flex: 1, padding: '16px', borderRadius: '12px', border: `1px solid ${inputMode === 'gmail' ? 'var(--accent)' : 'var(--border)'}`, background: inputMode === 'gmail' ? 'rgba(124,58,237,0.1)' : 'transparent', color: 'var(--text)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ fontSize: '24px' }}>✉️</span>
          <span style={{ fontWeight: 600 }}>Gmail Integration</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-fetch latest emails</span>
        </button>
      </div>

      {inputMode === 'manual' && (
        <div className="glass tilt-card" style={{ padding: '24px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Paste emails below:</span>
            <button className="btn-demo" onClick={loadDemo}>
              📧 Load Demo Data
            </button>
          </div>
          
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <textarea
              className="glass-textarea"
              value={emails}
              onChange={handleChange}
              placeholder={"Subject: Scholarship Opportunity...\n\nDear Student,\n\nWe are pleased to announce...\n\n---\n\nSubject: Internship Opening...\n\nHi there,\n\nWe're looking for talented students..."}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              <span style={{ fontSize: '12px', color: isOverLimit ? 'var(--red)' : emailCount > 0 ? '#a78bfa' : 'var(--text-muted)', fontWeight: emailCount > 0 ? 500 : 400, transition: 'all 0.3s' }}>
                {emailCount} email{emailCount !== 1 ? 's' : ''} detected
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {charCount.toLocaleString()} characters
              </span>
            </div>
            
            {isOverLimit && (
              <span style={{ fontSize: '12px', color: 'var(--red)' }}>Limit exceeded! Max is {MAX_EMAILS}.</span>
            )}
            
            {emailCount > 0 && !isOverLimit && (
              <div style={{ display: 'flex', gap: '5px' }}>
                {Array.from({ length: Math.min(emailCount, 8) }).map((_, i) => (
                  <div key={i} style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
                    animation: `fadeIn 0.3s ease ${i * 60}ms both`,
                    boxShadow: '0 0 8px rgba(124,58,237,0.4)',
                  }} />
                ))}
              </div>
            )}
          </div>
          
          <button
            className="btn-primary"
            onClick={() => setStep(2)}
            disabled={emailCount === 0 || isOverLimit}
            style={{ width: '100%', marginTop: '24px' }}
          >
            Next: My Profile →
          </button>
        </div>
      )}
      
      {inputMode === 'gmail' && (
        <div className="glass tilt-card" style={{ padding: '40px 24px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '24px', marginBottom: '12px' }}>Secure One-Time Connection</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            We only request read-only access to scan your latest {MAX_EMAILS} emails for opportunities. Credentials are saved locally.
          </p>
          
          {gmailStatus === 'connected' ? (
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', padding: '8px 24px', borderRadius: '24px', border: '1px solid rgba(34,197,94,0.2)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✅</span> Gmail Connected
              </div>
              <button
                className="btn-primary"
                onClick={() => setStep(2)}
                style={{ minWidth: '200px' }}
              >
                Configure Profile →
              </button>
            </div>
          ) : (
            <button
              className="btn-primary"
              onClick={connectGmail}
              disabled={connecting}
              style={{ minWidth: '200px' }}
            >
              {connecting ? 'Connecting...' : 'Connect Gmail'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
