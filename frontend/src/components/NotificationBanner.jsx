import { useState, useEffect } from 'react'
import { Bell, ArrowRight, X } from 'lucide-react'
import { Button } from './ui/button'

export default function NotificationBanner({ userId, onOrganize }) {
  const [status, setStatus] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  const checkStatus = async () => {
    if (!userId) return
    try {
      const res = await fetch(`/api/notify/status/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (e) {
      console.warn('Notification check failed:', e)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Every 30s
    return () => clearInterval(interval)
  }, [userId])

  if (!status || !status.threshold_reached || dismissed) return null

  return (
    <div className="relative overflow-hidden mb-6 group animate-in slide-in-from-top-4 duration-500">
      <div className="absolute inset-0 bg-blue-500/10" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      
      <div className="relative p-4 flex flex-col sm:flex-row items-center gap-4 justify-between border border-blue-500/20 rounded-r-xl">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Bell className="w-5 h-5 text-blue-400 fill-blue-400/20" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-zinc-100">10+ New Opportunities Detected</h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              We've found {status.count} matching opportunities since your last sync.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 hover:text-zinc-300"
            onClick={() => setDismissed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="premium" 
            className="shadow-lg shadow-blue-500/20 px-4"
            onClick={onOrganize}
          >
            Organize Now <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
