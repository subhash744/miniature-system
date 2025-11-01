"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { 
  getCurrentUser, 
  addUpvote, 
  canUpvote,
  incrementViewCount
} from "@/lib/storage"
import { 
  getLeaderboardFromSupabase, 
  getFeaturedBuildersFromSupabase
} from "@/lib/leaderboardHelpers"
import { Search, Heart, Eye, Flame, Link, Calendar } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

interface LeaderboardEntry {
  userId: string
  username: string
  displayName: string
  avatar: string
  rank: number
  score: number
  views: number
  upvotes: number
  streak: number
  badges: string[]
  projectCount: number
  bio?: string
  links?: { title: string; url: string }[]
}

type SortBy = "today" | "yesterday" | "all-time" | "newcomers"
type SortOption = "rank" | "upvotes" | "views" | "streak" | "joined"

const badgeColors: Record<string, string> = {
  Bronze: "bg-amber-700 text-white",
  Silver: "bg-gray-400 text-white",
  Gold: "bg-yellow-500 text-white",
  Diamond: "bg-blue-400 text-white",
  Popular: "bg-pink-500 text-white",
  Trending: "bg-red-500 text-white",
  Viral: "bg-purple-500 text-white",
  Consistent: "bg-green-500 text-white",
  Dedicated: "bg-indigo-500 text-white",
  Unstoppable: "bg-orange-500 text-white",
  Builder: "bg-cyan-500 text-white",
  Prolific: "bg-violet-500 text-white",
}

