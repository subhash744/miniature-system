import { 
  saveProfileToSupabase, 
  getProfileFromSupabase, 
  saveLeaderboardEntryToSupabase, 
  saveUpvoteToSupabase, 
  canUpvoteInSupabase, 
  saveDailyStatsToSupabase,
  getAllProfilesFromSupabase,
  getUpvotesForUserFromSupabase,
  getDailyStatsFromSupabase,
  saveDailyViewsToSupabase,
  saveDailyUpvotesToSupabase,
  saveUserFollowerToSupabase,
  saveUserFollowingToSupabase,
  saveUserAchievementToSupabase,
  saveUserDailyStatsToSupabase
} from '@/lib/supabaseDb'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export interface Project {
  id: string
  title: string
  description: string
  bannerUrl?: string
  link?: string
  upvotes: number
  views: number
  createdAt: number
}

export interface Goal {
  title: string
  description: string
  startedAt: number
  progressPercent: number
}

export interface Social {
  x?: string
  github?: string
  website?: string
  linkedin?: string
}

export interface UserProfile {
  id: string
  username: string
  displayName: string
  quote?: string
  bio: string
  avatar: string
  social: Social
  goal?: Goal
  projects: Project[]
  links: { title: string; url: string }[]
  interests: string[]
  views: number
  upvotes: number
  rank: number
  createdAt: number
  badges: string[]
  streak: number
  lastActiveDate: number
  lastSeenDate: string
  dailyViews: { date: string; count: number }[]
  dailyUpvotes: { date: string; count: number }[]
  schemaVersion: number
  location?: {
    lat: number
    lng: number
    city: string
    country: string
  }
  metrics?: {
    mapClicks: number
  }
  dailyChallenge?: {
    date: string
    completed: boolean
    prompt: string
  }
  followers: string[]
  following: string[]
  xp: number
  level: number
  referralCode: string
  referralCount: number
  hideLocation: boolean
  themePreference: "light" | "dark" | "gradient"
  dailyStats: { date: string; xp: number }[]
  achievements: string[]
  // New gamification fields
  streakFreezes: number
  featuredCount: number
  firstUpvoteReceived: boolean
  linkMasterUnlocked: boolean
  earlyAdopter: boolean
  hallOfFamer: boolean
  creativeUnlocked: boolean
  connectedUnlocked: boolean
  quickRiseUnlocked: boolean
  hotStreakUnlocked: boolean
  rareBadges: string[]
}

export interface DailyChallenge {
  id: string
  date: string
  prompt: string
  reward: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number
}

export interface LeaderboardEntry {
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
}

export interface AnalyticsData {
  totalViews: number
  totalUpvotes: number
  weeklyViews: number
  weeklyUpvotes: number
  streak: number
  badges: string[]
  dailyData: { date: string; views: number; upvotes: number }[]
  projectStats: { projectId: string; title: string; views: number; upvotes: number; ctr: number }[]
  // New analytics metrics
  engagementRate: number
  growthRate: number
  rankHistory: { date: string; rank: number }[]
  visitorRetention: number
  peakTimes: { hour: number; views: number }[]
  referralSources: { source: string; count: number }[]
  bestPerformingDay: string
  peakHour: string
  averageSession: string
}

export const setCurrentUser = (userId: string) => {
  currentUserId = userId
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('rigeo_current_user_id', userId)
    }
  } catch {}
}

export const getCurrentUserId = (): string | null => {
  if (currentUserId) return currentUserId
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem('rigeo_current_user_id')
      if (stored) {
        currentUserId = stored
        return stored
      }
    }
  } catch {}
  return null
}

const SCHEMA_VERSION = 4
export const getTodayDate = () => new Date().toISOString().split("T")[0]

// Cache for current user to avoid repeated fetches
let currentUserCache: UserProfile | null = null
let currentUserCacheTime: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Cache for current user to avoid repeated fetches
let currentUserId: string | null = null

