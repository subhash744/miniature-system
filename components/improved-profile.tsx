"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  getAllUsers, 
  getCurrentUser, 
  incrementViewCount, 
  getUserAnalytics,
  AnalyticsData
} from "@/lib/storage"
import { getUserProjectsFromSupabase } from "@/lib/projectHelpers"
import UpvoteButton from "@/components/upvote-button"
import ProjectCard from "@/components/project-card"
import ProjectForm from "@/components/project-form"
import { 
  Github, 
  Linkedin, 
  Globe, 
  Twitter, 
  Edit2, 
  Share2, 
  ExternalLink,
  Mail,
  Dribbble,
  Trash2
} from "lucide-react"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

interface UserProfile {
  id: string
  username: string
  displayName: string
  quote?: string
  bio: string
  avatar: string
  social: {
    x?: string
    github?: string
    website?: string
    linkedin?: string
  }
  goal?: {
    title: string
    description: string
    progressPercent: number
  }
  projects: any[]
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
}

const badgeColors: Record<string, string> = {
  Bronze: "bg-amber-700",
  Silver: "bg-gray-400",
  Gold: "bg-yellow-500",
  Diamond: "bg-blue-400",
  Popular: "bg-pink-500",
  Trending: "bg-red-500",
  Viral: "bg-purple-500",
  Consistent: "bg-green-500",
  Dedicated: "bg-indigo-500",
  Unstoppable: "bg-orange-500",
  Builder: "bg-cyan-500",
  Prolific: "bg-violet-500",
}

const getPlatformIcon = (url: string) => {
  if (url.includes("github")) return <Github className="w-5 h-5" />
  if (url.includes("twitter") || url.includes("x.com")) return <Twitter className="w-5 h-5" />
  if (url.includes("linkedin")) return <Linkedin className="w-5 h-5" />
  if (url.includes("dribbble")) return <Dribbble className="w-5 h-5" />
  if (url.includes("mailto:")) return <Mail className="w-5 h-5" />
  return <Globe className="w-5 h-5" />
}

