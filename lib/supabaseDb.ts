import { supabase } from '@/lib/supabaseClient'
import { UserProfile, LeaderboardEntry } from '@/lib/storage'

/**
 * Safely convert a date value to ISO string
 * @param dateValue The date value to convert
 * @returns ISO string or null if invalid
 */
function safeToISOString(dateValue: any): string | null {
  if (!dateValue) return null;
  
  try {
    const date = new Date(dateValue);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString();
  } catch (error) {
    console.warn('Error converting date to ISO string:', dateValue, error);
    return null;
  }
}

/**
 * Saves user profile data to Supabase
 * @param profile The user profile to save
 * @returns Promise with the result of the operation
 */
export async function saveProfileToSupabase(profile: UserProfile) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping profile save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    // Prepare the profile data for Supabase
    // We need to flatten the data structure since Supabase tables don't support nested objects well
    const profileData = {
      id: profile.id,
      username: profile.username,
      display_name: profile.displayName,
      quote: profile.quote || null,
      bio: profile.bio,
      avatar: profile.avatar,
      social_x: profile.social?.x || null,
      social_github: profile.social?.github || null,
      social_website: profile.social?.website || null,
      social_linkedin: profile.social?.linkedin || null,
      views: profile.views,
      upvotes: profile.upvotes,
      rank: profile.rank,
      created_at: safeToISOString(profile.createdAt),
      streak: profile.streak,
      last_active_date: safeToISOString(profile.lastActiveDate),
      last_seen_date: profile.lastSeenDate,
      schema_version: profile.schemaVersion,
      lat: profile.location?.lat || null,
      lng: profile.location?.lng || null,
      city: profile.location?.city || null,
      country: profile.location?.country || null,
      map_clicks: profile.metrics?.mapClicks || 0,
      xp: profile.xp,
      level: profile.level,
      referral_code: profile.referralCode,
      referral_count: profile.referralCount,
      hide_location: profile.hideLocation,
      theme_preference: profile.themePreference,
      followers_count: profile.followers?.length || 0,
      following_count: profile.following?.length || 0,
      projects_count: profile.projects?.length || 0,
      links_count: profile.links?.length || 0,
      achievements_count: profile.achievements?.length || 0,
      badges_count: profile.badges?.length || 0,
      // Flags for unlocked achievements
      early_adopter: profile.earlyAdopter || false,
      hall_of_famer: profile.hallOfFamer || false,
      creative_unlocked: profile.creativeUnlocked || false,
      connected_unlocked: profile.connectedUnlocked || false,
      streak_freezes: profile.streakFreezes || 0,
    }

    // Save to profiles table
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error saving profile to Supabase:', error)
      return { success: false, error: error.message }
    }

    // Save links separately in a links table
    if (profile.links && profile.links.length > 0) {
      const linksData = profile.links.map((link, index) => ({
        profile_id: profile.id,
        title: link.title,
        url: link.url,
        order_index: index
      }))

      const { error: linksError } = await supabase
        .from('profile_links')
        .upsert(linksData, {
          onConflict: 'profile_id,order_index'
        })

      if (linksError) {
        console.error('Error saving profile links to Supabase:', linksError)
        // Don't return error here as the main profile was saved successfully
      }
    }

    // Save projects separately in a projects table
    if (profile.projects && profile.projects.length > 0) {
      const projectsData = profile.projects.map(project => ({
        id: project.id,
        profile_id: profile.id,
        title: project.title,
        description: project.description,
        banner_url: project.bannerUrl || null,
        link: project.link || null,
        upvotes: project.upvotes,
        views: project.views,
        created_at: safeToISOString(project.createdAt)
      }))

      const { error: projectsError } = await supabase
        .from('projects')
        .upsert(projectsData, {
          onConflict: 'id'
        })

      if (projectsError) {
        console.error('Error saving projects to Supabase:', projectsError)
        // Don't return error here as the main profile was saved successfully
      }
    }

    // Save badges separately in a badges table
    if (profile.badges && profile.badges.length > 0) {
      const badgesData = profile.badges.map((badge, index) => ({
        profile_id: profile.id,
        name: badge,
        awarded_at: new Date().toISOString(),
        order_index: index
      }))

      const { error: badgesError } = await supabase
        .from('profile_badges')
        .upsert(badgesData, {
          onConflict: 'profile_id,name'
        })

      if (badgesError) {
        console.error('Error saving badges to Supabase:', badgesError)
        // Don't return error here as the main profile was saved successfully
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving profile to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Gets user profile data from Supabase
 * @param userId The user ID to fetch
 * @returns Promise with the user profile data
 */
export async function getProfileFromSupabase(userId: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, cannot fetch profile from Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error) {
      console.error('Error fetching profile from Supabase:', error)
      return { success: false, error: error.message }
    }

    // No record found – treat as not found instead of error
    if (!data) {
      return { success: false, error: 'not_found' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error fetching profile from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Gets all user profiles from Supabase
 * @returns Promise with the user profiles data
 */
export async function getAllProfilesFromSupabase() {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, cannot fetch profiles from Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')

    if (error) {
      console.error('Error fetching profiles from Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error fetching profiles from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves leaderboard entry to Supabase
 * @param entry The leaderboard entry to save
 * @param sortBy The sorting criteria
 * @returns Promise with the result of the operation
 */
export async function saveLeaderboardEntryToSupabase(entry: LeaderboardEntry, sortBy: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping leaderboard entry save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const leaderboardData = {
      user_id: entry.userId,
      username: entry.username,
      display_name: entry.displayName,
      avatar: entry.avatar,
      rank: entry.rank,
      score: entry.score,
      views: entry.views,
      upvotes: entry.upvotes,
      streak: entry.streak,
      project_count: entry.projectCount,
      badges: entry.badges,
      sort_by: sortBy
    }

    const { data, error } = await supabase
      .from('leaderboard_entries')
      .upsert(leaderboardData, {
        onConflict: 'user_id,sort_by'
      })

    if (error) {
      console.error('Error saving leaderboard entry to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving leaderboard entry to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves upvote data to Supabase
 * @param userId The user ID who received the upvote
 * @param voterId The ID of the voter
 * @returns Promise with the result of the operation
 */
export async function saveUpvoteToSupabase(userId: string, voterId: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping upvote save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const upvoteData = {
      user_id: userId,
      voter_id: voterId
    }

    const { data, error } = await supabase
      .from('upvotes')
      .insert(upvoteData)

    if (error) {
      console.error('Error saving upvote to Supabase:', error)
      return { success: false, error: error.message }
    }

    // Also increment profiles.upvotes atomically
    const { error: incError } = await supabase
      .from('profiles')
      .update({ upvotes: (supabase as any).rpc ? undefined : undefined })
      .eq('id', userId)

    if (incError) {
      // Fallback: fetch and set incremented value
      const { data: prof, error: fetchErr } = await supabase
        .from('profiles')
        .select('upvotes')
        .eq('id', userId)
        .single()
      if (!fetchErr && prof) {
        await supabase.from('profiles').update({ upvotes: (prof.upvotes || 0) + 1 }).eq('id', userId)
      }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving upvote to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Checks if a user can upvote another user
 * @param userId The user ID to check
 * @param voterId The ID of the potential voter
 * @returns Promise with the result of the operation
 */
export async function canUpvoteInSupabase(userId: string, voterId: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, cannot check upvote status in Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
      .from('upvotes')
      .select('id')
      .eq('user_id', userId)
      .eq('voter_id', voterId)
      .maybeSingle()

    if (error) {
      console.error('Error checking upvote status in Supabase:', error)
      return { success: false, error: error.message }
    }

    // If data is null, it means no upvote exists, so user can upvote
    return { success: true, canUpvote: !data }
  } catch (error) {
    console.error('Unexpected error checking upvote status in Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Gets upvotes for a user from Supabase
 * @param userId The user ID to fetch upvotes for
 * @returns Promise with the upvotes data
 */
export async function getUpvotesForUserFromSupabase(userId: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, cannot fetch upvotes from Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
      .from('upvotes')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching upvotes from Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error fetching upvotes from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves daily stats to Supabase
 * @param userId The user ID
 * @param date The date in YYYY-MM-DD format
 * @param views The number of views
 * @param upvotes The number of upvotes
 * @param xp The XP gained
 * @returns Promise with the result of the operation
 */
export async function saveDailyStatsToSupabase(
  userId: string,
  date: string,
  views: number,
  upvotes: number,
  xp: number
) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping daily stats save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const statsData = {
      user_id: userId,
      date: date,
      views: views,
      upvotes: upvotes,
      xp: xp
    }

    const { data, error } = await supabase
      .from('daily_stats')
      .upsert(statsData, {
        onConflict: 'user_id,date'
      })

    if (error) {
      console.error('Error saving daily stats to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving daily stats to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Gets daily stats from Supabase
 * @param userId The user ID to fetch stats for
 * @param date The date to fetch stats for
 * @returns Promise with the daily stats data
 */
export async function getDailyStatsFromSupabase(userId: string, date: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, cannot fetch daily stats from Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const { data, error } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .single()

    if (error) {
      console.error('Error fetching daily stats from Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error fetching daily stats from Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Updates hall of fame status in Supabase
 * @param userId The user ID
 * @param featuredCount The number of times featured
 * @param isHallOfFamer Whether the user is a hall of famer
 * @returns Promise with the result of the operation
 */
export async function updateHallOfFameInSupabase(
  userId: string,
  featuredCount: number,
  isHallOfFamer: boolean
) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping hall of fame update in Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const hallOfFameData = {
      user_id: userId,
      featured_count: featuredCount,
      hall_of_famer: isHallOfFamer,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('hall_of_fame')
      .upsert(hallOfFameData, {
        onConflict: 'user_id'
      })

    if (error) {
      console.error('Error updating hall of fame in Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error updating hall of fame in Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves daily views data to Supabase
 * @param userId The user ID
 * @param date The date
 * @param count The view count
 * @returns Promise with the result of the operation
 */
export async function saveDailyViewsToSupabase(userId: string, date: string, count: number) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping daily views save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const dailyViewData = {
      user_id: userId,
      date: date,
      count: count
    }

    const { data, error } = await supabase
      .from('daily_views')
      .upsert(dailyViewData, {
        onConflict: 'user_id,date'
      })

    if (error) {
      console.error('Error saving daily views to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving daily views to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves daily upvotes data to Supabase
 * @param userId The user ID
 * @param date The date
 * @param count The upvote count
 * @returns Promise with the result of the operation
 */
export async function saveDailyUpvotesToSupabase(userId: string, date: string, count: number) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping daily upvotes save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const dailyUpvoteData = {
      user_id: userId,
      date: date,
      count: count
    }

    const { data, error } = await supabase
      .from('daily_upvotes')
      .upsert(dailyUpvoteData, {
        onConflict: 'user_id,date'
      })

    if (error) {
      console.error('Error saving daily upvotes to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving daily upvotes to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves user follower data to Supabase
 * @param userId The user ID
 * @param followerId The follower ID
 * @returns Promise with the result of the operation
 */
export async function saveUserFollowerToSupabase(userId: string, followerId: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping user follower save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const followerData = {
      user_id: userId,
      follower_id: followerId
    }

    const { data, error } = await supabase
      .from('user_followers')
      .insert(followerData)

    if (error) {
      console.error('Error saving user follower to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving user follower to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves user following data to Supabase
 * @param userId The user ID
 * @param followingId The following ID
 * @returns Promise with the result of the operation
 */
export async function saveUserFollowingToSupabase(userId: string, followingId: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping user following save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const followingData = {
      user_id: userId,
      following_id: followingId
    }

    const { data, error } = await supabase
      .from('user_following')
      .insert(followingData)

    if (error) {
      console.error('Error saving user following to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving user following to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves user achievement data to Supabase
 * @param userId The user ID
 * @param achievementId The achievement ID
 * @returns Promise with the result of the operation
 */
export async function saveUserAchievementToSupabase(userId: string, achievementId: string) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping user achievement save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const achievementData = {
      user_id: userId,
      achievement_id: achievementId
    }

    const { data, error } = await supabase
      .from('user_achievements')
      .insert(achievementData)

    if (error) {
      console.error('Error saving user achievement to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving user achievement to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}

/**
 * Saves user daily stats data to Supabase
 * @param userId The user ID
 * @param date The date
 * @param xp The XP value
 * @returns Promise with the result of the operation
 */
export async function saveUserDailyStatsToSupabase(userId: string, date: string, xp: number) {
  try {
    // Check if supabase is configured
    if (!supabase) {
      console.warn('Supabase not configured, skipping user daily stats save to Supabase')
      return { success: false, error: 'Supabase not configured' }
    }

    const dailyStatsData = {
      user_id: userId,
      date: date,
      xp: xp
    }

    const { data, error } = await supabase
      .from('user_daily_stats')
      .upsert(dailyStatsData, {
        onConflict: 'user_id,date'
      })

    if (error) {
      console.error('Error saving user daily stats to Supabase:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Unexpected error saving user daily stats to Supabase:', error)
    return { success: false, error: 'Unexpected error occurred' }
  }
}
