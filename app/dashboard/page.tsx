"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getUserAnalytics } from "@/lib/storage"
import Navigation from "@/components/navigation"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { EnhancedAnalyticsDashboard } from "@/components/enhanced-analytics-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "engagement">("overview")

  useEffect(() => {
    const initDashboard = async () => {
      setMounted(true)
      const user = await getCurrentUser()
      if (!user) {
        router.push("/")
        return
      }
      setCurrentUser(user)
      const analyticsData = await getUserAnalytics(user.id)
      setAnalytics(analyticsData)
    }
    
    initDashboard()
  }, [router])

  // Only check for currentUser, not analytics, since analytics can be null for new users
  if (!mounted || !currentUser) return null

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

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-serif text-[#37322F] mb-8">Your Analytics Dashboard</h1>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-[#E0DEDB]">
          {(["overview", "projects", "engagement"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors capitalize ${
                activeTab === tab ? "text-[#37322F] border-b-2 border-[#37322F]" : "text-[#605A57] hover:text-[#37322F]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab - Enhanced Analytics Dashboard */}
        {activeTab === "overview" && (
          <EnhancedAnalyticsDashboard userId={currentUser.id} />
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
            <h2 className="text-lg font-semibold text-[#37322F] mb-6">Project Performance</h2>
            {analytics?.projectStats && analytics.projectStats.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E0DEDB]">
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Project</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Views</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Upvotes</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#37322F]">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.projectStats
                      .sort((a: any, b: any) => b.upvotes - a.upvotes)
                      .map((project: any) => (
                        <tr key={project.projectId} className="border-b border-[#E0DEDB] hover:bg-gray-50">
                          <td className="py-3 px-4 text-[#37322F]">{project.title}</td>
                          <td className="py-3 px-4 text-[#605A57]">{project.views}</td>
                          <td className="py-3 px-4 text-[#605A57]">{project.upvotes}</td>
                          <td className="py-3 px-4 text-[#605A57]">{project.ctr}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[#605A57]">No projects yet. Create your first project to see analytics!</p>
            )}
          </div>
        )}

        {/* Engagement Tab */}
        {activeTab === "engagement" && (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
              <h2 className="text-lg font-semibold text-[#37322F] mb-4">Daily Engagement</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics?.dailyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
                  <XAxis dataKey="date" stroke="#605A57" />
                  <YAxis stroke="#605A57" />
                  <Tooltip contentStyle={{ backgroundColor: "#F7F5F3", border: "1px solid #E0DEDB" }} />
                  <Line type="monotone" dataKey="views" stroke="#37322F" strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="upvotes" stroke="#605A57" strokeWidth={2} name="Upvotes" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <h3 className="text-lg font-semibold text-[#37322F] mb-4">Top Performing Day</h3>
                {analytics?.dailyData && analytics.dailyData.length > 0 &&
                  (() => {
                    const topDay = analytics.dailyData.reduce((max: any, day: any) =>
                      day.views + day.upvotes > max.views + max.upvotes ? day : max,
                    )
                    return (
                      <div>
                        <p className="text-2xl font-semibold text-[#37322F] mb-2">{topDay.date}</p>
                        <p className="text-[#605A57]">Views: {topDay.views}</p>
                        <p className="text-[#605A57]">Upvotes: {topDay.upvotes}</p>
                      </div>
                    )
                  })()}
              </div>

              <div className="bg-white p-6 rounded-lg border border-[#E0DEDB]">
                <h3 className="text-lg font-semibold text-[#37322F] mb-4">Engagement Rate</h3>
                {analytics?.totalViews > 0 && (
                  <div>
                    <p className="text-2xl font-semibold text-[#37322F] mb-2">
                      {((analytics.totalUpvotes / analytics.totalViews) * 100).toFixed(2)}%
                    </p>
                    <p className="text-[#605A57]">Upvotes per view</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}