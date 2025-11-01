'use client'

import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"
import { 
  getAllUsers, 
  incrementViewCount,
  addUpvote,
  canUpvote,
  clearLocalAppData
} from "@/lib/storage"
import { supabase } from "@/lib/supabaseClient"
import { 
  addProjectToSupabase, 
  getUserProjectsFromSupabase,
  addProjectUpvoteToSupabase,
  incrementProjectViewsInSupabase
} from "@/lib/projectHelpers"

export default function DevToolsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [testResult, setTestResult] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    }
    
    fetchUsers()
  }, [])

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setIsLoading(true)
    setTestResult(`Running ${testName}...`)
    
    try {
      const result = await testFn()
      setTestResult(`✅ ${testName} - Success: ${JSON.stringify(result)}`)
    } catch (error) {
      setTestResult(`❌ ${testName} - Error: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1)
      if (error) throw error
      return { message: "Connected successfully", data: data?.length || 0 }
    } catch (error) {
      throw new Error(`Connection failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const testProfileFetch = async () => {
    const users = await getAllUsers()
    return { message: "Fetched users", count: users.length }
  }

  const testProjectFetch = async () => {
    if (users.length === 0) throw new Error("No users available")
    const randomUser = users[Math.floor(Math.random() * users.length)]
    const projects = await getUserProjectsFromSupabase(randomUser.id)
    return { message: "Fetched projects", user: randomUser.username, projects: projects.data?.length || 0 }
  }

  const testProjectCreation = async () => {
    if (users.length === 0) throw new Error("No users available")
    const randomUser = users[Math.floor(Math.random() * users.length)]
    const project = {
      title: "Test Project",
      description: "A test project created by dev tools",
      link: "https://example.com"
    }
    const result = await addProjectToSupabase(randomUser.id, project)
    return { message: "Created project", user: randomUser.username, success: result.success }
  }

  const testViewIncrement = async () => {
    if (users.length === 0) throw new Error("No users available")
    const randomUser = users[Math.floor(Math.random() * users.length)]
    await incrementViewCount(randomUser.id)
    return { message: "Incremented view count", user: randomUser.username }
  }

  const testProjectViewIncrement = async () => {
    // First get a project to test with
    if (users.length === 0) throw new Error("No users available")
    
    for (const user of users) {
      const projects = await getUserProjectsFromSupabase(user.id)
      if (projects.success && projects.data && projects.data.length > 0) {
        const randomProject = projects.data[Math.floor(Math.random() * projects.data.length)]
        await incrementProjectViewsInSupabase(randomProject.id)
        return { message: "Incremented project view count", project: randomProject.title }
      }
    }
    
    throw new Error("No projects available to test with")
  }

  const testProjectUpvote = async () => {
    // First get a project to test with
    if (users.length === 0) throw new Error("No users available")
    
    for (const user of users) {
      const projects = await getUserProjectsFromSupabase(user.id)
      if (projects.success && projects.data && projects.data.length > 0) {
        const randomProject = projects.data[Math.floor(Math.random() * projects.data.length)]
        const randomUserId = users[Math.floor(Math.random() * users.length)].id
        const result = await addProjectUpvoteToSupabase(randomProject.id, randomUserId)
        return { message: "Upvoted project", project: randomProject.title, success: result.success }
      }
    }
    
    throw new Error("No projects available to test with")
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-[#37322F] mb-8">Developer Tools</h1>
        
        <div className="bg-white rounded-lg border border-[#E0DEDB] p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-4">Supabase Integration Tests</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                clearLocalAppData()
                setTestResult('✅ Cleared local app data and session cache')
              }}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-[#E0DEDB] text-[#37322F] rounded-lg hover:bg-white transition disabled:opacity-50"
            >
              Clear Local App Data
            </button>
            <button
              onClick={() => runTest("Supabase Connection", testSupabaseConnection)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition disabled:opacity-50"
            >
              Test Supabase Connection
            </button>
            
            <button
              onClick={() => runTest("Profile Fetch", testProfileFetch)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition disabled:opacity-50"
            >
              Test Profile Fetch
            </button>
            
            <button
              onClick={() => runTest("Project Fetch", testProjectFetch)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition disabled:opacity-50"
            >
              Test Project Fetch
            </button>
            
            <button
              onClick={() => runTest("Project Creation", testProjectCreation)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition disabled:opacity-50"
            >
              Test Project Creation
            </button>
            
            <button
              onClick={() => runTest("View Increment", testViewIncrement)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition disabled:opacity-50"
            >
              Test View Increment
            </button>
            
            <button
              onClick={() => runTest("Project View Increment", testProjectViewIncrement)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition disabled:opacity-50"
            >
              Test Project View Increment
            </button>
            
            <button
              onClick={() => runTest("Project Upvote", testProjectUpvote)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#37322F] text-white rounded-lg hover:bg-[#2a2520] transition disabled:opacity-50"
            >
              Test Project Upvote
            </button>
          </div>
          
          {testResult && (
            <div className="mt-6 p-4 bg-[#F7F5F3] rounded-lg">
              <p className="text-[#37322F] font-mono text-sm">{testResult}</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-lg border border-[#E0DEDB] p-6">
          <h2 className="text-xl font-semibold text-[#37322F] mb-4">User Data</h2>
          <p className="text-[#605A57] mb-4">Total users: {users.length}</p>
          
          <div className="max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="border-b border-[#E0DEDB] py-3">
                <p className="font-medium text-[#37322F]">{user.displayName} (@{user.username})</p>
                <p className="text-sm text-[#605A57]">Views: {user.views} | Upvotes: {user.upvotes} | Projects: {user.projects.length}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}