const migrateUserSchema = (user: any): UserProfile => {
  if (user.schemaVersion === SCHEMA_VERSION) return user

  return {
    ...user,
    quote: user.quote || "",
    social: user.social || { x: "", github: "", website: "", linkedin: "" },
    goal: user.goal || undefined,
    projects: user.projects || [],
    dailyUpvotes: user.dailyUpvotes || user.dailyVotes || [],
    lastSeenDate: user.lastSeenDate || getTodayDate(),
    dailyViews: user.dailyViews || [],
    location: user.location || { lat: 0, lng: 0, city: "", country: "" },
    metrics: user.metrics || { mapClicks: 0 },
    dailyChallenge: user.dailyChallenge || undefined,
    followers: user.followers || [],
    following: user.following || [],
    xp: user.xp || 0,
    level: user.level || 1,
    referralCode: user.referralCode || generateReferralCode(),
    referralCount: user.referralCount || 0,
    hideLocation: user.hideLocation || false,
    themePreference: user.themePreference || "light",
    dailyStats: user.dailyStats || [],
    achievements: user.achievements || [],
    // New gamification fields
    streakFreezes: user.streakFreezes || 0,
    featuredCount: user.featuredCount || 0,
    firstUpvoteReceived: user.firstUpvoteReceived || false,
    linkMasterUnlocked: user.linkMasterUnlocked || false,
    earlyAdopter: user.earlyAdopter || false,
    hallOfFamer: user.hallOfFamer || false,
    creativeUnlocked: user.creativeUnlocked || false,
    connectedUnlocked: user.connectedUnlocked || false,
    quickRiseUnlocked: user.quickRiseUnlocked || false,
    hotStreakUnlocked: user.hotStreakUnlocked || false,
    rareBadges: user.rareBadges || [],
    schemaVersion: SCHEMA_VERSION,
  }
}

export const generateReferralCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export const getDailyChallenge = (): DailyChallenge => {
  const today = getTodayDate()
  const challenges = [
    { prompt: "Add a new project today", reward: 50 },
    { prompt: "Update your goal", reward: 30 },
    { prompt: "Share your profile", reward: 40 },
    { prompt: "Engage with 3 profiles", reward: 60 },
    { prompt: "Complete your bio", reward: 25 },
  ]

  const seed = today.split("-").reduce((acc, part) => acc + Number.parseInt(part), 0)
  const challenge = challenges[seed % challenges.length]

  return {
    id: `challenge_${today}`,
    date: today,
    prompt: challenge.prompt,
    reward: challenge.reward,
  }
}

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { success, data, error } = await getAllProfilesFromSupabase()
    
    if (!success) {
      console.error('Error fetching all profiles:', error)
      return []
    }
    
    // Check if data exists
    if (!data) {
      return []
    }
    
    // Convert the Supabase data to UserProfile format
    return (data as any[]).map((profile: any) => ({
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name,
      quote: profile.quote,
      bio: profile.bio,
      avatar: profile.avatar,
      social: {
        x: profile.social_x,
        github: profile.social_github,
        website: profile.social_website,
        linkedin: profile.social_linkedin
      },
      views: profile.views,
      upvotes: profile.upvotes,
      rank: profile.rank,
      createdAt: new Date(profile.created_at).getTime(),
      streak: profile.streak,
      lastActiveDate: new Date(profile.last_active_date).getTime(),
      lastSeenDate: profile.last_seen_date,
      schemaVersion: profile.schema_version,
      location: {
        lat: profile.lat,
        lng: profile.lng,
        city: profile.city,
        country: profile.country
      },
      metrics: {
        mapClicks: profile.map_clicks
      },
      xp: profile.xp,
      level: profile.level,
      referralCode: profile.referral_code,
      referralCount: profile.referral_count,
      hideLocation: profile.hide_location,
      themePreference: profile.theme_preference,
      followers: [], // These would need to be fetched separately
      following: [], // These would need to be fetched separately
      projects: [], // These would need to be fetched separately
      links: [], // These would need to be fetched separately
      interests: [], // These would need to be fetched separately
      dailyViews: [], // These would need to be fetched separately
      dailyUpvotes: [], // These would need to be fetched separately
      dailyStats: [], // These would need to be fetched separately
      achievements: [], // These would need to be fetched separately
      badges: [], // These would need to be fetched separately
      streakFreezes: profile.streak_freezes,
      featuredCount: 0, // This would need to be fetched separately
      firstUpvoteReceived: false, // This would need to be fetched separately
      linkMasterUnlocked: false, // This would need to be fetched separately
      earlyAdopter: profile.early_adopter,
      hallOfFamer: profile.hall_of_famer,
      creativeUnlocked: profile.creative_unlocked,
      connectedUnlocked: profile.connected_unlocked,
      quickRiseUnlocked: false, // This would need to be fetched separately
      hotStreakUnlocked: false, // This would need to be fetched separately
      rareBadges: [], // These would need to be fetched separately
      goal: undefined, // Add missing property
      dailyChallenge: undefined // Add missing property
    }))
  } catch (error) {
    console.error('Unexpected error in getAllUsers:', error)
    return []
  }
}

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    // Get the current user ID from our stored variable
    const userId = getCurrentUserId()
    if (!userId) return null

    // Check if we have a cached version that's still valid
    if (currentUserCache && currentUserCache.id === userId && 
        Date.now() - currentUserCacheTime < CACHE_DURATION) {
      return currentUserCache
    }

    // Fetch user from Supabase
    const result = await getProfileFromSupabase(userId)
    if (result.success && result.data) {
      const user = migrateUserSchema(result.data)
      // Cache the user
      currentUserCache = user
      currentUserCacheTime = Date.now()
      return user
    }
    
    return null
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export const saveUserProfile = async (user: UserProfile, setAsCurrent: boolean = false) => {
  try {
    const result = await saveProfileToSupabase(user)
    return result
  } catch (error) {
    console.error('Error saving user profile:', error)
    return { success: false, error: 'Failed to save profile' }
  }
}

