"use client"

import { useState, useEffect, useMemo, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Navigation from "@/components/navigation"
import { getAllUsers, type UserProfile, type Project } from "@/lib/storage"
import { motion } from "framer-motion"
import { Search, User, Folder, LinkIcon } from "lucide-react"

interface SearchResult {
  type: "profile" | "project" | "link"
  data: UserProfile | Project | { title: string; url: string; user: UserProfile }
  userId?: string
}

function SearchResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [users, setUsers] = useState<UserProfile[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
      setIsLoading(false)
    }
    
    fetchUsers()
  }, [])

  useEffect(() => {
    if (!query || users.length === 0) {
      setSearchResults([])
      return
    }

    const results: SearchResult[] = []
    const lowerQuery = query.toLowerCase()

    // Search profiles
    users.forEach((user) => {
      if (
        user.displayName.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery) ||
        user.bio.toLowerCase().includes(lowerQuery) ||
        user.interests.some((interest) => interest.toLowerCase().includes(lowerQuery))
      ) {
        results.push({ type: "profile", data: user })
      }

      // Search projects
      user.projects.forEach((project) => {
        if (
          project.title.toLowerCase().includes(lowerQuery) ||
          project.description.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ type: "project", data: project, userId: user.id })
        }
      })

      // Search links
      user.links.forEach((link) => {
        if (
          link.title.toLowerCase().includes(lowerQuery) ||
          link.url.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ type: "link", data: { ...link, user }, userId: user.id })
        }
      })
    })

    setSearchResults(results)
  }, [query, users])

  // Group results by type
  const groupedResults = useMemo(() => {
    const profiles = searchResults.filter((r) => r.type === "profile")
    const projects = searchResults.filter((r) => r.type === "project")
    const links = searchResults.filter((r) => r.type === "link")

    return { profiles, projects, links }
  }, [searchResults])

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F7F5F3]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="h-8 bg-[#E0DEDB] rounded mb-8 animate-pulse w-1/3"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-[#E0DEDB] p-6">
                <div className="h-6 bg-[#E0DEDB] rounded mb-4 animate-pulse w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-4 bg-[#E0DEDB] rounded animate-pulse"></div>
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
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">
            Results for &quot;{query}&quot;
          </h1>
          <p className="text-[#605A57]">
            Found {groupedResults.profiles.length} profiles, {groupedResults.projects.length} projects, and {groupedResults.links.length} links
          </p>
        </div>

        {searchResults.length === 0 ? (
          <div className="bg-white rounded-lg border border-[#E0DEDB] p-12 text-center">
            <Search className="w-12 h-12 text-[#E0DEDB] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#37322F] mb-2">No results found</h3>
            <p className="text-[#605A57] mb-6">
              We couldn&apos;t find anything matching &quot;{query}&quot;. Try different keywords.
            </p>
            <button
              onClick={() => router.push("/explore")}
              className="px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition"
            >
              Browse Explore Page
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profiles */}
            {groupedResults.profiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
              >
                <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#37322F]" />
                  <h2 className="font-semibold text-[#37322F]">
                    Profiles ({groupedResults.profiles.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#E0DEDB]">
                  {groupedResults.profiles.map((result, index) => {
                    const user = result.data as UserProfile
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 hover:bg-[#F7F5F3] cursor-pointer transition"
                        onClick={() => router.push(`/profile/${user.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E0DEDB] to-[#D0CECC] flex items-center justify-center">
                            <span className="font-semibold text-[#37322F]">
                              {user.displayName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#37322F]">{user.displayName}</h3>
                            <p className="text-sm text-[#605A57]">@{user.username}</p>
                            <p className="text-sm text-[#605A57] line-clamp-1 mt-1">
                              {user.bio || "No bio available"}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Projects */}
            {groupedResults.projects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
              >
                <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
                  <Folder className="w-5 h-5 text-[#37322F]" />
                  <h2 className="font-semibold text-[#37322F]">
                    Projects ({groupedResults.projects.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#E0DEDB]">
                  {groupedResults.projects.map((result, index) => {
                    const project = result.data as Project
                    const userId = result.userId
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 hover:bg-[#F7F5F3] cursor-pointer transition"
                        onClick={() => userId && router.push(`/profile/${userId}`)}
                      >
                        <h3 className="font-semibold text-[#37322F] mb-1">{project.title}</h3>
                        <p className="text-sm text-[#605A57] line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-xs text-[#605A57]">
                          <span>{project.views} views</span>
                          <span>{project.upvotes} upvotes</span>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Links */}
            {groupedResults.links.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg border border-[#E0DEDB] overflow-hidden"
              >
                <div className="border-b border-[#E0DEDB] px-6 py-4 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-[#37322F]" />
                  <h2 className="font-semibold text-[#37322F]">
                    Links ({groupedResults.links.length})
                  </h2>
                </div>
                <div className="divide-y divide-[#E0DEDB]">
                  {groupedResults.links.map((result, index) => {
                    const linkData = result.data as { title: string; url: string; user: UserProfile }
                    const userId = result.userId
                    return (
                      <motion.div
                        key={`${linkData.url}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-6 hover:bg-[#F7F5F3] cursor-pointer transition"
                        onClick={() => userId && router.push(`/profile/${userId}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-[#37322F]">{linkData.title}</h3>
                            <p className="text-sm text-[#605A57]">{linkData.url}</p>
                            <p className="text-xs text-[#605A57] mt-1">
                              From: {linkData.user.displayName}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-[#F7F5F3]">
        <Navigation />
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="h-8 bg-[#E0DEDB] rounded mb-8 animate-pulse w-1/3"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-[#E0DEDB] p-6">
                <div className="h-6 bg-[#E0DEDB] rounded mb-4 animate-pulse w-1/4"></div>
                <div className="space-y-3">
                  {[1, 2].map((j) => (
                    <div key={j} className="h-4 bg-[#E0DEDB] rounded animate-pulse"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  )
}