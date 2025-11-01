"use client"

import type React from "react"

import { useState } from "react"
import { addProjectToSupabase, updateProjectInSupabase } from "@/lib/projectHelpers"
import { useAuth } from "@/contexts/AuthContext"
import { showErrorNotification, showSuccessNotification } from "@/lib/notifications"

interface ProjectFormProps {
  userId: string
  project?: any
  onSave?: () => void
  onCancel?: () => void
}

export default function ProjectForm({ userId, project, onSave, onCancel }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || "")
  const [description, setDescription] = useState(project?.description || "")
  const [bannerUrl, setBannerUrl] = useState(project?.bannerUrl || "")
  const [link, setLink] = useState(project?.link || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (project) {
        // Update existing project
        const result = await updateProjectInSupabase(userId, { 
          id: project.id, 
          title, 
          description, 
          bannerUrl, 
          link 
        })
        
        if (!result.success) {
          showErrorNotification("Error", result.error || "Failed to update project")
          setIsLoading(false)
          return
        }
        
        showSuccessNotification("Success", "Project updated successfully")
      } else {
        // Add new project
        const result = await addProjectToSupabase(userId, { 
          title, 
          description, 
          bannerUrl, 
          link 
        })
        
        if (!result.success) {
          showErrorNotification("Error", result.error || "Failed to add project")
          setIsLoading(false)
          return
        }
        
        showSuccessNotification("Success", "Project added successfully")
      }

      setIsLoading(false)
      onSave?.()
    } catch (err) {
      console.error("Error saving project:", err)
      showErrorNotification("Error", "An unexpected error occurred")
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-[#E0DEDB]">
      <div>
        <label className="block text-sm font-medium text-[#37322F] mb-2">Project Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2 border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
          placeholder="My Awesome Project"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#37322F] mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full px-4 py-2 border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
          placeholder="Describe your project..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#37322F] mb-2">Banner URL (optional)</label>
        <input
          type="url"
          value={bannerUrl}
          onChange={(e) => setBannerUrl(e.target.value)}
          className="w-full px-4 py-2 border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
          placeholder="https://example.com/banner.jpg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#37322F] mb-2">Project Link</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
          className="w-full px-4 py-2 border border-[#E0DEDB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#37322F]"
          placeholder="https://example.com"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-[#37322F] text-white rounded-lg font-medium hover:bg-[#2a2520] transition disabled:opacity-50"
        >
          {isLoading ? "Saving..." : project ? "Update Project" : "Add Project"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-[#E0DEDB] text-[#37322F] rounded-lg font-medium hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}