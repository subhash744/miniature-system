export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  requirement: string
  progress?: number
  target?: number
  unlocked: boolean
}

export const getAllBadges = (): Badge[] => {
  return [
    // Existing badges (keep these)
    {
      id: "bronze",
      name: "Bronze",
      description: "Get 10 upvotes",
      icon: "🥉",
      rarity: "common",
      requirement: "10 upvotes",
      target: 10,
      unlocked: false
    },
    {
      id: "silver",
      name: "Silver",
      description: "Get 50 upvotes",
      icon: "🥈",
      rarity: "common",
      requirement: "50 upvotes",
      target: 50,
      unlocked: false
    },
    {
      id: "gold",
      name: "Gold",
      description: "Get 200 upvotes",
      icon: "🥇",
      rarity: "rare",
      requirement: "200 upvotes",
      target: 200,
      unlocked: false
    },
    {
      id: "diamond",
      name: "Diamond",
      description: "Get 10,000 upvotes",
      icon: "💎",
      rarity: "legendary",
      requirement: "10,000 upvotes",
      target: 10000,
      unlocked: false
    },
    {
      id: "popular",
      name: "Popular",
      description: "Get 100 views",
      icon: "👥",
      rarity: "common",
      requirement: "100 views",
      target: 100,
      unlocked: false
    },
    {
      id: "trending",
      name: "Trending",
      description: "Get 500 views",
      icon: "📈",
      rarity: "rare",
      requirement: "500 views",
      target: 500,
      unlocked: false
    },
    {
      id: "viral",
      name: "Viral",
      description: "Get 2,000 views",
      icon: "🔥",
      rarity: "epic",
      requirement: "2,000 views",
      target: 2000,
      unlocked: false
    },
    {
      id: "consistent",
      name: "Consistent",
      description: "Maintain a 3-day streak",
      icon: "🔥",
      rarity: "common",
      requirement: "3-day streak",
      target: 3,
      unlocked: false
    },
    {
      id: "dedicated",
      name: "Dedicated",
      description: "Maintain a 7-day streak",
      icon: "🔥🔥",
      rarity: "rare",
      requirement: "7-day streak",
      target: 7,
      unlocked: false
    },
    {
      id: "unstoppable",
      name: "Unstoppable",
      description: "Maintain a 30-day streak",
      icon: "🔥🔥🔥",
      rarity: "epic",
      requirement: "30-day streak",
      target: 30,
      unlocked: false
    },
    {
      id: "builder",
      name: "Builder",
      description: "Add 3 projects",
      icon: "🏗️",
      rarity: "common",
      requirement: "3 projects",
      target: 3,
      unlocked: false
    },
    {
      id: "prolific",
      name: "Prolific",
      description: "Add 10 projects",
      icon: "📁",
      rarity: "rare",
      requirement: "10 projects",
      target: 10,
      unlocked: false
    },
    
    // New badges
    {
      id: "first-blood",
      name: "First Blood",
      description: "Receive your first upvote",
      icon: "🎯",
      rarity: "common",
      requirement: "First upvote received",
      unlocked: false
    },
    {
      id: "link-master",
      name: "Link Master",
      description: "Add 5 or more links",
      icon: "🔗",
      rarity: "common",
      requirement: "5+ links added",
      target: 5,
      unlocked: false
    },
    {
      id: "early-adopter",
      name: "Early Adopter",
      description: "Joined in first 100 users",
      icon: "🌅",
      rarity: "rare",
      requirement: "Joined in first 100 users",
      unlocked: false
    },
    {
      id: "hall-of-famer",
      name: "Hall of Famer",
      description: "Featured 3 times",
      icon: "👑",
      rarity: "epic",
      requirement: "Featured 3 times",
      target: 3,
      unlocked: false
    },
    {
      id: "creative",
      name: "Creative",
      description: "Added project with banner",
      icon: "🎨",
      rarity: "common",
      requirement: "Project with banner",
      unlocked: false
    },
    {
      id: "connected",
      name: "Connected",
      description: "All 4 social links added",
      icon: "📱",
      rarity: "common",
      requirement: "All 4 social links",
      target: 4,
      unlocked: false
    },
    {
      id: "quick-rise",
      name: "Quick Rise",
      description: "Gained 10 ranks in 24 hours",
      icon: "⚡",
      rarity: "rare",
      requirement: "10 rank gain in 24h",
      unlocked: false
    },
    {
      id: "hot-streak",
      name: "Hot Streak",
      description: "3 consecutive days in Top 10",
      icon: "🔥",
      rarity: "epic",
      requirement: "3 days Top 10",
      target: 3,
      unlocked: false
    },
    {
      id: "rare",
      name: "Rare",
      description: "Custom badge for special achievements",
      icon: "💎",
      rarity: "legendary",
      requirement: "Special achievement",
      unlocked: false
    },
    // Additional New Badges
    {
      id: "speed-demon",
      name: "Speed Demon",
      description: "Site loads in under 1 second",
      icon: "⚡",
      rarity: "rare",
      requirement: "Performance score 95+",
      unlocked: false
    },
    {
      id: "accessibility-champion",
      name: "Accessibility Champion",
      description: "Perfect accessibility score",
      icon: "♿",
      rarity: "epic",
      requirement: "100% accessibility",
      unlocked: false
    },
    {
      id: "seo-master",
      name: "SEO Master",
      description: "Perfect SEO optimization",
      icon: "🔍",
      rarity: "epic",
      requirement: "SEO score 100",
      unlocked: false
    },
    {
      id: "responsive-guru",
      name: "Responsive Guru",
      description: "Perfect on all devices",
      icon: "📱",
      rarity: "rare",
      requirement: "Mobile-friendly design",
      unlocked: false
    },
    {
      id: "visual-stability",
      name: "Visual Stability",
      description: "Zero layout shifts",
      icon: "🎯",
      rarity: "rare",
      requirement: "CLS score 0",
      unlocked: false
    },
    {
      id: "interaction-master",
      name: "Interaction Master",
      description: "Lightning-fast interactions",
      icon: "🖱️",
      rarity: "rare",
      requirement: "FID under 100ms",
      unlocked: false
    },
    {
      id: "core-vitals-expert",
      name: "Core Vitals Expert",
      description: "All Core Web Vitals passed",
      icon: "✅",
      rarity: "legendary",
      requirement: "Perfect Core Web Vitals",
      unlocked: false
    },
    {
      id: "trendsetter",
      name: "Trendsetter",
      description: "Featured on homepage 5 times",
      icon: "🌟",
      rarity: "epic",
      requirement: "5 homepage features",
      target: 5,
      unlocked: false
    },
    {
      id: "community-hero",
      name: "Community Hero",
      description: "Helped 50 other builders",
      icon: "🦸",
      rarity: "epic",
      requirement: "50 helpful actions",
      target: 50,
      unlocked: false
    },
    {
      id: "mentor",
      name: "Mentor",
      description: "Mentored 10 new users",
      icon: "👨‍🏫",
      rarity: "rare",
      requirement: "10 mentees",
      target: 10,
      unlocked: false
    },
    {
      id: "code-reviewer",
      name: "Code Reviewer",
      description: "Reviewed 100 projects",
      icon: "🔍",
      rarity: "rare",
      requirement: "100 reviews",
      target: 100,
      unlocked: false
    },
    {
      id: "bug-hunter",
      name: "Bug Hunter",
      description: "Found 25 bugs",
      icon: "🐛",
      rarity: "common",
      requirement: "25 bugs reported",
      target: 25,
      unlocked: false
    }
  ]
}