export const canUpvote = async (userId: string, visitorId: string): Promise<boolean> => {
  try {
    const result = await canUpvoteInSupabase(userId, visitorId)
    if (result.success) {
      return result.canUpvote ?? true
    }
    return true
  } catch (error) {
    console.error('Error checking upvote status:', error)
    return true
  }
}

export const addUpvote = async (userId: string, visitorId: string) => {
  try {
    await saveUpvoteToSupabase(userId, visitorId)
  } catch (error) {
    console.error('Error adding upvote:', error)
  }
}

export const incrementViewCount = async (userId: string) => {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, cannot increment view count')
      return
    }

    // Get current date
    const today = getTodayDate()

    // First, try to get existing daily view count
    const { data: dailyViewData, error: dailyViewError } = await supabase
      .from('daily_views')
      .select('count')
      .eq('user_id', userId)
      .eq('date', today)
      .single()

    // If there's an error (likely because no record exists), we'll create a new one
    let newCount = 1
    if (dailyViewData) {
      newCount = dailyViewData.count + 1
    }

    // Update or insert daily view count
    const { error: dailyViewUpdateError } = await supabase
      .from('daily_views')
      .upsert({
        user_id: userId,
        date: today,
        count: newCount
      }, {
        onConflict: 'user_id,date'
      })

    if (dailyViewUpdateError) {
      console.error('Error updating daily view count:', dailyViewUpdateError)
      return
    }

    // Also update the total view count in the profiles table
    const { error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        views: supabase.rpc('increment_view_count', { user_id: userId })
      })
      .eq('id', userId)

    if (profileUpdateError) {
      console.error('Error updating profile view count:', profileUpdateError)
      // Try alternative approach - fetch current views and increment
      const { data: profileData, error: profileFetchError } = await supabase
        .from('profiles')
        .select('views')
        .eq('id', userId)
        .single()

      if (profileData && !profileFetchError) {
        const { error: altUpdateError } = await supabase
          .from('profiles')
          .update({ views: profileData.views + 1 })
          .eq('id', userId)

        if (altUpdateError) {
          console.error('Error updating profile view count (alternative):', altUpdateError)
        }
      }
    }
  } catch (error) {
    console.error('Error incrementing view count:', error)
  }
}

export const getLeaderboard = async (sortBy: "today" | "yesterday" | "all-time" | "newcomers"): Promise<LeaderboardEntry[]> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return an empty array
    return []
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
}

export const addFollower = async (userId: string, followerId: string): Promise<boolean> => {
  try {
    const result = await saveUserFollowerToSupabase(userId, followerId)
    return result.success
  } catch (error) {
    console.error('Error adding follower:', error)
    return false
  }
}

export const removeFollower = async (userId: string, followerId: string): Promise<boolean> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return true
    return true
  } catch (error) {
    console.error('Error removing follower:', error)
    return false
  }
}

export const unlockAchievement = async (userId: string, achievementId: string): Promise<boolean> => {
  try {
    const result = await saveUserAchievementToSupabase(userId, achievementId)
    return result.success
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    return false
  }
}

export const addXP = async (userId: string, amount: number): Promise<void> => {
  try {
    const today = getTodayDate()
    await saveUserDailyStatsToSupabase(userId, today, amount)
  } catch (error) {
    console.error('Error adding XP:', error)
  }
}

export const addProject = async (userId: string, project: Project) => {
  try {
    // Import the helper function here to avoid circular dependencies
    const { addProjectToSupabase } = await import('@/lib/projectHelpers')
    const result = await addProjectToSupabase(userId, project)
    return result
  } catch (error) {
    console.error('Error adding project:', error)
    return { success: false, error: 'Failed to add project' }
  }
}

