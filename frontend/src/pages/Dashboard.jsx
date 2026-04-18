import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import OpportunityCard from '../components/OpportunityCard'
import { Button } from '../components/ui/button'
import { Card, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Inbox, Zap, ArrowRight, Target, Clock, AlertTriangle, ExternalLink, X, FileText, BrainCircuit, SlidersHorizontal, ArrowUpDown, TrendingUp } from 'lucide-react'
import NotificationBanner from '../components/NotificationBanner'
import ManualEmailInput from '../components/ManualEmailInput'

export default function Dashboard({ results, profile, onOrganize, isOrganizing, pipelineStats, setResults }) {
  const [selectedOpp, setSelectedOpp] = useState(null)
  const [showManualInput, setShowManualInput] = useState(false)
  const [showSyncOptions, setShowSyncOptions] = useState(false)
  
  const highUrgency = results.filter(r => r.urgency === 'high').length
  const topMatches = results.filter(r => r.score >= 80).length
  const avgScore = results.length > 0 ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length) : 0

  const handleManualAnalyze = async (emails) => {
    setShowManualInput(false)
    try {
      const res = await fetch('/api/analyze/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, profile })
      })
      const data = await res.json()
      if (res.ok) {
        setResults(data.opportunities)
      }
    } catch (e) {
      console.error("Manual analysis failed", e)
    }
  }
  
  return (
    <div className="space-y-10">
      
      <NotificationBanner userId="demo_user" onOrganize={onOrganize} />

      {/* Hero Greeting Section */}
      <motion.section 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-10"
      >
        <div className="absolute -inset-10 bg-[radial-gradient(ellipse_60%_80%_at_30%_50%,rgba(65,90,119,0.15)_0%,transparent_100%)] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2 ml-1">
              Good morning, {profile?.name?.split(' ')[0] || 'Explorer'}
            </h1>
            <p className="text-zinc-500 text-sm font-medium ml-1">
              You have {results.length} new opportunities since your last login.
            </p>
          </div>
          
          <div className="relative">
            <Button 
               onClick={() => setShowSyncOptions(!showSyncOptions)} 
               disabled={isOrganizing}
               className="bg-brand-silver text-brand-deep hover:bg-white font-bold px-6 py-5 rounded-xl shadow-[0_0_20px_rgba(186,178,181,0.2)] transition-all active:scale-95"
            >
              {isOrganizing ? (
                <span className="flex items-center gap-2"><Zap className="animate-pulse" size={18} /> Scanning...</span>
              ) : (
                <span className="flex items-center gap-2 font-black"><Inbox size={18} /> ORGANIZE NEW EMAILS</span>
              )}
            </Button>

            <AnimatePresence>
              {showSyncOptions && !isOrganizing && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSyncOptions(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 mt-3 w-72 bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden backdrop-blur-xl"
                  >
                    <SyncOption 
                      icon={<Zap size={18} className="text-brand-silver" />}
                      title="Auto Scan Gmail"
                      desc="Fast incremental sync"
                      onClick={() => { setShowSyncOptions(false); onOrganize(); }}
                    />
                    <SyncOption 
                      icon={<FileText size={18} className="text-zinc-400" />}
                      title="Manual Paste"
                      desc="Paste raw email content"
                      onClick={() => { setShowSyncOptions(false); setShowManualInput(true); }}
                    />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Opportunities" 
          value={results.length} 
          icon={<Sparkles size={18} />} 
          trend="+8 this week"
          color="navy"
        />
        <StatCard 
          label="Urgent Deadlines" 
          value={highUrgency} 
          icon={<AlertTriangle size={18} />} 
          trend="3 ending soon"
          color="amber"
          active={highUrgency > 0}
        />
        <StatCard 
          label="Avg Match Score" 
          value={`${avgScore}%`} 
          icon={<Target size={18} />} 
          trend="+4% vs last week"
          color="emerald"
        />
        <StatCard 
          label="Applied Items" 
          value="4" 
          icon={<TrendingUp size={18} />} 
          trend="2 pending"
          color="grey"
        />
      </section>

      {/* Main Content Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        {/* Left: Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white tracking-tight">Top Matches</h2>
              <Badge variant="outline" className="text-[11px] border-white/10 text-zinc-500 font-mono">RANKED</Badge>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white h-8 gap-2 text-xs">
                <SlidersHorizontal size={14} /> Filter
               </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {results.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center text-zinc-500 mb-6 border border-white/5">
                    <Inbox size={32} />
                  </div>
                  <h3 className="text-white font-bold opacity-30 text-xl tracking-tight">System clear</h3>
               </div>
            ) : (
              results.map((opp, idx) => (
                <OpportunityCard key={idx} opp={opp} onClick={() => setSelectedOpp(opp)} />
              ))
            )}
          </div>
        </div>

        {/* Right: Panels (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Insights Panel */}
          <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-brand-silver/20 transition-all">
            <div className="absolute top-0 right-0 p-8 bg-[radial-gradient(circle_at_center,rgba(186,178,181,0.08)_0%,transparent_70%)] pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-navy/10 rounded-lg text-brand-silver">
                  <BrainCircuit size={18} />
                </div>
                <h3 className="font-bold text-white text-sm">AI Insights</h3>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </Badge>
            </div>
            
            <div className="space-y-3">
              <InsightItem text="Your skills in React match 4 current internships in the top 10% tier." />
              <InsightItem text="3 deadlines are approaching in the next 48 hours for CS majors." />
              <InsightItem text="New Research Fellowship detected at Google with 94% compatibility." />
            </div>
          </div>

          {/* Deadline Panel */}
          <div className="bg-[#111113] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400">
                <Clock size={16} />
              </div>
              <h3 className="font-bold text-white text-sm">Approaching Deadlines</h3>
            </div>
            <div className="space-y-4">
               {results.slice(0, 3).map((r, i) => (
                 <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${r.urgency === 'high' ? 'bg-red-500' : 'bg-zinc-600'}`} />
                      <span className="text-zinc-300 text-[13px] group-hover:text-white transition-colors truncate max-w-[140px]">{r.title}</span>
                    </div>
                    <span className={`text-[11px] font-bold ${r.urgency === 'high' ? 'text-red-400' : 'text-zinc-500'}`}>
                      {r.deadline_text}
                    </span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Manual Input Overlay */}
      <AnimatePresence>
        {showManualInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowManualInput(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="z-10 w-full flex justify-center"
            >
              <ManualEmailInput 
                onAnalyze={handleManualAnalyze} 
                onCancel={() => setShowManualInput(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Overlay */}
      <AnimatePresence>
        {selectedOpp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => setSelectedOpp(null)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#111113] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] z-10"
            >
               <DetailOverlay opp={selectedOpp} onClose={() => setSelectedOpp(null)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatCard({ label, value, icon, trend, color, active }) {
  const colors = {
    navy: "bg-brand-navy/10 text-brand-silver",
    amber: "bg-amber-500/10 text-amber-500",
    emerald: "bg-emerald-500/10 text-emerald-500",
    grey: "bg-zinc-800/50 text-zinc-400"
  }
  
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-[#111113] border border-white/5 p-6 rounded-2xl group transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
          {icon}
        </div>
        <span className="text-[11px] font-bold text-zinc-500 tracking-wider">04/18</span>
      </div>
      <h3 className="text-zinc-500 text-xs font-semibold tracking-wide uppercase mb-1">{label}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className={`text-[11px] mt-4 font-bold ${active ? 'text-red-400' : 'text-zinc-600'}`}>
        {trend}
      </p>
    </motion.div>
  )
}

function SyncOption({ icon, title, desc, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-4 p-4 hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0"
    >
      <div className="bg-white/5 p-2 rounded-lg">{icon}</div>
      <div>
        <p className="text-[13px] font-bold text-white">{title}</p>
        <p className="text-[10px] text-zinc-500">{desc}</p>
      </div>
    </button>
  )
}

function InsightItem({ text }) {
  return (
    <div className="flex gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="flex-shrink-0 w-1 h-1 rounded-full bg-brand-silver mt-2" />
      <p className="text-xs text-zinc-400 leading-relaxed">{text}</p>
    </div>
  )
}

function DetailOverlay({ opp, onClose }) {
  return (
    <>
      <div className="p-8 border-b border-white/5 bg-white/[0.02] flex justify-between items-start">
        <div>
          <Badge className="bg-brand-navy/20 text-brand-silver border-brand-navy/30 text-[10px] mb-3 uppercase tracking-widest font-bold">
            {opp.type}
          </Badge>
          <h2 className="text-2xl font-bold text-white tracking-tight leading-tight">{opp.title}</h2>
          <div className="flex gap-4 mt-4">
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Clock size={14} className="text-brand-silver" /> {opp.deadline_text}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Zap size={14} className="text-brand-silver" /> {opp.score}% Match
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-zinc-500 hover:bg-white/5 rounded-xl h-10 w-10" onClick={onClose}>
          <X size={20} />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="bg-brand-navy/10 border border-brand-navy/20 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 bg-[radial-gradient(circle_at_center,rgba(186,178,181,0.08)_0%,transparent_70%)] pointer-events-none" />
          <h4 className="text-xs font-black text-brand-silver uppercase tracking-widest mb-3 flex items-center gap-2">
            <Sparkles size={14} /> Intelligence Analysis
          </h4>
          <p className="text-zinc-300 text-[13px] leading-relaxed italic">"{opp.reason}"</p>
        </div>

        {opp.application_guidance?.length > 0 && (
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4">Application Blueprint</h4>
            <div className="space-y-3">
              {opp.application_guidance.map((step, i) => (
                <div key={i} className="flex gap-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                   <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-black border border-white/5">
                    {i+1}
                   </span>
                   <p className="text-zinc-400 text-[13px] leading-relaxed pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
        <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={onClose}>Dismiss</Button>
        <Button 
          className="bg-brand-silver text-brand-deep hover:bg-white font-bold px-6 rounded-xl"
          onClick={() => opp.apply_link && window.open(opp.apply_link, '_blank')}
        >
          APPLY NOW <ExternalLink size={16} className="ml-2" />
        </Button>
      </div>
    </>
  )
}

function SparklesIcon({ className, size }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  )
}
