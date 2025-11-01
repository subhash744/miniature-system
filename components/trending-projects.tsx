"use client"

import { useMemo, useEffect, useState } from "react"
import { motion } from "framer-motion"
import { getTrendingProjectsFromSupabase } from "@/lib/projectHelpers"

export function TrendingProjects() {
  const [trendingProjects, setTrendingProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchTrendingProjects = async () => {
      try {
        setLoading(true)
        const result = await getTrendingProjectsFromSupabase(5)
        
        if (result.success && result.data) {
          setTrendingProjects(result.data)
        } else {
          setError(result.error || "Failed to fetch trending projects")
        }
      } catch (err) {
        console.error("Error fetching trending projects:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }
    
    fetchTrendingProjects()
  }, [])
  
  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Trending Projects</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              <div className="flex gap-4 mt-3">
                <div className="h-3 bg-gray-200 rounded w-16"></div>
                <div className="h-3 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Trending Projects</h3>
        <div className="text-red-500">Error loading trending projects: {error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">Trending Projects</h3>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 overflow-x-auto pb-4">
        {trendingProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h4 className="font-semibold text-gray-900 truncate">{project.title}</h4>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              <span>Upvotes: {project.upvotes}</span>
              <span>Views: {project.views}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">by {project.user?.displayName || project.user?.username}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}