export const updateProject = async (userId: string, project: Project) => {
  try {
    // Import the helper function here to avoid circular dependencies
    const { updateProjectInSupabase } = await import('@/lib/projectHelpers')
    const result = await updateProjectInSupabase(userId, project)
    return result
  } catch (error) {
    console.error('Error updating project:', error)
    return { success: false, error: 'Failed to update project' }
  }
}

export const deleteProject = async (userId: string, projectId: string) => {
  try {
    // Import the helper function here to avoid circular dependencies
    const { deleteProjectFromSupabase } = await import('@/lib/projectHelpers')
    const result = await deleteProjectFromSupabase(userId, projectId)
    return result
  } catch (error) {
    console.error('Error deleting project:', error)
    return { success: false, error: 'Failed to delete project' }
  }
}

export const addProjectUpvote = async (projectId: string, userId: string) => {
  try {
    // Import the helper function here to avoid circular dependencies
    const { addProjectUpvoteToSupabase } = await import('@/lib/projectHelpers')
    const result = await addProjectUpvoteToSupabase(projectId, userId)
    return result
  } catch (error) {
    console.error('Error adding project upvote:', error)
    return { success: false, error: 'Failed to add project upvote' }
  }
}

export const incrementProjectViews = async (projectId: string) => {
  try {
    // Import the helper function here to avoid circular dependencies
    const { incrementProjectViewsInSupabase } = await import('@/lib/projectHelpers')
    const result = await incrementProjectViewsInSupabase(projectId)
    return result
  } catch (error) {
    console.error('Error incrementing project views:', error)
    return { success: false, error: 'Failed to increment project views' }
  }
}

export const getAchievements = (): Achievement[] => {
  return [
    { id: "builder", name: "Builder", description: "Create your first project", icon: "🏗️" },
    { id: "consistent", name: "Consistent", description: "Maintain a 5-day streak", icon: "🔥" },
    { id: "top10", name: "Top 10", description: "Reach top 10 on leaderboard", icon: "🏆" },
    { id: "popular", name: "Popular", description: "Get 100 views", icon: "👥" },
    { id: "influencer", name: "Influencer", description: "Get 10 followers", icon: "⭐" },
    { id: "level5", name: "Level 5", description: "Reach level 5", icon: "📈" },
    { id: "referrer", name: "Referrer", description: "Refer 5 friends", icon: "🎁" },
  ]
}

export const calculateScore = (
  user: UserProfile,
  timeframe: "today" | "yesterday" | "all-time" | "newcomers" = "all-time",
): number => {
  let views = user.views
  let upvotes = user.upvotes
  const streak = user.streak
  const projectCount = user.projects.length

  if (timeframe === "today") {
    const today = getTodayDate()
    views = user.dailyViews.find((d) => d.date === today)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === today)?.count || 0
  } else if (timeframe === "yesterday") {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    views = user.dailyViews.find((d) => d.date === yesterday)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === yesterday)?.count || 0
  }

  const score = upvotes * 40 + views * 30 + streak * 20 + projectCount * 10
  return score
}

const normalizeScores = (scores: number[]): number[] => {
  if (scores.length === 0) return []
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min

  if (range === 0) {
    return scores.map(() => 0.5)
  }

  return scores.map((score) => (score - min) / range)
}

export const updateStreaks = async () => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll do nothing
  } catch (error) {
    console.error('Error updating streaks:', error)
  }
}

export const completeDailyChallenge = async (userId: string): Promise<boolean> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return false
    return false
  } catch (error) {
    console.error('Error completing daily challenge:', error)
    return false
  }
}

export const generateBadges = (user: UserProfile): string[] => {
  const badges: string[] = []

  // Tier badges based on upvotes
  if (user.upvotes >= 10) badges.push("Bronze")
  if (user.upvotes >= 50) badges.push("Silver")
  if (user.upvotes >= 200) badges.push("Gold")
  if (user.upvotes >= 10000) badges.push("Diamond")

  // View-based badges
  if (user.views >= 100) badges.push("Popular")
  if (user.views >= 500) badges.push("Trending")
  if (user.views >= 2000) badges.push("Viral")

  // Streak-based badges
  if (user.streak >= 3) badges.push("Consistent")
  if (user.streak >= 7) badges.push("Dedicated")
  if (user.streak >= 30) badges.push("Unstoppable")

  // Project-based badges
  if (user.projects.length >= 3) badges.push("Builder")
  if (user.projects.length >= 10) badges.push("Prolific")

  // New badges
  if (user.firstUpvoteReceived) badges.push("First Blood")
  if (user.links.length >= 5) {
    badges.push("Link Master")
    user.linkMasterUnlocked = true
  }
  if (user.earlyAdopter) badges.push("Early Adopter")
  if (user.featuredCount >= 3) badges.push("Hall of Famer")
  if (user.creativeUnlocked) badges.push("Creative")
  if (user.social && Object.values(user.social).filter(Boolean).length >= 4) {
    badges.push("Connected")
    user.connectedUnlocked = true
  }
  if (user.quickRiseUnlocked) badges.push("Quick Rise")
  if (user.hotStreakUnlocked) badges.push("Hot Streak")
  if (user.rareBadges && user.rareBadges.length > 0) {
    badges.push("Rare")
  }

  return [...new Set(badges)]
}