export function ImprovedProfile({ userId }: { userId: string }) {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showProjectForm, setShowProjectForm] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [userProjects, setUserProjects] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setMounted(true)
      const current = await getCurrentUser()
      setCurrentUser(current)

      const allUsers = await getAllUsers()
      const user = allUsers.find((u: UserProfile) => u.id === userId)

      if (!user) {
        router.push("/leaderboard")
        return
      }

      setProfile(user as UserProfile)
      setIsOwnProfile(user.id === current?.id)

      if (user.id !== current?.id) {
        await incrementViewCount(userId)
      }
      
      // Get analytics for own profile
      if (user.id === current?.id) {
        const userAnalytics = await getUserAnalytics(userId)
        setAnalytics(userAnalytics)
      }
      
      // Fetch user projects from Supabase
      try {
        const projectsResult = await getUserProjectsFromSupabase(userId)
        if (projectsResult.success && projectsResult.data) {
          setUserProjects(projectsResult.data)
        }
      } catch (error) {
        console.error("Error fetching user projects:", error)
      }
    }
    
    fetchData()
  }, [userId, router])

  const handleDeleteProject = async (projectId: string) => {
    if (confirm("Delete this project?")) {
      // In a real implementation, we would call deleteProjectFromSupabase
      // For now, we'll just update the local state
      setUserProjects(prev => prev.filter((p: any) => p.id !== projectId))
    }
  }

  const handleProjectSaved = async () => {
    // Refresh projects after saving
    try {
      const projectsResult = await getUserProjectsFromSupabase(userId)
      if (projectsResult.success && projectsResult.data) {
        setUserProjects(projectsResult.data)
        setShowProjectForm(false)
        setEditingProject(null)
      }
    } catch (error) {
      console.error("Error refreshing user projects:", error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.displayName}'s Profile`,
        url: window.location.href,
      }).catch(() => {
        // Fallback to copy URL
        copyToClipboard()
      })
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { y: 0.5 }
    })
  }

  if (!mounted || !profile) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      {/* Hero Section */}
      <div className="bg-white border-b border-[#E0DEDB]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <img 
                src={profile.avatar || "/placeholder.svg"} 
                alt={profile.displayName} 
                className="w-32 h-32 rounded-full border-4 border-[#E0DEDB]"
              />
            </div>
            
            {/* Profile Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-semibold text-[#37322F]">{profile.displayName}</h1>
              <p className="text-lg text-[#605A57] mb-2">@{profile.username}</p>
              
              {profile.quote && (
                <p className="text-xl italic text-[#37322F] mb-4">"{profile.quote}"</p>
              )}
              
              {profile.bio && (
                <p className="text-[#605A57] mb-6">{profile.bio}</p>
              )}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-6">
                <UpvoteButton userId={userId} currentUpvotes={profile.upvotes} />
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E0DEDB] text-[#37322F] rounded-lg font-medium hover:bg-[#F7F5F3] transition"
                >
                  <Share2 size={18} />
                  Share
                </button>
                
                {isOwnProfile && (
                  <button
                    onClick={() => router.push("/profile-creation")}
                    className="flex items-center gap-2 px-4 py-2 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
                  >
                    <Edit2 size={18} />
                    Edit Profile
                  </button>
                )}
              </div>
              
              {/* Badges and Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {profile.badges.slice(0, 4).map((badge) => (
                    <span
                      key={badge}
                      className={`${badgeColors[badge] || "bg-gray-300"} text-white px-3 py-1 rounded-full text-sm font-medium`}
                      title={badge}
                    >
                      {badge}
                    </span>
                  ))}
                  {profile.badges.length > 4 && (
                    <span className="bg-[#37322F] text-white px-3 py-1 rounded-full text-sm font-medium">
                      +{profile.badges.length - 4}
                    </span>
                  )}
                </div>
                
                {/* Rank and Streak */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-[#605A57]">
                    Rank: <span className="font-semibold text-[#37322F]">#{profile.rank}</span>
                  </span>
                  <span className="text-[#605A57]">
                    🔥 Streak: <span className="font-semibold text-[#37322F]">{profile.streak} days</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Links and Analytics */}
          <div className="lg:col-span-1 space-y-8">
            {/* Links Section */}
            {profile.links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl border border-[#E0DEDB] overflow-hidden"
              >
                <div className="p-5 border-b border-[#E0DEDB]">
                  <h2 className="text-xl font-semibold text-[#37322F] flex items-center gap-2">
                    <span>My Links</span>
                    <span className="text-lg">🔗</span>
                  </h2>
                </div>
                <div className="p-2">
                  {profile.links.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 hover:bg-[#F7F5F3] transition group"
                    >
                      <div className="text-[#37322F]">
                        {getPlatformIcon(link.url)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#37322F] truncate">{link.title}</p>
                        <p className="text-sm text-[#605A57] truncate">{link.url.replace(/^https?:\/\//, '')}</p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#605A57] group-hover:text-[#37322F] transition" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analytics Section (Own Profile Only) */}
            {isOwnProfile && analytics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-xl border border-[#E0DEDB] overflow-hidden"
              >
                <div className="p-5 border-b border-[#E0DEDB]">
                  <h2 className="text-xl font-semibold text-[#37322F] flex items-center gap-2">
                    <span>Your Stats</span>
                    <span className="text-lg">📊</span>
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#F7F5F3] p-4 rounded-lg">
                      <p className="text-sm text-[#605A57]">Views This Week</p>
                      <p className="text-2xl font-semibold text-[#37322F]">{analytics.weeklyViews}</p>
                    </div>
                    <div className="bg-[#F7F5F3] p-4 rounded-lg">
                      <p className="text-sm text-[#605A57]">Total Upvotes</p>
                      <p className="text-2xl font-semibold text-[#37322F]">{analytics.totalUpvotes}</p>
                    </div>
                  </div>
                  
                  <div className="bg-[#F7F5F3] p-4 rounded-lg">
                    <p className="text-sm text-[#605A57]">Rank Change</p>
                    <p className="text-xl font-semibold text-green-600">↑ 3</p>
                  </div>
                  
                  <div className="bg-[#F7F5F3] p-4 rounded-lg">
                    <p className="text-sm text-[#605A57]">Best Day</p>
                    <p className="text-lg font-semibold text-[#37322F]">Monday</p>
                  </div>
                  
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full py-3 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
                  >
                    View Full Analytics →
                  </button>
                </div>
              </motion.div>
            )}

            {/* Social Connections */}
            {(profile.social.x || profile.social.github || profile.social.linkedin || profile.social.website) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl border border-[#E0DEDB] overflow-hidden"
              >
                <div className="p-5 border-b border-[#E0DEDB]">
                  <h2 className="text-xl font-semibold text-[#37322F] flex items-center gap-2">
                    <span>Connect</span>
                    <span className="text-lg">🤝</span>
                  </h2>
                </div>
                <div className="p-5 flex flex-wrap gap-4">
                  {profile.social.x && (
                    <a
                      href={`https://twitter.com/${profile.social.x}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#1DA1F2] text-white rounded-full hover:opacity-80 transition"
                    >
                      <Twitter className="w-6 h-6" />
                    </a>
                  )}
                  {profile.social.github && (
                    <a
                      href={`https://github.com/${profile.social.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#333] text-white rounded-full hover:opacity-80 transition"
                    >
                      <Github className="w-6 h-6" />
                    </a>
                  )}
                  {profile.social.linkedin && (
                    <a
                      href={`https://linkedin.com/in/${profile.social.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#0077B5] text-white rounded-full hover:opacity-80 transition"
                    >
                      <Linkedin className="w-6 h-6" />
                    </a>
                  )}
                  {profile.social.website && (
                    <a
                      href={profile.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-[#37322F] text-white rounded-full hover:opacity-80 transition"
                    >
                      <Globe className="w-6 h-6" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column - Projects */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-xl border border-[#E0DEDB] overflow-hidden"
            >
              <div className="p-5 border-b border-[#E0DEDB] flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#37322F] flex items-center gap-2">
                  <span>Projects ({userProjects.length})</span>
                  <span className="text-lg">📁</span>
                </h2>
                {isOwnProfile && (
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="px-4 py-2 bg-[#37322F] text-white rounded-lg text-sm font-medium hover:bg-[#2a2520] transition"
                  >
                    + Add Project
                  </button>
                )}
              </div>
              
              <div className="p-5">
                {showProjectForm && (
                  <div className="mb-6">
                    <ProjectForm
                      userId={userId}
                      project={editingProject}
                      onSave={handleProjectSaved}
                      onCancel={() => {
                        setShowProjectForm(false)
                        setEditingProject(null)
                      }}
                    />
                  </div>
                )}

                {userProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {userProjects.map((project) => (
                      <div key={project.id} className="relative">
                        <ProjectCard project={project} userId={userId} />
                        {isOwnProfile && (
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProject(project)
                                setShowProjectForm(true)
                              }}
                              className="p-2 bg-white rounded-lg shadow hover:shadow-md transition"
                            >
                              <Edit2 size={14} className="text-[#37322F]" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-2 bg-white rounded-lg shadow hover:shadow-md transition"
                            >
                              <Trash2 size={14} className="text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-[#605A57] mb-4">No projects yet</p>
                    {isOwnProfile && (
                      <button
                        onClick={() => setShowProjectForm(true)}
                        className="px-4 py-2 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition"
                      >
                        Create Your First Project
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}