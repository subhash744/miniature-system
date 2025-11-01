import { supabase } from '@/lib/supabaseClient'
import { UserProfile } from '@/lib/storage'

/**
 * Calculate user score based on weighted algorithm
 * @param user The user profile
 * @param timeframe The timeframe to calculate score for
 * @returns The calculated score
 */
export function calculateUserScore(user: UserProfile, timeframe: "today" | "yesterday" | "all-time" | "newcomers" = "all-time"): number {
  let views = user.views
  let upvotes = user.upvotes
  const streak = user.streak
  const projectCount = user.projects.length

  if (timeframe === "today") {
    const today = new Date().toISOString().split("T")[0]
    views = user.dailyViews.find((d) => d.date === today)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === today)?.count || 0
  } else if (timeframe === "yesterday") {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    views = user.dailyViews.find((d) => d.date === yesterday)?.count || 0
    upvotes = user.dailyUpvotes.find((d) => d.date === yesterday)?.count || 0
  }

  // Weighted scoring algorithm
  const score = upvotes * 40 + views * 30 + streak * 20 + projectCount * 10
  return score
}

/**
 * Normalize scores to a 0-1 range
 * @param scores Array of scores to normalize
 * @returns Normalized scores
 */
export function normalizeScores(scores: number[]): number[] {
  if (scores.length === 0) return []
  const min = Math.min(...scores)
  const max = Math.max(...scores)
  const range = max - min

  if (range === 0) {
    return scores.map(() => 0.5)
  }

  return scores.map((score) => (score - min) / range)
}

/**
 * Get leaderboard data from Supabase
 * @param sortBy Timeframe to sort by
 * @param limit Number of entries to return
 * @returns Promise with leaderboard entries
 */
export async function getLeaderboardFromSupabase(
  sortBy: "today" | "yesterday" | "all-time" | "newcomers" = "all-time",
  limit: number = 100
) {
  try {
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return { success: false, error: profilesError.message }
    }

    // Calculate scores for each profile
    const scoredProfiles = profiles.map((profile: any) => {
      const userProfile: UserProfile = {
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
        projects: [], // We'll fetch projects separately if needed
        links: [], // We'll fetch links separately if needed
        interests: [], // We'll fetch interests separately if needed
        dailyViews: [], // We'll fetch daily views separately if needed
        dailyUpvotes: [], // We'll fetch daily upvotes separately if needed
        badges: [], // We'll fetch badges separately if needed
        location: profile.lat && profile.lng ? {
          lat: profile.lat,
          lng: profile.lng,
          city: profile.city,
          country: profile.country
        } : undefined,
        metrics: {
          mapClicks: profile.map_clicks
        },
        xp: profile.xp,
        level: profile.level,
        referralCode: profile.referral_code,
        referralCount: profile.referral_count,
        hideLocation: profile.hide_location,
        themePreference: profile.theme_preference,
        dailyStats: [], // We'll fetch daily stats separately if needed
        achievements: [], // We'll fetch achievements separately if needed
        streakFreezes: profile.streak_freezes,
        featuredCount: profile.featured_count,
        firstUpvoteReceived: profile.first_upvote_received,
        linkMasterUnlocked: profile.link_master_unlocked,
        earlyAdopter: profile.early_adopter,
        hallOfFamer: profile.hall_of_famer,
        creativeUnlocked: profile.creative_unlocked,
        connectedUnlocked: profile.connected_unlocked,
        quickRiseUnlocked: profile.quick_rise_unlocked,
        hotStreakUnlocked: profile.hot_streak_unlocked,
        rareBadges: [], // We'll fetch rare badges separately if needed
        followers: [], // Add missing property
        following: [], // Add missing property
        goal: undefined, // Add missing property
        dailyChallenge: undefined // Add missing property
      }

      return {
        ...profile,
        score: calculateUserScore(userProfile, sortBy),
        projectCount: profile.projects_count,
        badgeCount: profile.badges_count
      }
    })

    // Sort by score (highest first)
    scoredProfiles.sort((a: any, b: any) => b.score - a.score)

    // Take only the requested limit
    const limitedProfiles = scoredProfiles.slice(0, limit)

    // Assign ranks
    const leaderboardEntries = limitedProfiles.map((profile: any, index: number) => ({
      userId: profile.id,
      username: profile.username,
      displayName: profile.display_name,
      avatar: profile.avatar,
      rank: index + 1,
      score: Math.round(profile.score),
      views: profile.views,
      upvotes: profile.upvotes,
      streak: profile.streak,
      badges: [], // We'll fetch badges separately if needed
      projectCount: profile.projectCount
    }))

    return { success: true, data: leaderboardEntries }
  } catch (error) {
    console.error('Unexpected error fetching leaderboard:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Get featured builders from Supabase
 * @param count Number of featured builders to return
 * @returns Promise with featured builders
 */
export async function getFeaturedBuildersFromSupabase(count: number = 3) {
  try {
    // Get today's date as a deterministic seed
    const today = new Date().toISOString().split('T')[0]
    const seed = today.split('-').reduce((acc, part) => acc + parseInt(part), 0)
    
    // Fetch all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('Error fetching profiles for featured builders:', profilesError)
      return { success: false, error: profilesError.message }
    }

    // Deterministically select featured builders based on date
    const featuredBuilders = []
    const profileCount = profiles.length
    
    if (profileCount > 0) {
      // Use seed to deterministically select profiles
      for (let i = 0; i < count && i < profileCount; i++) {
        const index = (seed + i) % profileCount
        const profile = profiles[index]
        
        featuredBuilders.push({
          id: profile.id,
          username: profile.username,
          displayName: profile.display_name,
          avatar: profile.avatar,
          bio: profile.bio,
          views: profile.views,
          upvotes: profile.upvotes,
          badges: [], // We'll fetch badges separately if needed
          location: profile.lat && profile.lng ? {
            lat: profile.lat,
            lng: profile.lng,
            city: profile.city,
            country: profile.country
          } : undefined
        })
      }
    }

    return { success: true, data: featuredBuilders }
  } catch (error) {
    console.error('Unexpected error fetching featured builders:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Refresh leaderboard entries in Supabase
 * @returns Promise with refresh result
 */
export async function refreshLeaderboardInSupabase() {
  try {
    // This would be called by a scheduled function or manually
    // For now, we'll just log that it should be implemented
    console.log('Leaderboard refresh triggered')
    return { success: true }
  } catch (error) {
    console.error('Error refreshing leaderboard:', error)
    return { success: false, error: 'Failed to refresh leaderboard' }
  }
}