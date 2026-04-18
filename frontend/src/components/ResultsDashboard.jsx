import { useState, useRef } from 'react'

const TYPE_COLORS = {
  scholarship: { bg:'rgba(139,92,246,0.15)', text:'#a78bfa', label:'Scholarship' },
  internship:  { bg:'rgba(6,182,212,0.15)',   text:'#22d3ee', label:'Internship' },
  research:    { bg:'rgba(20,184,166,0.15)',   text:'#2dd4bf', label:'Research' },
  competition: { bg:'rgba(245,158,11,0.15)',   text:'#fbbf24', label:'Competition' },
  event:       { bg:'rgba(34,197,94,0.15)',    text:'#4ade80', label:'Event' },
  deadline:    { bg:'rgba(239,68,68,0.15)',    text:'#f87171', label:'Deadline' },
  other:       { bg:'rgba(107,114,128,0.15)',  text:'#9ca3af', label:'Other' },
}

const URGENCY = {
  high:   { color:'#ef4444', label:'Urgent', dot:'🔴', glow:'rgba(239,68,68,0.3)' },
  medium: { color:'#f59e0b', label:'Medium', dot:'🟡', glow:'rgba(245,158,11,0.2)' },
  low:    { color:'#22c55e', label:'Low',    dot:'🟢', glow:'rgba(34,197,94,0.2)' },
}

function ScoreGauge({ score }) {
  const color = score >= 75 ? '#7C3AED' : score >= 50 ? '#06B6D4' : '#6b7280'
  const r = 24
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  return (
    <div className="score-gauge" style={{position:'relative', width:'66px', height:'66px', flexShrink:0}}>
      <svg width='66' height='66' style={{transform:'rotate(-90deg)'}}>
        <circle cx='33' cy='33' r={r} fill='none' stroke='rgba(255,255,255,0.06)' strokeWidth='4'/>
        <circle cx='33' cy='33' r={r} fill='none' stroke={color} strokeWidth='4'
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap='round'
          style={{transition:'stroke-dasharray 1.2s cubic-bezier(0.4,0,0.2,1)'}}
        />
      </svg>
      <span style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:700, color, letterSpacing:'-0.02em'}}>{score}</span>
    </div>
  )
}

