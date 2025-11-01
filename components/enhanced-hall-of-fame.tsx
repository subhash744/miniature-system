"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { getAllUsers, type UserProfile } from "@/lib/storage"
import { getUserBadges, type Badge } from "@/lib/badges"
import MapComponent from "@/components/map-component"
import { Search, Grid, List, MapPin, Shuffle, Filter, X } from "lucide-react"

interface EnhancedHallOfFameProps {
  initialUsers?: UserProfile[]
}

export function EnhancedHallOfFame({ initialUsers }: EnhancedHallOfFameProps) {
  const router = useRouter()
  const [users, setUsers] = useState<UserProfile[]>(initialUsers || [])
  const [displayUsers, setDisplayUsers] = useState<UserProfile[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")
  const [sortBy, setSortBy] = useState<"newest" | "upvoted" | "viewed" | "alphabetical">("newest")
  const [category, setCategory] = useState<"all" | "featured" | "rising" | "veterans">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedBadges, setSelectedBadges] = useState<string[]>([])
  const [minStreak, setMinStreak] = useState(0)
  const [minProjects, setMinProjects] = useState(0)
  const [joinDateFilter, setJoinDateFilter] = useState<"all" | "week" | "month" | "year">("all")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [visibleUsers, setVisibleUsers] = useState(21)
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null)

  // Load users on mount
  useEffect(() => {
    const loadUsers = async () => {
      if (!initialUsers) {
        const allUsers = await getAllUsers()
        setUsers(allUsers)
        setDisplayUsers(allUsers)
      } else {
        setDisplayUsers(initialUsers)
      }
      setIsLoading(false)
    }
    
    loadUsers()
  }, [initialUsers])

  // Apply filters and sorting
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...displayUsers]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          user.displayName.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query) ||
          user.bio.toLowerCase().includes(query)
      )
    }

    // Apply badge filter
    if (selectedBadges.length > 0) {
      result = result.filter((user) => {
        const userBadges = getUserBadges(user)
        return selectedBadges.some((badgeId) =>
          userBadges.some((badge) => badge.id === badgeId && badge.unlocked)
        )
      })
    }

    // Apply streak filter
    if (minStreak > 0) {
      result = result.filter((user) => user.streak >= minStreak)
    }

    // Apply project count filter
    if (minProjects > 0) {
      result = result.filter((user) => user.projects.length >= minProjects)
    }

    // Apply join date filter
    if (joinDateFilter !== "all") {
      const now = Date.now()
      const oneDay = 24 * 60 * 60 * 1000
      const filterDate = new Date(
        now -
          (joinDateFilter === "week"
            ? 7 * oneDay
            : joinDateFilter === "month"
            ? 30 * oneDay
            : 365 * oneDay)
      ).getTime()

      result = result.filter((user) => user.createdAt >= filterDate)
    }

    // Apply category filter
    if (category === "featured") {
      result = result.filter((user) => user.hallOfFamer)
    } else if (category === "rising") {
      result = result.filter((user) => user.streak >= 7 && user.upvotes >= 50)
    } else if (category === "veterans") {
      result = result.filter((user) => user.streak >= 30)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt
        case "upvoted":
          return b.upvotes - a.upvotes
        case "viewed":
          return b.views - a.views
        case "alphabetical":
          return a.displayName.localeCompare(b.displayName)
        default:
          return 0
      }
    })

    return result
  }, [
    displayUsers,
    searchQuery,
    selectedBadges,
    minStreak,
    minProjects,
    joinDateFilter,
    category,
    sortBy
  ])

  // Handle infinite scroll
  const loadMoreUsers = useCallback(() => {
    setVisibleUsers((prev) => prev + 21)
  }, [])

  // Reset visible users when filters change
  useEffect(() => {
    setVisibleUsers(21)
  }, [filteredAndSortedUsers])

  // Get visible users for current page
  const visibleUsersList = useMemo(() => {
    return filteredAndSortedUsers.slice(0, visibleUsers)
  }, [filteredAndSortedUsers, visibleUsers])

  // Check if there are more users to load
  const hasMoreUsers = visibleUsers < filteredAndSortedUsers.length

  // Handle random profile selection
  const selectRandomProfile = () => {
    if (filteredAndSortedUsers.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAndSortedUsers.length)
      const randomUser = filteredAndSortedUsers[randomIndex]
      router.push(`/profile/${randomUser.id}`)
    }
  }

  // Handle map pin click
  const handlePinClick = (userId: string) => {
    setSelectedUserId(userId)
    // Scroll to user in list view if needed
  }

  // Get all available badges for filter
  const allBadges = useMemo(() => {
    if (users.length === 0) return []
    const badgesMap = new Map<string, Badge>()
    
    users.forEach((user) => {
      const userBadges = getUserBadges(user)
      userBadges.forEach((badge) => {
        if (badge.unlocked && !badgesMap.has(badge.id)) {
          badgesMap.set(badge.id, badge)
        }
      })
    })
    
    return Array.from(badgesMap.values())
  }, [users])

  // Toggle badge filter
  const toggleBadgeFilter = (badgeId: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badgeId)
        ? prev.filter((id) => id !== badgeId)
        : [...prev, badgeId]
    )
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedBadges([])
    setMinStreak(0)
    setMinProjects(0)
    setJoinDateFilter("all")
    setSearchQuery("")
  }

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-6">
      <AnimatePresence>
        {visibleUsersList.map((user) => (
          <motion.div
            key={user.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="group cursor-pointer"
            onClick={() => router.push(`/profile/${user.id}`)}
            onMouseEnter={() => setHoveredUserId(user.id)}
            onMouseLeave={() => setHoveredUserId(null)}
          >
            {/* Frame */}
            <div className="bg-white border-8 border-[#37322F] p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-200 flex flex-col h-full">
              {/* Avatar */}
              <div className="w-full aspect-square bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] rounded-lg flex items-center justify-center mb-4 overflow-hidden flex-shrink-0">
                <div className="text-xl font-semibold text-[#37322F]">
                  {user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
              </div>

              {/* Info - Always visible in grid view */}
              <div className="flex-grow flex flex-col">
                <h3 className="font-semibold text-[#37322F] text-sm mb-1 truncate">
                  {user.displayName || user.username || 'Unknown User'}
                </h3>
                <p className="text-xs text-[#605A57] mb-2 line-clamp-2 flex-grow">
                  {user.bio || "No bio yet"}
                </p>

                {/* Badges preview - always visible */}
                <div className="mb-2 min-h-[24px]">
                  <div className="flex flex-wrap gap-1">
                    {getUserBadges(user)
                      .filter((badge) => badge.unlocked)
                      .slice(0, 3)
                      .map((badge) => (
                        <span
                          key={badge.id}
                          className="text-xs px-1.5 py-0.5 bg-[#37322F] text-white rounded"
                          title={badge.name}
                        >
                          {badge.icon}
                        </span>
                      ))}
                    {getUserBadges(user).filter((badge) => badge.unlocked).length > 3 && (
                      <span className="text-xs px-1.5 py-0.5 bg-[#605A57] text-white rounded">
                        +{getUserBadges(user).filter((badge) => badge.unlocked).length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-2 text-xs text-[#605A57] mt-auto">
                  <span>#{user.rank}</span>
                  <span>{user.views} views</span>
                  <span>{user.upvotes} votes</span>
                </div>

                {/* View Profile button - always visible with subtle hover effect */}
                <div className="mt-2">
                  <button
                    className="w-full py-1.5 bg-[#37322F] text-white text-xs rounded hover:bg-[#2a2520] transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  // Render list view
  const renderListView = () => (
    <div className="space-y-4">
      <AnimatePresence>
        {visibleUsersList.map((user) => (
          <motion.div
            key={user.id}
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-lg border border-[#E0DEDB] p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/profile/${user.id}`)}
          >
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] rounded-lg flex items-center justify-center">
                <div className="text-xl font-semibold text-[#37322F]">
                  {user.displayName.charAt(0)}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-[#37322F]">{user.displayName || user.username || 'Unknown User'}</h3>
                  <span className="text-xs text-[#605A57]">#{user.rank}</span>
                </div>
                <p className="text-sm text-[#605A57] mb-2 line-clamp-1">
                  {user.bio || "No bio yet"}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {getUserBadges(user)
                    .filter((badge) => badge.unlocked)
                    .slice(0, 5)
                    .map((badge) => (
                      <span
                        key={badge.id}
                        className="text-xs px-1.5 py-0.5 bg-[#37322F] text-white rounded"
                        title={badge.name}
                      >
                        {badge.icon}
                      </span>
                    ))}
                  {getUserBadges(user).filter((badge) => badge.unlocked).length > 5 && (
                    <span className="text-xs px-1.5 py-0.5 bg-[#605A57] text-white rounded">
                      +{getUserBadges(user).filter((badge) => badge.unlocked).length - 5}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm text-[#605A57]">
                  <span>{user.views} views</span>
                  <span>{user.upvotes} upvotes</span>
                  <span>{user.streak} day streak</span>
                  <span>{user.projects.length} projects</span>
                </div>
              </div>

              {/* View Profile button */}
              <button className="px-4 py-2 bg-[#37322F] text-white text-sm rounded hover:bg-[#2a2520] transition">
                View
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )

  // Render map view
  const renderMapView = () => (
    <div className="rounded-lg overflow-hidden border border-[#E0DEDB] bg-white">
      {users.some(user => user.location && (user.location.lat !== 0 || user.location.lng !== 0)) ? (
        <MapComponent 
          users={users.filter(user => user.location && (user.location.lat !== 0 || user.location.lng !== 0))} 
          selectedUserId={selectedUserId}
          onPinClick={handlePinClick}
        />
      ) : (
        <div className="h-96 flex items-center justify-center text-[#605A57]">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-[#E0DEDB]" />
            <p>No users with location data available</p>
            <p className="text-sm mt-2">Enable location sharing to see users on the map</p>
          </div>
        </div>
      )}
    </div>
  )

  // Render skeleton loaders
  const renderSkeletons = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="bg-white border-8 border-[#E0DEDB] p-4 rounded-lg shadow">
          <div className="w-full aspect-square bg-[#E0DEDB] rounded-lg mb-4 animate-pulse"></div>
          <div className="h-4 bg-[#E0DEDB] rounded mb-2 animate-pulse"></div>
          <div className="h-3 bg-[#E0DEDB] rounded mb-2 animate-pulse w-3/4"></div>
          <div className="h-3 bg-[#E0DEDB] rounded w-1/2 animate-pulse"></div>
        </div>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F7F5F3]">
        <div className="px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="h-12 bg-[#E0DEDB] rounded mb-4 animate-pulse w-1/3"></div>
            <div className="h-6 bg-[#E0DEDB] rounded mb-12 animate-pulse w-1/2"></div>
            {renderSkeletons()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <div className="px-6 py-12">
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-2">Hall of Fame</h1>
              <p className="text-lg text-[#605A57]">Discover the builders shaping the future</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={selectRandomProfile}
                className="flex items-center gap-2 px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition"
              >
                <Shuffle className="w-4 h-4" />
                <span className="hidden sm:inline">Random Profile</span>
              </button>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0DEDB] rounded-lg hover:bg-[#F7F5F3] transition"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {([
              { id: "all", label: "All" },
              { id: "featured", label: "Featured" },
              { id: "rising", label: "Rising Stars" },
              { id: "veterans", label: "Veterans" }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  category === tab.id
                    ? "bg-[#37322F] text-white"
                    : "bg-white text-[#37322F] border border-[#E0DEDB] hover:bg-[#F7F5F3]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-lg border border-[#E0DEDB] p-6 mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-[#37322F]">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#605A57] hover:text-[#37322F]"
                  >
                    Clear all
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-[#37322F] mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#605A57]" />
                      <input
                        type="text"
                        placeholder="Search profiles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
                      />
                    </div>
                  </div>
                  
                  {/* Badges */}
                  <div>
                    <label className="block text-sm font-medium text-[#37322F] mb-2">
                      Badges
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {allBadges.slice(0, 5).map((badge) => (
                        <button
                          key={badge.id}
                          onClick={() => toggleBadgeFilter(badge.id)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                            selectedBadges.includes(badge.id)
                              ? "bg-[#37322F] text-white"
                              : "bg-[#F7F5F3] text-[#37322F]"
                          }`}
                        >
                          <span>{badge.icon}</span>
                          <span>{badge.name}</span>
                        </button>
                      ))}
                      {allBadges.length > 5 && (
                        <button className="px-2 py-1 bg-[#F7F5F3] text-[#37322F] rounded text-xs">
                          +{allBadges.length - 5} more
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Streak */}
                  <div>
                    <label className="block text-sm font-medium text-[#37322F] mb-2">
                      Min Streak
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minStreak}
                      onChange={(e) => setMinStreak(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-[#605A57] mt-1">{minStreak} days</div>
                  </div>
                  
                  {/* Projects */}
                  <div>
                    <label className="block text-sm font-medium text-[#37322F] mb-2">
                      Min Projects
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={minProjects}
                      onChange={(e) => setMinProjects(Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-xs text-[#605A57] mt-1">{minProjects} projects</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* View Mode and Sort Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex gap-2">
              {([
                { id: "grid", icon: Grid, label: "Grid" },
                { id: "list", icon: List, label: "List" },
                { id: "map", icon: MapPin, label: "Map" }
              ] as const).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    viewMode === mode.id
                      ? "bg-[#37322F] text-white"
                      : "bg-white text-[#37322F] border border-[#E0DEDB] hover:bg-[#F7F5F3]"
                  }`}
                >
                  <mode.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-white border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
            >
              <option value="newest">Newest</option>
              <option value="upvoted">Most Upvoted</option>
              <option value="viewed">Most Viewed</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-[#605A57]">
              Showing {visibleUsersList.length} of {filteredAndSortedUsers.length} profiles
            </p>
          </div>

          {/* Content */}
          {viewMode === "grid" && renderGridView()}
          {viewMode === "list" && renderListView()}
          {viewMode === "map" && renderMapView()}

          {/* Load More Button */}
          {hasMoreUsers && (
            <div className="mt-8 text-center">
              <button
                onClick={loadMoreUsers}
                className="px-6 py-3 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition"
              >
                Load More
              </button>
            </div>
          )}

          {/* Empty State */}
          {filteredAndSortedUsers.length === 0 && !isLoading && (
            <div className="text-center py-20">
              <p className="text-lg text-[#605A57]">No builders found matching your criteria</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}