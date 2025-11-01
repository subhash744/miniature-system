"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  getCurrentUser, 
  useStreakFreeze,
  getAllUsers
} from "@/lib/storage"
import { getUserBadges } from "@/lib/badges"
import { StreakDisplay } from "@/components/streak-display"
import { DailyChallenge } from "@/components/daily-challenge"
import { LevelDisplay } from "@/components/level-display"
import { BadgeGallery } from "@/components/badge-gallery"
import { motion } from "framer-motion"

export function GamificationDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [xpToNextLevel, setXpToNextLevel] = useState(0)

  useEffect(() => {
    const initDashboard = async () => {
      setMounted(true)
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        // Calculate XP needed for next level (500 XP per level)
        setXpToNextLevel(currentUser.level * 500)
      } else {
        router.push("/")
      }
    }
    
    initDashboard()
  }, [router])

  const handleUseFreeze = async () => {
    if (user && await useStreakFreeze(user.id)) {
      // Refresh user data
      const allUsers = await getAllUsers()
      const updatedUser = allUsers.find((u: any) => u.id === user.id)
      if (updatedUser) {
        setUser(updatedUser)
      }
    }
  }

  if (!mounted || !user) return null

  const userBadges = getUserBadges(user)
  const unlockedBadges = userBadges.filter(badge => badge.unlocked).length
  const totalBadges = userBadges.length

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Your Gamification Dashboard</h1>
          <p className="text-[#605A57]">Track your progress, badges, and achievements</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-[#E0DEDB] p-4 text-center">
            <p className="text-2xl font-bold text-[#37322F]">{user.streak}</p>
            <p className="text-sm text-[#605A57]">Day Streak</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E0DEDB] p-4 text-center">
            <p className="text-2xl font-bold text-[#37322F]">{unlockedBadges}/{totalBadges}</p>
            <p className="text-sm text-[#605A57]">Badges</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E0DEDB] p-4 text-center">
            <p className="text-2xl font-bold text-[#37322F]">{user.level}</p>
            <p className="text-sm text-[#605A57]">Level</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E0DEDB] p-4 text-center">
            <p className="text-2xl font-bold text-[#37322F]">{user.xp}</p>
            <p className="text-sm text-[#605A57]">Total XP</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Streak Display */}
            <StreakDisplay user={user} onUseFreeze={handleUseFreeze} />
            
            {/* Daily Challenge */}
            <DailyChallenge userId={user.id} />
            
            {/* Level Display */}
            <LevelDisplay 
              level={user.level} 
              xp={user.xp} 
              xpToNextLevel={xpToNextLevel} 
            />
          </div>
          
          {/* Right Column */}
          <div className="space-y-8">
            {/* Badge Gallery */}
            <BadgeGallery user={user} />
            
            {/* Achievements Summary */}
            <div className="bg-white rounded-xl border border-[#E0DEDB] p-6">
              <h3 className="font-semibold text-[#37322F] mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                {user.achievements && user.achievements.slice(-3).map((achievement: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#F7F5F3] rounded-lg">
                    <span className="text-xl">🏆</span>
                    <span className="text-sm font-medium text-[#37322F]">{achievement}</span>
                  </div>
                ))}
                {(!user.achievements || user.achievements.length === 0) && (
                  <p className="text-sm text-[#605A57] text-center py-4">
                    Complete challenges to earn achievements
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}