export default function ImprovedLeaderboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [sortBy, setSortBy] = useState<SortBy>("today")
  const [sortOption, setSortOption] = useState<SortOption>("rank")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [upvotedUsers, setUpvotedUsers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(20)
  const [showBackToTop, setShowBackToTop] = useState(false)

  // Initialize data
  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
      
      // Fetch leaderboard data from Supabase
      const leaderboardResult = await getLeaderboardFromSupabase(sortBy)
      if (leaderboardResult.success && leaderboardResult.data) {
        setLeaderboard(leaderboardResult.data as LeaderboardEntry[])
      }
      
      // Fetch featured builders from Supabase
      const featuredResult = await getFeaturedBuildersFromSupabase(3)
      if (featuredResult.success && featuredResult.data) {
        setFeatured(featuredResult.data)
      }
      
      setUpvotedUsers(new Set())
    }
    
    init()
    
    // Handle scroll for back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [sortBy])

  // Update leaderboard when sort changes
  const updateLeaderboard = useCallback(async (sort: SortBy) => {
    setIsLoading(true)
    setSortBy(sort)
    
    // Fetch updated leaderboard data from Supabase
    const leaderboardResult = await getLeaderboardFromSupabase(sort)
    if (leaderboardResult.success && leaderboardResult.data) {
      setLeaderboard(leaderboardResult.data as LeaderboardEntry[])
    }
    
    setVisibleCount(20)
    setIsLoading(false)
  }, [])

  // Filter and sort leaderboard based on search and sort options
  useEffect(() => {
    let result = [...leaderboard]
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(entry => 
        entry.displayName.toLowerCase().includes(term) || 
        entry.username.toLowerCase().includes(term) ||
        (entry.bio && entry.bio.toLowerCase().includes(term))
      )
    }
    
    // Apply sorting
    switch (sortOption) {
      case "upvotes":
        result.sort((a, b) => b.upvotes - a.upvotes)
        break
      case "views":
        result.sort((a, b) => b.views - a.views)
        break
      case "streak":
        result.sort((a, b) => b.streak - a.streak)
        break
      case "joined":
        // This would require createdAt data in the entry
        break
      case "rank":
      default:
        // Already sorted by rank
        break
    }
    
    setFilteredLeaderboard(result)
  }, [leaderboard, searchTerm, sortOption])

  // Handle upvote
  const handleUpvote = async (userId: string) => {
    const visitorId = "visitor_" + Math.random().toString(36).substr(2, 9)
    
    if (await canUpvote(userId, visitorId)) {
      await addUpvote(userId, visitorId)
      
      // Update UI
      setUpvotedUsers(prev => {
        const newSet = new Set(prev)
        newSet.add(userId)
        return newSet
      })
      
      // Add full-page confetti effect
      const duration = 2000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)
      
      // Update leaderboard data
      await updateLeaderboard(sortBy)
    }
  }

  // Handle view profile
  const handleViewProfile = async (userId: string) => {
    await incrementViewCount(userId)
    router.push(`/profile/${userId}`)
  }

  // Load more profiles
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, filteredLeaderboard.length))
  }

  // Back to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Format date
  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }
    return new Date().toLocaleDateString('en-US', options)
  }

  // Get top 3 for podium display
  const topThree = useMemo(() => {
    return filteredLeaderboard.slice(0, 3)
  }, [filteredLeaderboard])

  // Get remaining entries
  const remainingEntries = useMemo(() => {
    return filteredLeaderboard.slice(3, visibleCount)
  }, [filteredLeaderboard, visibleCount])

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      {/* Leaderboard Header */}
      <div className="bg-white border-b border-[#E0DEDB] px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-serif text-[#37322F] mb-2">Daily Leaderboard 🏆</h1>
            <p className="text-lg text-[#605A57] mb-2">Ranked by upvotes, views, and activity</p>
            <p className="text-[#605A57]">{formatDate()}</p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#605A57] w-5 h-5" />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#E0DEDB] rounded-full focus:outline-none focus:ring-2 focus:ring-[#37322F] bg-white"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {(["today", "yesterday", "all-time", "newcomers"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  updateLeaderboard(tab)
                }}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  sortBy === tab
                    ? "bg-[#37322F] text-white"
                    : "bg-white border border-[#E0DEDB] text-[#37322F] hover:bg-[#F7F5F3]"
                }`}
              >
                {tab === "today" && "🔥 Today"}
                {tab === "yesterday" && "📅 Yesterday"}
                {tab === "all-time" && "⭐ All-Time"}
                {tab === "newcomers" && "🆕 Newcomers"}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex justify-center">
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="appearance-none bg-white border border-[#E0DEDB] rounded-lg py-2 pl-4 pr-8 focus:outline-none focus:ring-2 focus:ring-[#37322F]"
              >
                <option value="rank">Rank</option>
                <option value="upvotes">Upvotes</option>
                <option value="views">Views</option>
                <option value="streak">Streak</option>
                <option value="joined">Joined Date</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-[#605A57]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section (Top 3) - Podium Display */}
      {topThree.length > 0 && (
        <div className="bg-gradient-to-b from-white to-[#F7F5F3] px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-serif text-[#37322F] mb-8 text-center">Featured Today</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl border-2 border-[#E0DEDB] p-6 text-center h-full hover:shadow-lg transition">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-xl font-bold">
                        🥈
                      </div>
                    </div>
                    <div className="pt-8">
                      <img 
                        src={topThree[1].avatar || "/placeholder.svg"} 
                        alt={topThree[1].displayName} 
                        className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-[#E0DEDB]"
                      />
                      <h3 className="font-semibold text-[#37322F] mb-1">{topThree[1].displayName}</h3>
                      <p className="text-sm text-[#605A57] mb-4">@{topThree[1].username}</p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-[#F7F5F3] p-2 rounded-lg">
                          <Heart className="w-4 h-4 mx-auto text-[#37322F] mb-1" />
                          <p className="text-xs text-[#605A57]">{topThree[1].upvotes}</p>
                        </div>
                        <div className="bg-[#F7F5F3] p-2 rounded-lg">
                          <Eye className="w-4 h-4 mx-auto text-[#37322F] mb-1" />
                          <p className="text-xs text-[#605A57]">{topThree[1].views}</p>
                        </div>
                        <div className="bg-[#F7F5F3] p-2 rounded-lg">
                          <Flame className="w-4 h-4 mx-auto text-[#37322F] mb-1" />
                          <p className="text-xs text-[#605A57]">{topThree[1].streak}d</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewProfile(topThree[1].userId)}
                        className="w-full py-2 bg-[#37322F] text-white rounded-lg text-sm font-medium hover:bg-[#2a2520] transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {topThree[0] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl border-2 border-yellow-400 p-8 text-center h-full hover:shadow-lg transition relative overflow-hidden">
                    {/* Spotlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/30 to-transparent pointer-events-none"></div>
                    
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        🥇
                      </div>
                    </div>
                    <div className="pt-10">
                      <img 
                        src={topThree[0].avatar || "/placeholder.svg"} 
                        alt={topThree[0].displayName} 
                        className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-yellow-400"
                      />
                      <h3 className="font-semibold text-[#37322F] text-lg mb-1">{topThree[0].displayName}</h3>
                      <p className="text-sm text-[#605A57] mb-4">@{topThree[0].username}</p>
                      
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <Heart className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                          <p className="text-sm font-semibold text-[#37322F]">{topThree[0].upvotes}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <Eye className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                          <p className="text-sm font-semibold text-[#37322F]">{topThree[0].views}</p>
                        </div>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <Flame className="w-5 h-5 mx-auto text-yellow-600 mb-1" />
                          <p className="text-sm font-semibold text-[#37322F]">{topThree[0].streak}d</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewProfile(topThree[0].userId)}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg text-sm font-medium hover:from-yellow-600 hover:to-yellow-700 transition shadow-md"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {topThree[2] && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div className="bg-white rounded-xl border-2 border-[#E0DEDB] p-6 text-center h-full hover:shadow-lg transition">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-700 to-amber-800 flex items-center justify-center text-white text-xl font-bold">
                        🥉
                      </div>
                    </div>
                    <div className="pt-8">
                      <img 
                        src={topThree[2].avatar || "/placeholder.svg"} 
                        alt={topThree[2].displayName} 
                        className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-[#E0DEDB]"
                      />
                      <h3 className="font-semibold text-[#37322F] mb-1">{topThree[2].displayName}</h3>
                      <p className="text-sm text-[#605A57] mb-4">@{topThree[2].username}</p>
                      
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="bg-[#F7F5F3] p-2 rounded-lg">
                          <Heart className="w-4 h-4 mx-auto text-[#37322F] mb-1" />
                          <p className="text-xs text-[#605A57]">{topThree[2].upvotes}</p>
                        </div>
                        <div className="bg-[#F7F5F3] p-2 rounded-lg">
                          <Eye className="w-4 h-4 mx-auto text-[#37322F] mb-1" />
                          <p className="text-xs text-[#605A57]">{topThree[2].views}</p>
                        </div>
                        <div className="bg-[#F7F5F3] p-2 rounded-lg">
                          <Flame className="w-4 h-4 mx-auto text-[#37322F] mb-1" />
                          <p className="text-xs text-[#605A57]">{topThree[2].streak}d</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleViewProfile(topThree[2].userId)}
                        className="w-full py-2 bg-[#37322F] text-white rounded-lg text-sm font-medium hover:bg-[#2a2520] transition"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List - Excel Style Table */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Excel-style Table */}
          <div className="bg-white rounded-xl border border-[#E0DEDB] overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-[#F7F5F3] border-b-2 border-[#E0DEDB] px-6 py-3 font-semibold text-[#37322F] text-sm">
              <div className="col-span-1 text-center">Rank</div>
              <div className="col-span-3">Builder</div>
              <div className="col-span-1 text-center">
                <Heart className="w-4 h-4 inline" />
              </div>
              <div className="col-span-1 text-center">
                <Eye className="w-4 h-4 inline" />
              </div>
              <div className="col-span-1 text-center">
                <Flame className="w-4 h-4 inline" />
              </div>
              <div className="col-span-2">Badges</div>
              <div className="col-span-1 text-center">Projects</div>
              <div className="col-span-2 text-center">Actions</div>
            </div>

            {/* Table Body */}
            <AnimatePresence>
              {remainingEntries.map((entry, index) => (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="grid grid-cols-12 gap-4 border-b border-[#E0DEDB] px-6 py-4 hover:bg-[#F7F5F3] transition cursor-pointer items-center"
                  onClick={() => handleViewProfile(entry.userId)}
                >
                  {/* Rank */}
                  <div className="col-span-1 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] text-sm font-bold text-[#37322F]">
                      #{entry.rank}
                    </div>
                  </div>

                  {/* Builder Info */}
                  <div className="col-span-3">
                    <div className="font-semibold text-[#37322F]">{entry.displayName}</div>
                    <div className="text-xs text-[#605A57]">@{entry.username}</div>
                  </div>

                  {/* Upvotes */}
                  <div className="col-span-1 text-center text-sm font-medium text-[#37322F]">
                    {entry.upvotes}
                  </div>

                  {/* Views */}
                  <div className="col-span-1 text-center text-sm font-medium text-[#37322F]">
                    {entry.views}
                  </div>

                  {/* Streak */}
                  <div className="col-span-1 text-center text-sm font-medium text-[#37322F]">
                    {entry.streak}d
                  </div>

                  {/* Badges */}
                  <div className="col-span-2">
                    <div className="flex gap-1 flex-wrap">
                      {entry.badges.slice(0, 3).map((badge) => (
                        <span
                          key={badge}
                          className={`px-2 py-0.5 text-xs font-medium rounded ${badgeColors[badge] || "bg-gray-300"}`}
                          title={badge}
                        >
                          {badge.substring(0, 3)}
                        </span>
                      ))}
                      {entry.badges.length > 3 && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#605A57] text-white">
                          +{entry.badges.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Projects */}
                  <div className="col-span-1 text-center text-sm font-medium text-[#37322F]">
                    {entry.projectCount}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex gap-2 justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUpvote(entry.userId)
                      }}
                      disabled={upvotedUsers.has(entry.userId)}
                      className={`p-2 rounded-lg text-sm font-medium transition ${
                        upvotedUsers.has(entry.userId)
                          ? "bg-red-100 text-red-600"
                          : "bg-[#F7F5F3] text-[#37322F] hover:bg-[#E0DEDB]"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${upvotedUsers.has(entry.userId) ? "fill-current" : ""}`} />
                    </button>
                    <button
                      className="px-3 py-2 bg-[#37322F] text-white text-xs rounded-lg hover:bg-[#2a2520] transition"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewProfile(entry.userId)
                      }}
                    >
                      View
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load More Button */}
          {visibleCount < filteredLeaderboard.length && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition disabled:opacity-50"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {/* Empty States */}
          {filteredLeaderboard.length === 0 && !isLoading && (
            <div className="text-center py-12">
              {searchTerm ? (
                <div>
                  <h3 className="text-xl font-semibold text-[#37322F] mb-2">No profiles found</h3>
                  <p className="text-[#605A57] mb-6">
                    No profiles found for "{searchTerm}". Try a different search or browse all profiles.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      updateLeaderboard(sortBy)
                    }}
                    className="px-6 py-3 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-[#37322F] mb-2">No new activity today</h3>
                  <p className="text-[#605A57] mb-6">Be the first to join the leaderboard!</p>
                  <button
                    onClick={() => router.push("/profile-creation")}
                    className="px-6 py-3 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
                  >
                    Create Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-[#37322F] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a2520] transition z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
          </svg>
        </button>
      )}
    </div>
  )
}