import { useState, useEffect } from 'react'
import SidebarLayout from './layouts/SidebarLayout'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import { motion, AnimatePresence } from 'framer-motion'

export default function App() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  
  // App state
  const [activeTab, setActiveTab] = useState('dashboard') // dashboard | profile
  const [results, setResults] = useState([])
  const [pipelineStats, setPipelineStats] = useState(null)
  const [isOrganizing, setIsOrganizing] = useState(false)

  // 1. Fetch profile on mount with timeout
  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

    fetch('/api/profile', { signal: controller.signal })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not found')
      })
      .then(data => {
        setProfile(data)
        setLoading(false)
      })
      .catch(() => {
        setProfile(null)
        setLoading(false)
      })
      .finally(() => clearTimeout(timeoutId))
  }, [])

  const handleOrganize = async () => {
    setIsOrganizing(true)
    try {
      const statusRes = await fetch('/api/auth/status')
      const statusData = await statusRes.json()
      
      if (!statusData.connected) {
        await fetch('/api/auth/connect', { method: 'POST' })
      }
      
      const res = await fetch('/api/analyze/gmail', { method: 'POST' })
      if (!res.ok) throw new Error("Analysis failed")
      
      const data = await res.json()
      setResults(data.opportunities || [])
      if (data.pipeline_stats) setPipelineStats(data.pipeline_stats)
    } catch (e) {
      alert("Error organizing inbox: " + e)
    } finally {
      setIsOrganizing(false)
    }
  }

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-500 font-sans">
        <div className="flex flex-col items-center animate-pulse gap-4">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
          Restoring Intelligence Profile...
        </div>
      </div>
    )
  }

  // Onboarding Wall
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#09090b] text-foreground font-sans pt-12 px-4 sm:px-6">
        <Profile profile={null} onComplete={setProfile} isSetup={true} />
      </div>
    )
  }

  // Authenticated Dashboard
  return (
    <SidebarLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      profile={profile}
    >
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Dashboard 
              results={results} 
              profile={profile} 
              onOrganize={handleOrganize} 
              isOrganizing={isOrganizing} 
              pipelineStats={pipelineStats} 
              setResults={setResults}
            />
          </motion.div>
        ) : (
          <motion.div key="prof" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Profile 
              profile={profile} 
              onComplete={setProfile} 
              isSetup={false} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarLayout>
  )
}
