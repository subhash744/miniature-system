"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { getCurrentUser, saveUserProfile } from "@/lib/storage"
import { saveProfileToSupabase } from "@/lib/supabaseDb"
import Navigation from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Github, 
  Linkedin, 
  Globe, 
  Twitter, 
  Mail,
  Dribbble
} from "lucide-react"

interface SocialLink {
  platform: string
  url: string
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const { user: supabaseUser } = useAuth()
  const [user, setUser] = useState<any>(null)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [quote, setQuote] = useState("")
  const [avatar, setAvatar] = useState("")
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "github", url: "" },
    { platform: "linkedin", url: "" },
    { platform: "twitter", url: "" },
    { platform: "website", url: "" }
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserData = async () => {
      if (!supabaseUser) {
        router.push("/")
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/")
          return
        }

        setUser(currentUser)
        setDisplayName(currentUser.displayName || "")
        setUsername(currentUser.username || "")
        setBio(currentUser.bio || "")
        setQuote(currentUser.quote || "")
        setAvatar(currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`)

        // Initialize social links
        const links = [
          { platform: "github", url: currentUser.social?.github || "" },
          { platform: "linkedin", url: currentUser.social?.linkedin || "" },
          { platform: "twitter", url: currentUser.social?.x || "" },
          { platform: "website", url: currentUser.social?.website || "" }
        ]
        setSocialLinks(links)
      } catch (err) {
        setError("Failed to load profile data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [supabaseUser, router])

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "github": return <Github className="w-5 h-5" />
      case "linkedin": return <Linkedin className="w-5 h-5" />
      case "twitter": return <Twitter className="w-5 h-5" />
      case "dribbble": return <Dribbble className="w-5 h-5" />
      case "email": return <Mail className="w-5 h-5" />
      default: return <Globe className="w-5 h-5" />
    }
  }

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case "github": return "GitHub"
      case "linkedin": return "LinkedIn"
      case "twitter": return "Twitter"
      case "dribbble": return "Dribbble"
      case "email": return "Email"
      case "website": return "Website"
      default: return platform.charAt(0).toUpperCase() + platform.slice(1)
    }
  }

  const updateSocialLink = (index: number, url: string) => {
    const newLinks = [...socialLinks]
    newLinks[index] = { ...newLinks[index], url }
    setSocialLinks(newLinks)
  }

  const validateForm = () => {
    if (!displayName.trim()) {
      setError("Display name is required")
      return false
    }

    if (!username.trim()) {
      setError("Username is required")
      return false
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username can only contain letters, numbers, and underscores")
      return false
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setError("")

    try {
      const updatedUser = {
        ...user,
        displayName: displayName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        quote: quote.trim(),
        avatar,
        social: {
          github: socialLinks.find(l => l.platform === "github")?.url || "",
          linkedin: socialLinks.find(l => l.platform === "linkedin")?.url || "",
          x: socialLinks.find(l => l.platform === "twitter")?.url || "",
          website: socialLinks.find(l => l.platform === "website")?.url || ""
        }
      }

      // Save to localStorage
      await saveUserProfile(updatedUser)

      // Save to Supabase
      const result = await saveProfileToSupabase(updatedUser)
      if (!result.success) {
        throw new Error(result.error)
      }

      // Redirect to profile page
      router.push(`/profile/${user.id}`)
    } catch (err) {
      setError("Failed to save profile: " + (err as Error).message)
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#F7F5F3] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#37322F] mx-auto mb-4"></div>
          <p className="text-[#37322F]">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Profile Settings</h1>
          <p className="text-[#605A57]">Manage your profile information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#E0DEDB] p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#37322F] mb-2">Display Name</label>
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#37322F] mb-2">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[#605A57]">rigeo.com/@</span>
                </div>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-28"
                  placeholder="username"
                />
              </div>
              <p className="text-xs text-[#605A57] mt-1">Your profile URL</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#37322F] mb-2">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#37322F] mb-2">Personal Quote</label>
              <Input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full"
                placeholder="A quote that represents you..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E0DEDB] p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-6">Social Links</h2>
          
          <div className="space-y-4">
            {socialLinks.map((link, index) => (
              <div key={link.platform} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F7F5F3] flex items-center justify-center">
                  {getPlatformIcon(link.platform)}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#37322F] mb-1">
                    {getPlatformName(link.platform)}
                  </label>
                  <Input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocialLink(index, e.target.value)}
                    className="w-full"
                    placeholder={`https://${link.platform}.com/username`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-[#37322F] hover:bg-[#2a2520] text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={() => router.push(`/profile/${user.id}`)}
            variant="outline"
            className="flex-1 border-[#E0DEDB] text-[#37322F]"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}