export const getBadgeProgress = (badgeId: string, user: any): { progress: number, target: number } => {
  switch (badgeId) {
    case "bronze":
      return { progress: user.upvotes || 0, target: 10 }
    case "silver":
      return { progress: user.upvotes || 0, target: 50 }
    case "gold":
      return { progress: user.upvotes || 0, target: 200 }
    case "diamond":
      return { progress: user.upvotes || 0, target: 10000 }
    case "popular":
      return { progress: user.views || 0, target: 100 }
    case "trending":
      return { progress: user.views || 0, target: 500 }
    case "viral":
      return { progress: user.views || 0, target: 2000 }
    case "consistent":
      return { progress: user.streak || 0, target: 3 }
    case "dedicated":
      return { progress: user.streak || 0, target: 7 }
    case "unstoppable":
      return { progress: user.streak || 0, target: 30 }
    case "builder":
      return { progress: (user.projects || []).length, target: 3 }
    case "prolific":
      return { progress: (user.projects || []).length, target: 10 }
    case "link-master":
      return { progress: (user.links || []).length, target: 5 }
    case "hall-of-famer":
      return { progress: user.featuredCount || 0, target: 3 }
    case "connected":
      const socialLinks = user.social || {}
      const connectedCount = Object.values(socialLinks).filter(Boolean).length
      return { progress: connectedCount, target: 4 }
    default:
      return { progress: 0, target: 0 }
  }
}

export const checkBadgeUnlocked = (badgeId: string, user: any): boolean => {
  const { progress, target } = getBadgeProgress(badgeId, user)
  
  switch (badgeId) {
    case "bronze":
      return user.upvotes >= 10
    case "silver":
      return user.upvotes >= 50
    case "gold":
      return user.upvotes >= 200
    case "diamond":
      return user.upvotes >= 10000
    case "popular":
      return user.views >= 100
    case "trending":
      return user.views >= 500
    case "viral":
      return user.views >= 2000
    case "consistent":
      return user.streak >= 3
    case "dedicated":
      return user.streak >= 7
    case "unstoppable":
      return user.streak >= 30
    case "builder":
      return (user.projects || []).length >= 3
    case "prolific":
      return (user.projects || []).length >= 10
    case "first-blood":
      return user.firstUpvoteReceived || user.upvotes > 0
    case "link-master":
      return (user.links || []).length >= 5
    case "early-adopter":
      return user.earlyAdopter || user.id.startsWith("user_") // Simplified check
    case "hall-of-famer":
      return (user.featuredCount || 0) >= 3
    case "creative":
      return user.creativeUnlocked || (user.projects || []).some((p: any) => p.bannerUrl)
    case "connected":
      const socialLinks = user.social || {}
      return Object.values(socialLinks).filter(Boolean).length >= 4
    case "quick-rise":
      return user.quickRiseUnlocked || false // Would need rank tracking
    case "hot-streak":
      return user.hotStreakUnlocked || false // Would need top 10 tracking
    case "rare":
      return user.rareBadges && user.rareBadges.length > 0
    default:
      return false
  }
}

export const getUserBadges = (user: any): Badge[] => {
  const allBadges = getAllBadges()
  return allBadges.map(badge => {
    const unlocked = checkBadgeUnlocked(badge.id, user)
    const { progress, target } = getBadgeProgress(badge.id, user)
    
    return {
      ...badge,
      progress,
      target,
      unlocked
    }
  })
}