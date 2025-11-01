"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getLeaderboard, addUpvote, canUpvote } from "@/lib/storage"
import type { LeaderboardEntry } from "@/lib/storage"
import confetti from "canvas-confetti"
import { Star, TrendingUp, Award } from "lucide-react"

export function LandingLeaderboardPreview() {
  const router = useRouter()
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([])
  const [upvotedUsers, setUpvotedUsers] = useState<Set<string>>(new Set())
  const [animatingUpvotes, setAnimatingUpvotes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true)
      try {
        const leaderboard = await getLeaderboard("all-time")
        setTopUsers(leaderboard.slice(0, 5))
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchLeaderboard()
  }, [])

  const handleUpvote = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    const visitorId = "visitor_" + Math.random().toString(36).substr(2, 9)

    if (await canUpvote(userId, visitorId)) {
      await addUpvote(userId, visitorId)
      setUpvotedUsers(new Set([...upvotedUsers, userId]))

      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x: 0.5, y: 0.5 },
      })

      setAnimatingUpvotes(new Set([...animatingUpvotes, userId]))
      setTimeout(() => {
        setAnimatingUpvotes((prev: Set<string>) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }, 600)

      // Refresh leaderboard
      const leaderboard = await getLeaderboard("all-time")
      setTopUsers(leaderboard.slice(0, 5))
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-white to-[#F7F5F3]">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#37322F] rounded-full">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-4 font-bold">Live Leaderboard</h2>
          <p className="text-lg text-[#605A57] max-w-2xl mx-auto">See who's climbing the ranks right now. Get discovered and grow your audience.</p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-[#E0DEDB] animate-pulse">
                <div className="w-8 h-8 bg-[#E0DEDB] rounded-full"></div>
                <div className="w-12 h-12 bg-[#E0DEDB] rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-[#E0DEDB] rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-[#E0DEDB] rounded w-1/4"></div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-[#E0DEDB] rounded w-12 mb-1"></div>
                  <div className="h-3 bg-[#E0DEDB] rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : topUsers.length > 0 ? (
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {topUsers.map((user, idx) => (
              <motion.div
                key={user.userId}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-[#F7F5F3] rounded-lg border border-[#E0DEDB] hover:shadow-lg transition cursor-pointer backdrop-blur-sm group relative overflow-hidden"
                variants={itemVariants}
                onClick={() => router.push(`/profile/${user.userId}`)}
                whileHover={{ 
                  x: 4, 
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ duration: 0.2 }}
              >
                {/* Rank badge */}
                <div className="absolute -left-2 -top-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    idx === 0 ? "bg-yellow-500" : 
                    idx === 1 ? "bg-gray-400" : 
                    idx === 2 ? "bg-amber-700" : "bg-[#37322F]"
                  }`}>
                    {idx === 0 ? "1" : idx === 1 ? "2" : idx === 2 ? "3" : user.rank}
                  </div>
                </div>
                
                {/* Avatar and info */}
                <div className="ml-6 flex items-center gap-4 w-full">
                  <img 
                    src={user.avatar || "/placeholder.svg"} 
                    alt={user.displayName} 
                    className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#37322F] flex items-center gap-2">
                      {user.displayName}
                      {user.badges && user.badges.length > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                          {user.badges[0]}
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-[#605A57]">@{user.username}</p>
                  </div>
                  
                  {/* Stats */}
                  <div className="text-right hidden md:block">
                    <div className="flex items-center gap-1 text-[#37322F] font-bold">
                      <Star className="w-4 h-4" />
                      {user.score.toFixed(0)}
                    </div>
                    <div className="text-xs text-[#605A57] flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {user.upvotes} upvotes
                    </div>
                  </div>
                  
                  {/* Upvote button */}
                  <motion.button
                    onClick={(e: React.MouseEvent) => handleUpvote(user.userId, e)}
                    disabled={upvotedUsers.has(user.userId)}
                    className="p-2 rounded-full hover:bg-[#F7F5F3] transition disabled:opacity-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={animatingUpvotes.has(user.userId) ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-2xl">{upvotedUsers.has(user.userId) ? "❤️" : "🤍"}</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-2xl font-semibold text-[#37322F] mb-2">No profiles yet</h3>
            <p className="text-[#605A57] mb-6">Be the first to create a profile and appear on the leaderboard!</p>
            <motion.button
              onClick={() => router.push("/profile-creation")}
              className="px-6 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="w-4 h-4" />
              Create Your Profile
            </motion.button>
          </motion.div>
        )}

        <motion.div 
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => router.push("/leaderboard")}
            className="px-6 py-3 border border-[#37322F] text-[#37322F] rounded-full font-medium hover:bg-[#37322F] hover:text-white transition flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <TrendingUp className="w-4 h-4" />
            View Full Leaderboard
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}