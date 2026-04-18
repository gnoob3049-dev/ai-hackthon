import { motion } from 'framer-motion'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Calendar, Briefcase, MapPin, CheckCircle, Zap, ChevronRight, Clock, Target } from 'lucide-react'

export default function OpportunityCard({ opp, onClick }) {
  // Determine urgency color
  const isHigh = opp.urgency === 'high'
  const isMedium = opp.urgency === 'medium'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group cursor-pointer"
      onClick={onClick}
    >
      <Card className="overflow-hidden border-white/5 bg-[#111113] hover:border-[#BAB2B5]/30 hover:bg-[#131315] hover:shadow-[0_4px_24px_rgba(0,0,0,0.5)] transition-all duration-300">
        <div className="p-6 flex flex-col h-full">
          {/* Row 1: Badges & Logic */}
          <div className="flex justify-between items-start mb-4">
             <div className="flex flex-wrap gap-2">
                <Badge className="bg-brand-navy/20 text-brand-silver border-brand-navy/30 text-[10px] uppercase font-bold px-2 py-0.5">
                  {opp.type || 'Research'}
                </Badge>
                {isHigh && (
                  <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px] uppercase font-bold px-2 py-0.5">
                    Urgent
                  </Badge>
                )}
             </div>
             {opp.deadline_text && (
                <div className={`flex items-center gap-1.5 text-[11px] font-bold ${isHigh ? 'text-red-400' : 'text-zinc-500'}`}>
                   <Clock size={12} />
                   {opp.deadline_text}
                </div>
             )}
          </div>

          {/* Row 2: Title & Org */}
          <div className="mb-4">
            <h3 className="text-[15px] font-bold text-white group-hover:text-brand-silver transition-colors leading-snug line-clamp-2">
              {opp.title}
            </h3>
            <p className="text-[12px] text-zinc-500 font-medium mt-1.5 flex items-center gap-1.5">
               <span className="opacity-60">{opp.organization || 'OpportunityIQ'}</span>
            </p>
          </div>

          {/* Row 3: Meta Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
             <Tag icon={<MapPin size={10} />} text={opp.location || 'Remote'} />
             <Tag icon={<CheckCircle size={10} />} text={opp.stipend_or_amount || 'Verified'} />
          </div>

          <div className="flex-1" />

          {/* Row 4: AI Insight Highlight */}
          {opp.reason && (
             <div className="bg-brand-navy/5 border-l-2 border-brand-silver/50 p-3 rounded-r-xl mb-6">
                <p className="text-[11px] text-zinc-400 leading-relaxed italic line-clamp-2">
                  "{opp.reason}"
                </p>
             </div>
          )}

          {/* Row 5: Score & Action */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
             <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between w-24">
                   <span className="text-[10px] font-black tracking-widest text-zinc-600 uppercase">Match Score</span>
                   <span className="text-[11px] font-bold text-brand-silver">{opp.score}%</span>
                </div>
                <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${opp.score}%` }}
                     transition={{ duration: 1, ease: 'easeOut' }}
                     className="h-full bg-gradient-to-r from-brand-navy to-brand-silver"
                   />
                </div>
             </div>

             <Button variant="ghost" className="h-8 px-2 text-zinc-500 group-hover:text-brand-silver group-hover:bg-brand-silver/5 transition-all text-xs font-bold gap-1">
                DETAILS <ChevronRight size={14} />
             </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function Tag({ icon, text }) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-zinc-500 font-bold">
      {icon}
      <span>{text}</span>
    </div>
  )
}
