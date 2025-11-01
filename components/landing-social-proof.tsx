"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { getLeaderboard } from "@/lib/storage"
import type { LeaderboardEntry } from "@/lib/storage"

export function LandingSocialProof() {
  const [profileCount, setProfileCount] = useState(0)
  const [topProfiles, setTopProfiles] = useState<LeaderboardEntry[]>([])
  const [badgeCount] = useState(12) // As per requirements

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Get top profiles
      const leaderboard = await getLeaderboard("all-time")
      setTopProfiles(leaderboard.slice(0, 3))
    }
    
    fetchLeaderboard()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-[#F7F5F3]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-4 font-bold">Join Our Growing Community</h2>
          <p className="text-lg text-[#605A57]">Be part of something amazing</p>
        </motion.div>

        {/* Live Counter */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-block p-6 bg-white rounded-lg border border-[#E0DEDB] shadow-sm">
            <p className="text-lg text-[#605A57] mb-2">Profiles created</p>
            <p className="text-4xl font-bold text-[#37322F]">{profileCount.toLocaleString()}+</p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {/* Top Profiles This Week */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-semibold text-[#37322F] mb-6 text-center">Top Profiles</h3>
            {topProfiles.length > 0 ? (
              <div className="space-y-4">
                {topProfiles.map((profile, idx) => (
                  <motion.div
                    key={profile.userId}
                    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#E0DEDB] hover:shadow-md transition"
                    whileHover={{ x: 4 }}
                  >
                    <div className="text-xl font-bold text-[#37322F] w-6">
                      {idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}
                    </div>
                    <img 
                      src={profile.avatar || "/placeholder.svg"} 
                      alt={profile.displayName} 
                      className="w-12 h-12 rounded-full" 
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#37322F]">{profile.displayName}</h4>
                      <p className="text-sm text-[#605A57]">@{profile.username}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#37322F]">{profile.score.toFixed(0)}</div>
                      <div className="text-xs text-[#605A57]">points</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-[#E0DEDB]">
                <p className="text-[#605A57]">No profiles yet. Be the first to join!</p>
              </div>
            )}
          </motion.div>

          {/* Badge Showcase */}
          <motion.div variants={itemVariants}>
            <h3 className="text-2xl font-semibold text-[#37322F] mb-6 text-center">Achievement Badges</h3>
            <div className="p-6 bg-white rounded-lg border border-[#E0DEDB] h-full">
              <p className="text-center text-[#605A57] mb-4">{badgeCount} badges to earn</p>
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: badgeCount }).map((_, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center justify-center p-3 bg-[#F7F5F3] rounded-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-2xl">徽</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}