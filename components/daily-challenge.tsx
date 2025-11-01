"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getDailyChallenge, completeDailyChallenge, getCurrentUser } from "@/lib/storage"
import confetti from "canvas-confetti"

interface DailyChallengeProps {
  userId: string
}

export function DailyChallenge({ userId }: DailyChallengeProps) {
  const [challenge, setChallenge] = useState<any>(null)
  const [progress, setProgress] = useState<number>(0)
  const [target, setTarget] = useState<number>(0)
  const [completed, setCompleted] = useState<boolean>(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        const dailyChallenge = getDailyChallenge()
        setChallenge(dailyChallenge)
        setCompleted(currentUser.dailyChallenge?.date === dailyChallenge.date && currentUser.dailyChallenge?.completed)
        
        // Set progress based on challenge type
        switch (dailyChallenge.prompt) {
          case "Add a new project today":
            setProgress(currentUser.projects.filter(p => 
              new Date(p.createdAt).toISOString().split('T')[0] === dailyChallenge.date
            ).length)
            setTarget(1)
            break
          case "Update your goal":
            setProgress(currentUser.goal ? 1 : 0)
            setTarget(1)
            break
          case "Share your profile":
            // This would require tracking shares
            setProgress(0)
            setTarget(1)
            break
          case "Engage with 3 profiles":
            setProgress(0) // Would need to track profile views
            setTarget(3)
            break
          case "Complete your bio":
            setProgress(currentUser.bio ? 1 : 0)
            setTarget(1)
            break
          default:
            setProgress(0)
            setTarget(1)
        }
      }
    }
    
    fetchCurrentUser()
  }, [userId])

  const handleComplete = async () => {
    if (completed) return
    
    const success = await completeDailyChallenge(userId)
    if (success) {
      setCompleted(true)
      
      // Add XP to user
      // This would be handled in the completeDailyChallenge function
      
      // Celebration confetti
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 }
      })
    }
  }

  if (!challenge) return null

  const progressPercentage = target > 0 ? Math.min(100, (progress / target) * 100) : 0

  return (
    <div className="bg-white rounded-xl border border-[#E0DEDB] p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🎯</div>
        <div className="flex-1">
          <h3 className="font-semibold text-[#37322F] mb-2">Daily Challenge</h3>
          <p className="text-[#605A57] mb-4">{challenge.prompt}</p>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#605A57]">Progress</span>
              <span className="font-medium text-[#37322F]">{progress}/{target}</span>
            </div>
            <div className="w-full bg-[#E0DEDB] rounded-full h-2">
              <motion.div 
                className="bg-[#37322F] h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#605A57]">Reward: +{challenge.reward} XP</span>
            <button
              onClick={handleComplete}
              disabled={completed}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                completed 
                  ? "bg-green-100 text-green-700" 
                  : "bg-[#37322F] text-white hover:bg-[#2a2520]"
              }`}
            >
              {completed ? "Completed! 🎉" : "Complete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}