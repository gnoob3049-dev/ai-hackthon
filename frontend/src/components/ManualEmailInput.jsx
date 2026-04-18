import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card'
import { Button } from './ui/button'

const DEMO_EMAILS = `Subject: URGENT: $10,000 AI Research Scholarship - Deadline in 5 Days

Dear CS Students, The National AI Foundation is offering a $10,000 scholarship for CS students. Eligibility: CS major, GPA 3.5+, graduating 2025-2027, US universities. Deadline: April 23, 2025. Apply at nationalai.org/scholarship2025.

---

Subject: Google STEP Internship - Now Accepting Applications

Google STEP internship open. 12-week paid summer program, AI/ML focus. $35/hr. GPA 3.4+ preferred. Apply: careers.google.com/students/step. Deadline May 15.

---

Subject: MIT CSAIL Research Fellowship

MIT CSAIL accepting summer research fellowship applications. 10 weeks, $6,000 stipend. CS/EE junior or senior, 3.6+ GPA preferred. Deadline May 1. Apply at csail.mit.edu/fellowships.

---

Subject: HackFest 2025 Registration Open

HackFest 2025 - May 3-4. Theme: AI for Social Good. Prizes: $2000 first place. All majors welcome, teams of 2-4. Register: hackfest2025.devpost.com.

---

Subject: New Lunch Menu This Week

Check out our new spring lunch menu! Monday: Grilled chicken $8.50. Dining Services, Building A.`

export default function ManualEmailInput({ onAnalyze, onCancel }) {
  const [emailsRaw, setEmailsRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const emailBlocks = emailsRaw.split('---').map(e => e.trim()).filter(e => e.length > 20)
  const count = emailBlocks.length
  const overLimit = count > 15

  const handleAnalyze = async () => {
    if (count === 0) {
      setError("Please paste at least one email.")
      return
    }
    if (overLimit) {
      setError("Maximum 15 emails allowed per manual run.")
      return
    }

    setLoading(true)
    setError('')
    try {
      await onAnalyze(emailBlocks)
    } catch (e) {
      setError("Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 shadow-2xl max-w-2xl w-full">
      <CardHeader>
        <CardTitle>Manual Paste Mode</CardTitle>
        <CardDescription>
          Paste your email content below. Separate multiple emails with <code className="bg-zinc-950 px-1 py-0.5 rounded border border-zinc-800 text-zinc-300">---</code> on its own line.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <textarea
          value={emailsRaw}
          onChange={(e) => setEmailsRaw(e.target.value)}
          placeholder="Subject: ... \n\n Content here... \n --- \n Subject: ..."
          className="w-full h-64 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-700 resize-none"
        />
        
        <div className="flex justify-between items-center text-xs">
          <span className={overLimit ? "text-red-400 font-medium" : "text-zinc-500"}>
            {count} / 15 emails detected
          </span>
          <span className="text-zinc-500">
            {emailsRaw.length} characters
          </span>
        </div>

        {error && <p className="text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">{error}</p>}
      </CardContent>
      <CardFooter className="flex gap-3 pt-0">
        <Button variant="ghost" className="flex-1" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setEmailsRaw(DEMO_EMAILS)} 
          disabled={loading}
          className="flex-1"
        >
          Load Demo
        </Button>
        <Button 
          variant="premium" 
          className="flex-[2]" 
          onClick={handleAnalyze} 
          disabled={loading || count === 0 || overLimit}
        >
          {loading ? "Analyzing..." : "Analyze Now"}
        </Button>
      </CardFooter>
    </Card>
  )
}
