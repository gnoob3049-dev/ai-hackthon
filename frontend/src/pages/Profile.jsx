import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Upload, ChevronRight, Check, User, GraduationCap, Github, FileText, Sparkles, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar'
import { motion } from 'framer-motion'

const AVAILABLE_INTERESTS = [
  'AI/ML', 'Web Dev', 'Mobile Dev', 'Research', 'Finance', 
  'Data Science', 'Cybersecurity', 'Product Management', 'Design', 'Blockchain'
]

export default function Profile({ profile, onComplete, isSetup = true }) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(profile?.full_name || profile?.name || '')
  const [degree, setDegree] = useState(profile?.degree || '')
  const [department, setDepartment] = useState(profile?.department || '')
  const [cgpa, setCgpa] = useState(profile?.cgpa || '')
  const [semester, setSemester] = useState(profile?.semester || '')
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '')
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || profile?.skills || '')
  const [selectedInterests, setSelectedInterests] = useState(profile?.interests || [])
  const [resumeFile, setResumeFile] = useState(null)

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  const handleSubmit = async () => {
    if (!resumeFile && isSetup) { 
      alert("Please attach a PDF resume for initial setup."); 
      return; 
    }
    
    setLoading(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('degree', degree)
    formData.append('department', department)
    formData.append('cgpa', cgpa)
    formData.append('semester', semester)
    formData.append('github_url', githubUrl)
    formData.append('skills', skills)
    formData.append('interests', selectedInterests.join(','))
    if (resumeFile) formData.append('resume', resumeFile)

    try {
      const res = await fetch('/api/profile/setup', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        alert("Intelligence Profile synchronized successfully!")
        onComplete(data.profile)
      } else {
        const errorMsg = data.detail || (typeof data === 'string' ? data : JSON.stringify(data))
        alert(`Configuration Failed: ${errorMsg}`)
      }
    } catch (e) {
      console.error("Profile update failed", e)
      alert("Network Error: Could not connect to the Intelligence Engine. Please ensure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  // Completeness calc
  const completeness = [name, degree, department, cgpa, semester, githubUrl, selectedInterests.length > 0].filter(Boolean).length
  const percent = Math.round((completeness / 7) * 100)

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      
      {/* Profile Header / Identity Card */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#111113] border border-white/5 rounded-3xl p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-24 bg-[radial-gradient(ellipse_60%_80%_at_70%_0%,rgba(186,178,181,0.05)_0%,transparent_100%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
           <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-brand-navy shadow-2xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${name || 'User'}`} />
                <AvatarFallback className="bg-brand-navy text-2xl font-bold">U</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-brand-silver text-brand-deep p-1.5 rounded-full border-4 border-[#111113]">
                <Sparkles size={14} fill="currentColor" />
              </div>
           </div>

           <div className="flex-1 space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight">
                {name || "Anonymous Student"}
              </h1>
              <div className="flex flex-wrap gap-4 text-xs font-medium text-zinc-500">
                <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-brand-silver" /> {degree} {department}</span>
                <span className="flex items-center gap-1.5"><User size={14} className="text-brand-silver" /> Semester {semester}</span>
              </div>
              
              <div className="pt-6 space-y-2 w-full max-w-sm">
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-500">Profile Completeness</span>
                    <span className="text-brand-silver">{percent}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      className="h-full bg-gradient-to-r from-brand-navy to-brand-silver rounded-full"
                    />
                 </div>
              </div>
           </div>
        </div>
      </motion.section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-8">
          <Section title="Academic DNA" desc="Core university tracking and credentials">
             <div className="grid grid-cols-2 gap-4">
               <Field label="Full Name">
                 <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Sara Ahmed" className="bg-[#18181b] border-white/5 focus-visible:ring-brand-silver/30" />
               </Field>
               <Field label="Degree">
                 <Input value={degree} onChange={e=>setDegree(e.target.value)} placeholder="BS" className="bg-[#18181b] border-white/5 focus-visible:ring-brand-silver/30" />
               </Field>
               <Field label="Department">
                 <Input value={department} onChange={e=>setDepartment(e.target.value)} placeholder="Computer Science" className="bg-[#18181b] border-white/5 focus-visible:ring-brand-silver/30" />
               </Field>
               <Field label="Semester">
                  <select 
                    value={semester} 
                    onChange={e=>setSemester(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-white/5 bg-[#18181b] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-silver/30 transition-all cursor-pointer"
                  >
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(i => <option key={i} value={i} className="bg-[#111113]">Semester {i}</option>)}
                    <option value="graduate" className="bg-[#111113]">Graduate</option>
                  </select>
               </Field>
               <Field label="CGPA">
                  <Input value={cgpa} onChange={e=>setCgpa(e.target.value)} type="number" step="0.01" placeholder="3.8" className="bg-[#18181b] border-white/5 focus-visible:ring-brand-silver/30" />
               </Field>
             </div>
          </Section>

          <Section title="Technical DNA" desc="External profiles and manually reported skills">
             <div className="space-y-6">
                <Field label="GitHub Profile">
                   <div className="flex items-center gap-2">
                     <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-zinc-400">
                       <Github size={20} />
                     </div>
                     <Input value={githubUrl} onChange={e=>setGithubUrl(e.target.value)} placeholder="github.com/username" className="bg-[#18181b] border-white/5 flex-1 focus-visible:ring-brand-silver/30" />
                   </div>
                </Field>
                <Field label="Skills Stack">
                   <Input value={skills} onChange={e=>setSkills(e.target.value)} placeholder="React, Python, PostCSS..." className="bg-[#18181b] border-white/5 focus-visible:ring-brand-silver/30" />
                </Field>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Primary Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_INTERESTS.map(interest => (
                      <button
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all border
                          ${selectedInterests.includes(interest) 
                            ? 'bg-brand-navy/20 text-brand-silver border-brand-silver/30' 
                            : 'bg-[#18181b] text-zinc-500 border-white/5 hover:border-white/10'
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </Section>
        </div>

        {/* Right Column: Uploads / Actions */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-[#111113] border border-white/5 rounded-3xl p-6">
            <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-2">
              <FileText size={16} className="text-brand-silver" /> Resume Digestion
            </h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Upload your PDF resume so OpportunityOS can extract unstructured experience for better matching.
            </p>
            
            <label className="group relative flex flex-col items-center justify-center w-full h-48 border border-dashed border-white/10 rounded-2xl cursor-pointer hover:bg-white/[0.02] transition-all hover:border-brand-silver/40">
              <div className="flex flex-col items-center justify-center p-6 text-center">
                {resumeFile ? (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-4">
                      <Check size={24} />
                    </div>
                    <p className="text-xs font-bold text-zinc-200 truncate max-w-[200px]">{resumeFile.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase font-black">Ready to sync</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-600 mb-4 group-hover:text-brand-silver transition-colors">
                      <Upload size={24} />
                    </div>
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">Select PDF</p>
                    <p className="text-[10px] text-zinc-600 mt-2">Max file size: 5MB</p>
                  </>
                )}
              </div>
              <input type="file" accept="application/pdf" className="hidden" onChange={e=>setResumeFile(e.target.files[0])} />
            </label>
          </div>

          <div className="pt-4">
            <Button 
               onClick={handleSubmit} 
               disabled={loading}
               className="w-full bg-brand-silver text-brand-deep hover:bg-white font-black h-14 rounded-2xl shadow-xl active:scale-[0.98] transition-all"
            >
              {loading ? (
                <span className="flex items-center gap-2 animate-pulse uppercase tracking-widest">Recomputing DNA...</span>
              ) : (
                <span className="flex items-center gap-2 uppercase tracking-widest leading-none">Save Intelligence Profile <ChevronRight size={18} /></span>
              )}
            </Button>
            <p className="text-center text-[10px] text-zinc-600 mt-4 uppercase font-bold tracking-widest">
              Changes reflect instantly in Opportunity Feed
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

function Section({ title, desc, children }) {
  return (
    <div className="bg-[#111113] border border-white/5 rounded-3xl p-8">
      <div className="mb-8">
        <h3 className="font-bold text-white tracking-tight">{title}</h3>
        <p className="text-xs text-zinc-500 mt-1">{desc}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">{label}</label>
      {children}
    </div>
  )
}