export const generateUserId = (): string => {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

export const getFeaturedBuilders = async (): Promise<UserProfile[]> => {
  try {
    // This would need to be implemented with proper Supabase integration
    // For now, we'll return an empty array
    return []
  } catch (error) {
    console.error('Error fetching featured builders:', error)
    return []
  }
}

export const getUserAnalytics = async (userId: string) => {
  try {
    // For now, we'll return a mock analytics object
    // In a real implementation, this would fetch from Supabase
    const user = await getCurrentUser()
    if (!user) return null

    // Mock analytics data - in a real implementation, this would come from Supabase
    const analyticsData: AnalyticsData = {
      totalViews: user.views || 0,
      totalUpvotes: user.upvotes || 0,
      weeklyViews: user.dailyViews.slice(-7).reduce((sum, day) => sum + (day.count || 0), 0),
      weeklyUpvotes: user.dailyUpvotes.slice(-7).reduce((sum, day) => sum + (day.count || 0), 0),
      streak: user.streak || 0,
      badges: user.badges || [],
      dailyData: user.dailyViews.slice(-30).map((viewDay, index) => {
        const upvoteDay = user.dailyUpvotes.find(d => d.date === viewDay.date) || { date: viewDay.date, count: 0 }
        return {
          date: viewDay.date,
          views: viewDay.count || 0,
          upvotes: upvoteDay.count || 0
        }
      }),
      projectStats: user.projects.map(project => ({
        projectId: project.id,
        title: project.title,
        views: project.views || 0,
        upvotes: project.upvotes || 0,
        ctr: project.views ? Math.round((project.upvotes / project.views) * 100) : 0
      })),
      // New analytics metrics
      engagementRate: user.views ? Math.round((user.upvotes / user.views) * 100) : 0,
      growthRate: 15.5, // Mock data
      rankHistory: [
        { date: "2023-05-01", rank: 45 },
        { date: "2023-05-08", rank: 38 },
        { date: "2023-05-15", rank: 29 },
        { date: "2023-05-22", rank: 22 },
        { date: "2023-05-29", rank: 18 },
        { date: "2023-06-05", rank: 12 },
        { date: "2023-06-12", rank: 8 },
      ],
      visitorRetention: 68, // Mock data
      peakTimes: [
        { hour: 9, views: 42 },
        { hour: 12, views: 38 },
        { hour: 15, views: 56 },
        { hour: 18, views: 72 },
        { hour: 21, views: 65 },
      ],
      referralSources: [
        { source: "Direct", count: 120 },
        { source: "Social Media", count: 85 },
        { source: "Search", count: 42 },
        { source: "Referral", count: 28 },
      ],
      bestPerformingDay: "Wednesday",
      peakHour: "6 PM",
      averageSession: "2m 34s"
    }

    return analyticsData
  } catch (error) {
    console.error('Error fetching user analytics:', error)
    return null
  }
}

export const resetAllData = async () => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll do nothing
}

export const clearLocalAppData = () => {
  try {
    currentUserCache = null
    currentUserCacheTime = 0
    currentUserId = null
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('rigeo_current_user_id')
    }
  } catch {}
}

export const getStorageSchema = async () => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll return null
  return null
}

export const incrementMapClicks = async (userId: string) => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll do nothing
}

export const updateUserLocation = async (
  userId: string,
  location: { lat: number; lng: number; city: string; country: string },
): Promise<boolean> => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll return false
  return false
}

export const getDisplayUsers = async (): Promise<UserProfile[]> => {
  try {
    const users = await getAllUsers()
    return users
  } catch (error) {
    console.error('Error fetching display users:', error)
    return []
  }
}

export const isUserLoggedIn = (): boolean => {
  // This would need to be implemented with proper auth integration
  // For now, we'll return false
  return false
}

export const useStreakFreeze = async (userId: string): Promise<boolean> => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll return false
  return false
}

export const addStreakFreeze = async (userId: string): Promise<void> => {
  // This would need to be implemented with proper Supabase integration
  // For now, we'll do nothing
}