function OpportunityCard({ opp, index }) {
  const [open, setOpen] = useState(false)
  const [checked, setChecked] = useState([])
  const cardRef = useRef(null)
  const urg = URGENCY[opp.urgency] || URGENCY.low
  const typ = TYPE_COLORS[opp.type] || TYPE_COLORS.other

  // 3D tilt effect
  const handleMouseMove = (e) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px) scale(1.01)`
  }

  const handleMouseLeave = () => {
    const card = cardRef.current
    if (card) card.style.transform = 'perspective(800px) rotateY(0) rotateX(0) translateY(0) scale(1)'
  }

  return (
    <div
      ref={cardRef}
      className="glass tilt-card"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        borderLeft:`3px solid ${urg.color}`,
        marginBottom:'20px', overflow:'hidden',
        animation:`slideUp 0.5s cubic-bezier(0.4,0,0.2,1) both`,
        animationDelay:`${index*100}ms`,
        boxShadow: `0 0 0 1px ${urg.glow}, var(--shadow-glow), 0 8px 32px rgba(0,0,0,0.3)`,
      }}
    >
      <div style={{padding:'24px 24px 18px'}}>
        <div style={{display:'flex', gap:'18px', alignItems:'flex-start'}}>
          <ScoreGauge score={opp.score} />
          <div style={{flex:1, minWidth:0}}>
            {/* Badges */}
            <div style={{display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap', marginBottom:'10px'}}>
              <span className="badge" style={{background:typ.bg, color:typ.text}}>{typ.label}</span>
              <span className={`badge ${opp.urgency === 'high' ? 'urgency-high' : ''}`}
                style={{background:`rgba(255,255,255,0.04)`, color:urg.color, border:`1px solid ${urg.glow}`}}>
                {urg.dot} {urg.label}
              </span>
              {opp.stipend_or_amount && (
                <span className="badge" style={{background:'rgba(34,197,94,0.1)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.2)'}}>💰 {opp.stipend_or_amount}</span>
              )}
              {opp.is_duplicate && (
                <span className="badge" style={{background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.2)', fontSize:'10px', fontWeight:700}}>Duplicate</span>
              )}
            </div>

            {/* Title */}
            <h3 style={{fontFamily:'Syne,sans-serif', fontSize:'18px', fontWeight:700, marginBottom:'6px', lineHeight:1.3}}>{opp.title}</h3>
            {opp.organization && <p style={{fontSize:'12px', color:'var(--text-muted)', margin:'0 0 6px'}}>🏢 {opp.organization}</p>}
            <p style={{fontSize:'12px', color:'var(--text-muted)', margin:0, opacity:0.8}}>
              📅 {opp.deadline_text}
              {opp.location ? ` · 📍 ${opp.location}` : ''}
              {opp.duration ? ` · ⏱ ${opp.duration}` : ''}
            </p>
            {opp.summary && <p style={{fontSize:'12px', color:'var(--text-muted)', margin:'6px 0 0', lineHeight:1.5, fontStyle:'italic', opacity:0.7}}>"{opp.summary}"</p>}
          </div>
        </div>

        {/* Reason */}
        <p style={{fontSize:'13px', color:'var(--text-muted)', lineHeight:1.7, margin:'16px 0 0', fontStyle:'italic'}}>
          <span style={{color:'#a78bfa', fontWeight:500}}>💡 AI Insight:</span> {opp.reason}
        </p>

        {opp.deadline_warning && (
          <div style={{marginTop:'8px', background:'rgba(239,68,68,0.1)', color:'#ef4444', padding:'6px 12px', borderRadius:'6px', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px'}}>
            <span style={{width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', animation:'pulse 1.5s infinite'}}></span>
            {opp.deadline_warning}
          </div>
        )}

        {/* Gap insight */}
        {opp.gap_insight && (
          <div className="gap-insight">
            <span style={{fontSize:'14px', flexShrink:0}}>⚠️</span>
            <p style={{fontSize:'12px', color:'#fbbf24', margin:0, lineHeight:1.6}}>
              <strong style={{fontWeight:600}}>Gap insight: </strong>{opp.gap_insight}
            </p>
          </div>
        )}

        {/* Eligibility */}
        {opp.eligibility && typeof opp.eligibility === 'string' && (
          <p style={{fontSize:'12px', color:'var(--text-muted)', margin:'12px 0 0', opacity:0.6}}>Eligibility: {opp.eligibility}</p>
        )}
      </div>

      {/* Tabs Section */}
      <div style={{borderTop:'1px solid var(--border)'}}>
        <div style={{display:'flex', width:'100%', background:'rgba(255,255,255,0.02)'}}>
          <button onClick={() => setOpen(open === 'app' ? '' : 'app')} style={{flex:1, padding:'12px', background:open==='app'?'rgba(124,58,237,0.1)':'transparent', border:'none', color:open==='app'?'var(--accent)':'var(--text-muted)', cursor:'pointer', fontSize:'13px', fontWeight:600, borderRight:'1px solid var(--border)'}}>
            Application Guide ({opp.application_guidance?.length || 0})
          </button>
          <button onClick={() => setOpen(open === 'int' ? '' : 'int')} style={{flex:1, padding:'12px', background:open==='int'?'rgba(6,182,212,0.1)':'transparent', border:'none', color:open==='int'?'var(--secondary)':'var(--text-muted)', cursor:'pointer', fontSize:'13px', fontWeight:600, borderRight:'1px solid var(--border)'}}>
            Interview Prep ({opp.interview_guidance?.length || 0})
          </button>
          <button onClick={() => setOpen(open === 'prep' ? '' : 'prep')} style={{flex:1, padding:'12px', background:open==='prep'?'rgba(255,255,255,0.1)':'transparent', border:'none', color:open==='prep'?'var(--text)':'var(--text-muted)', cursor:'pointer', fontSize:'13px', fontWeight:600}}>
            Checklist ({opp.preparation_checklist?.length || 0})
          </button>
        </div>
        
        {open && (
           <div style={{padding:'16px 24px'}}>
             {open === 'app' && (opp.application_guidance||[]).map((itm, i)=><li key={i} style={{fontSize:'13px', color:'var(--text)', marginBottom:'8px', lineHeight:1.5}}>{itm}</li>)}
             {open === 'int' && (opp.interview_guidance||[]).map((itm, i)=><li key={i} style={{fontSize:'13px', color:'var(--text)', marginBottom:'8px', lineHeight:1.5}}>{itm}</li>)}
             {open === 'prep' && (opp.preparation_checklist||[]).map((itm, i)=><li key={i} style={{fontSize:'13px', color:'var(--text)', marginBottom:'8px', lineHeight:1.5}}>{itm}</li>)}
           </div>
        )}
      </div>
    </div>
  )
}

export default function ResultsDashboard({ results, setStep, pipelineStats }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const sorted = [...results]
    .filter(r => activeFilter === 'all' || r.type === activeFilter)
    .sort((a,b) => b.score - a.score)

  if (!results.length) return (
    <div style={{textAlign:'center', padding:'80px 0'}}>
      <div className="glass" style={{display:'inline-block', padding:'48px 60px', textAlign:'center'}}>
        <p style={{fontSize:'56px', marginBottom:'16px', filter:'drop-shadow(0 0 20px rgba(124,58,237,0.3))'}}>🔍</p>
        <h2 style={{fontFamily:'Syne,sans-serif', marginBottom:'10px', fontSize:'22px'}}>No opportunities found</h2>
        <p style={{color:'var(--text-muted)', marginBottom:'28px', fontSize:'14px'}}>Try adding more emails or checking your API connection.</p>
        <button className="btn-primary" onClick={()=>setStep(1)}>← Try Again</button>
      </div>
    </div>
  )

  return (
    <div>
      {/* Pipeline stats bar */}
      {pipelineStats && (
        <div className="glass stats-bar" style={{marginBottom:'20px'}}>
          <span style={{color:'var(--text-muted)'}}>📨 {pipelineStats.emails_received} scanned</span>
          <span style={{color:'rgba(255,255,255,0.15)'}}>→</span>
          <span style={{color:'#22d3ee'}}>✅ {pipelineStats.opportunities_found} found</span>
          <span style={{color:'rgba(255,255,255,0.15)'}}>→</span>
          <span style={{color:'var(--text-muted)'}}>🗑 {pipelineStats.spam_filtered} filtered</span>
          {pipelineStats.duplicates_detected > 0 && <>
            <span style={{color:'rgba(255,255,255,0.15)'}}>→</span>
            <span style={{color:'#f59e0b'}}>⚡ {pipelineStats.duplicates_detected} duplicate{pipelineStats.duplicates_detected>1?'s':''}</span>
          </>}
          <span style={{marginLeft:'auto', color:'var(--text-muted)'}}>⏱ {(pipelineStats.processing_time_ms/1000).toFixed(1)}s</span>
        </div>
      )}

      {/* Title + category filters */}
      <div style={{marginBottom:'24px'}}>
        <h1 style={{fontSize:'32px', fontWeight:700, marginBottom:'16px'}}>Your opportunities</h1>
        <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
          {[
            {k:'all',label:'All',count:results.length},
            {k:'scholarship',label:'Scholarships'},
            {k:'internship',label:'Internships'},
            {k:'research',label:'Research'},
            {k:'competition',label:'Competitions'},
            {k:'hackathon',label:'Hackathons'}
          ].map(({k,label,count}) => {
            const c = count ?? results.filter(r=>r.type===k).length
            if (k !== 'all' && c === 0) return null
            const active = activeFilter === k
            return (
              <button key={k} onClick={()=>setActiveFilter(k)}
                className={`filter-pill ${active ? 'active' : ''}`}>
                {label}{k!=='all'&&c>0?` (${c})`:'' }
              </button>
            )
          })}
        </div>
      </div>

      {/* Cards */}
      {sorted.map((opp, i) => <OpportunityCard key={i} opp={opp} index={i} />)}

      {sorted.length === 0 && activeFilter !== 'all' && (
        <div className="glass" style={{textAlign:'center', padding:'40px'}}>
          <p style={{fontSize:'32px', marginBottom:'8px'}}>📭</p>
          <p style={{color:'var(--text-muted)', fontSize:'14px'}}>No opportunities match this filter</p>
        </div>
      )}

      <div style={{textAlign:'center', marginTop:'16px'}}>
        <button className="btn-ghost" onClick={()=>setStep(1)}>← Analyze New Emails</button>
      </div>
    </div>
  )
}
