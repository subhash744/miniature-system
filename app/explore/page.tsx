"use client";

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { getAllUsers, getLeaderboard, type UserProfile } from "@/lib/storage"
import { getTrendingProjectsFromSupabase } from "@/lib/projectHelpers"
import { motion } from "framer-motion"
import { getUserBadges } from "@/lib/badges"
import { TrendingUp, Award, Shuffle, Tag, Users } from "lucide-react"

export default function ExplorePage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [trendingProjects, setTrendingProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    const fetchData = async () => {
      // Fetch users
      const allUsers = await getAllUsers()
      setUsers(allUsers)
      
      // Fetch trending projects from Supabase
      try {
        const projectsResult = await getTrendingProjectsFromSupabase(10)
        if (projectsResult.success && projectsResult.data) {
          setTrendingProjects(projectsResult.data)
        }
      } catch (error) {
        console.error("Error fetching trending projects:", error)
      }
      
      setIsLoading(false)
    }
    
    fetchData()
  }, [])

  // Get featured profiles (hall of famers)
  const featuredProfiles = useMemo(() => {
    return users.filter(user => user.hallOfFamer).slice(0, 5)
  }, [users])

  // Get top badges this week
  const topBadges = useMemo(() => {
    const badgeCounts = new Map<string, { count: number; badge: any }>()
    
    users.forEach(user => {
      const userBadges = getUserBadges(user)
      userBadges.forEach(badge => {
        if (badge.unlocked) {
          if (badgeCounts.has(badge.id)) {
            badgeCounts.get(badge.id)!.count += 1
          } else {
            badgeCounts.set(badge.id, { count: 1, badge })
          }
        }
      })
    })
    
    return Array.from(badgeCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [users])

  // Get all unique interests/categories
  const categories = useMemo(() => {
    const allInterests = users.flatMap(user => user.interests)
    const uniqueInterests = Array.from(new Set(allInterests))
    return ["all", ...uniqueInterests]
  }, [users])

  // Filter users by category
  const filteredUsers = useMemo(() => {
    if (selectedCategory === "all") return users
    return users.filter(user => user.interests.includes(selectedCategory))
  }, [users, selectedCategory])

  // Get similar profiles based on interests
  const similarProfiles = useMemo(() => {
    if (selectedCategory === "all") return []
    
    // Find users with similar interests
    const similar = users
      .filter(user => 
        user.interests.includes(selectedCategory) && 
        user.interests.length > 1
      )
      .slice(0, 5)
    
    return similar
  }, [users, selectedCategory])

  // Get suggested follows (users with similar badges)
  const suggestedFollows = useMemo(() => {
    // For now, just show random users
    const shuffled = [...users].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 5)
  }, [users])

  // Select a random profile
  const selectRandomProfile = () => {
    if (users.length > 0) {
      const randomIndex = Math.floor(Math.random() * users.length)
      const randomUser = users[randomIndex]
      router.push(`/profile/${randomUser.id}`)
    }
  }

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F7F5F3]">
        <Navigation />
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="h-12 bg-[#E0DEDB] rounded mb-8 animate-pulse w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-[#E0DEDB] p-6">
                <div className="h-6 bg-[#E0DEDB] rounded mb-4 animate-pulse w-1/4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#E0DEDB] rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-[#E0DEDB] rounded mb-2 animate-pulse"></div>
                        <div className="h-3 bg-[#E0DEDB] rounded animate-pulse w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#37322F] mb-4">Explore</h1>
          <p className="text-lg text-[#605A57]">
            Discover amazing builders, projects, and communities
          </p>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedCategory === category
                    ? "bg-[#37322F] text-white"
                    : "bg-white text-[#37322F] border border-[#E0DEDB] hover:bg-[#F7F5F3]"
                }`}
              >
                {category === "all" ? "All Categories" : category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Profiles Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
          >
            <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#37322F]" />
              <h2 className="font-semibold text-[#37322F]">Featured Profiles</h2>
            </div>
            <div className="p-6">
              {featuredProfiles.length > 0 ? (
                <div className="space-y-4">
                  {featuredProfiles.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#F7F5F3] cursor-pointer transition"
                      onClick={() => router.push(`/profile/${user.id}`)}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] flex items-center justify-center">
                        <span className="font-semibold text-[#37322F]">
                          {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#37322F]">{user.displayName || user.username || 'Unknown User'}</h3>
                        <p className="text-sm text-[#605A57]">@{user.username || 'unknown'}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            Hall of Famer
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#605A57]">{user.views} views</p>
                        <p className="text-sm text-[#605A57]">{user.upvotes} upvotes</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#605A57]">No featured profiles yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Trending Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
          >
            <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#37322F]" />
              <h2 className="font-semibold text-[#37322F]">Trending Projects</h2>
            </div>
            <div className="p-6">
              {trendingProjects.length > 0 ? (
                <div className="space-y-4">
                  {trendingProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg hover:bg-[#F7F5F3] cursor-pointer transition"
                      onClick={() => router.push(`/profile/${project.profile_id}`)}
                    >
                      <h3 className="font-semibold text-[#37322F] mb-1">{project.title}</h3>
                      <p className="text-sm text-[#605A57] line-clamp-2 mb-2">
                        {project.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-[#605A57]">
                          by {project.user?.displayName || project.user?.username}
                        </p>
                        <div className="flex gap-3 text-xs text-[#605A57]">
                          <span>{project.views} views</span>
                          <span>{project.upvotes} upvotes</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#605A57]">No trending projects yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Top Badges This Week */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
          >
            <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#37322F]" />
              <h2 className="font-semibold text-[#37322F]">Top Badges</h2>
            </div>
            <div className="p-6">
              {topBadges.length > 0 ? (
                <div className="grid grid-cols-4 gap-4">
                  {topBadges.map((badgeData, index) => (
                    <motion.div
                      key={badgeData.badge.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex flex-col items-center p-3 bg-[#F7F5F3] rounded-lg"
                    >
                      <span className="text-2xl mb-1">{badgeData.badge.icon}</span>
                      <span className="text-xs font-medium text-center">{badgeData.badge.name}</span>
                      <span className="text-xs text-[#605A57] mt-1">{badgeData.count} earned</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#605A57]">No badges earned yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Random Profile Generator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
          >
            <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-[#37322F]" />
              <h2 className="font-semibold text-[#37322F]">Discover</h2>
            </div>
            <div className="p-6 text-center">
              <p className="text-[#605A57] mb-6">
                Find your next inspiration with a random profile
              </p>
              <button
                onClick={selectRandomProfile}
                className="px-6 py-3 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition flex items-center gap-2 mx-auto"
              >
                <Shuffle className="w-4 h-4" />
                Random Profile
              </button>
            </div>
          </motion.div>
        </div>

        {/* Similar Profiles */}
        {selectedCategory !== "all" && similarProfiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
          >
            <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#37322F]" />
              <h2 className="font-semibold text-[#37322F]">
                Similar Profiles in {selectedCategory}
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {similarProfiles.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#F7F5F3] cursor-pointer transition"
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] flex items-center justify-center">
                      <span className="font-semibold text-[#37322F] text-sm">
                        {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#37322F]">{user.displayName || user.username || 'Unknown User'}</h3>
                      <p className="text-sm text-[#605A57]">@{user.username || 'unknown'}</p>
                      <div className="flex gap-1 mt-1">
                        {user.interests?.slice(0, 2).map((interest, idx) => (
                          <span key={idx} className="text-xs px-1.5 py-0.5 bg-[#E0DEDB] text-[#37322F] rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Suggested Follows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
        >
          <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#37322F]" />
            <h2 className="font-semibold text-[#37322F]">Profiles You Might Like</h2>
          </div>
          <div className="p-6">
            {suggestedFollows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedFollows.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#F7F5F3] cursor-pointer transition"
                    onClick={() => router.push(`/profile/${user.id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] flex items-center justify-center">
                      <span className="font-semibold text-[#37322F] text-sm">
                        {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#37322F]">{user.displayName || user.username || 'Unknown User'}</h3>
                      <p className="text-sm text-[#605A57]">@{user.username || 'unknown'}</p>
                      <div className="flex gap-1 mt-1">
                        {user.interests?.slice(0, 2).map((interest, idx) => (
                          <span key={idx} className="text-xs px-1.5 py-0.5 bg-[#E0DEDB] text-[#37322F] rounded">
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#605A57]">No suggested profiles yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}