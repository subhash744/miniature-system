"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  getCurrentUser, 
  getUserAnalytics 
} from "@/lib/storage"
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts"
import { motion } from "framer-motion"

interface EnhancedAnalyticsDashboardProps {
  userId: string
}

const COLORS = ["#37322F", "#605A57", "#E0DEDB", "#F7F5F3", "#2a2520"]

export function EnhancedAnalyticsDashboard({ userId }: EnhancedAnalyticsDashboardProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const initDashboard = async () => {
      setMounted(true)
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.id !== userId) {
        router.push("/")
        return
      }
      setUser(currentUser)
      
      const analyticsData = await getUserAnalytics(userId)
      setAnalytics(analyticsData)
    }
    
    initDashboard()
  }, [userId, router])

  if (!mounted || !user || !analytics) return null

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? `↑${current}` : "0%"
    const change = ((current - previous) / previous) * 100
    return `${change >= 0 ? '↑' : '↓'}${Math.abs(change).toFixed(0)}%`
  }

  // Get previous week data for comparison
  const previousWeekViews = analytics.dailyData.slice(0, 7).reduce((sum: number, day: any) => sum + day.views, 0)
  const previousWeekUpvotes = analytics.dailyData.slice(0, 7).reduce((sum: number, day: any) => sum + day.upvotes, 0)
  const currentWeekViews = analytics.dailyData.slice(7).reduce((sum: number, day: any) => sum + day.views, 0)
  const currentWeekUpvotes = analytics.dailyData.slice(7).reduce((sum: number, day: any) => sum + day.upvotes, 0)

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#37322F] mb-2">Analytics Dashboard 📊</h1>
          <p className="text-[#605A57]">Comprehensive insights into your profile performance</p>
        </div>

        {/* Overview (Last 7 Days) */}
        <div className="bg-white rounded-xl border border-[#E0DEDB] p-6 mb-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-6">Overview (Last 7 Days)</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#F7F5F3] p-4 rounded-lg">
              <div className="text-sm text-[#605A57] mb-1">Views</div>
              <div className="text-2xl font-bold text-[#37322F]">{analytics.weeklyViews}</div>
              <div className="text-xs text-green-600">
                {calculatePercentageChange(analytics.weeklyViews, previousWeekViews)}
              </div>
            </div>
            <div className="bg-[#F7F5F3] p-4 rounded-lg">
              <div className="text-sm text-[#605A57] mb-1">Upvotes</div>
              <div className="text-2xl font-bold text-[#37322F]">{analytics.weeklyUpvotes}</div>
              <div className="text-xs text-green-600">
                {calculatePercentageChange(analytics.weeklyUpvotes, previousWeekUpvotes)}
              </div>
            </div>
            <div className="bg-[#F7F5F3] p-4 rounded-lg">
              <div className="text-sm text-[#605A57] mb-1">Rank</div>
              <div className="text-2xl font-bold text-[#37322F]">#{user.rank}</div>
              <div className="text-xs text-green-600">↑3</div>
            </div>
            <div className="bg-[#F7F5F3] p-4 rounded-lg">
              <div className="text-sm text-[#605A57] mb-1">Links</div>
              <div className="text-2xl font-bold text-[#37322F]">{(user?.links?.length ?? 0)}</div>
              <div className="text-xs text-green-600">↑15%</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl border border-[#E0DEDB] p-6">
            <h2 className="text-xl font-semibold text-[#37322F] mb-6">Daily Activity Chart</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#605A57" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis stroke="#605A57" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#F7F5F3", border: "1px solid #E0DEDB", borderRadius: "8px" }} 
                    formatter={(value) => [value, '']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="#37322F" 
                    strokeWidth={2} 
                    name="Views"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="upvotes" 
                    stroke="#605A57" 
                    strokeWidth={2} 
                    name="Upvotes"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl border border-[#E0DEDB] p-6">
            <h2 className="text-xl font-semibold text-[#37322F] mb-6">Traffic Sources</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.referralSources}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="source"
                  >
                    {analytics.referralSources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#F7F5F3", border: "1px solid #E0DEDB", borderRadius: "8px" }}
                    formatter={(value) => [value, 'Visitors']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Engagement Metrics */}
          <div className="bg-white rounded-xl border border-[#E0DEDB] p-6">
            <h2 className="text-xl font-semibold text-[#37322F] mb-6">Engagement Metrics</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#605A57]">Engagement Rate</span>
                  <span className="font-medium text-[#37322F]">{analytics.engagementRate}%</span>
                </div>
                <div className="w-full bg-[#E0DEDB] rounded-full h-2">
                  <div 
                    className="bg-[#37322F] h-2 rounded-full" 
                    style={{ width: `${Math.min(100, analytics.engagementRate)}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#605A57]">Growth Rate</span>
                  <span className="font-medium text-[#37322F]">
                    {analytics.growthRate >= 0 ? '+' : ''}{analytics.growthRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-[#E0DEDB] rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, Math.abs(analytics.growthRate))}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#605A57]">Visitor Retention</span>
                  <span className="font-medium text-[#37322F]">{analytics.visitorRetention}%</span>
                </div>
                <div className="w-full bg-[#E0DEDB] rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${analytics.visitorRetention}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl border border-[#E0DEDB] p-6">
            <h2 className="text-xl font-semibold text-[#37322F] mb-6">Performance Insights</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#F7F5F3] rounded-lg">
                <span className="text-[#605A57]">Best Performing Day</span>
                <span className="font-medium text-[#37322F]">{analytics.bestPerformingDay}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#F7F5F3] rounded-lg">
                <span className="text-[#605A57]">Peak Hour</span>
                <span className="font-medium text-[#37322F]">{analytics.peakHour}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#F7F5F3] rounded-lg">
                <span className="text-[#605A57]">Average Session</span>
                <span className="font-medium text-[#37322F]">{analytics.averageSession}</span>
              </div>
            </div>
          </div>

          {/* Rank History */}
          <div className="bg-white rounded-xl border border-[#E0DEDB] p-6">
            <h2 className="text-xl font-semibold text-[#37322F] mb-6">Rank History</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.rankHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DEDB" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#605A57" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return `${date.getDate()}/${date.getMonth() + 1}`
                    }}
                  />
                  <YAxis 
                    stroke="#605A57" 
                    tick={{ fontSize: 12 }} 
                    reversed={true}
                    domain={[1, 'dataMax + 5']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#F7F5F3", border: "1px solid #E0DEDB", borderRadius: "8px" }}
                    formatter={(value) => [`Rank #${value}`, '']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rank" 
                    stroke="#37322F" 
                    strokeWidth={2} 
                    name="Rank"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Link Performance */}
        <div className="bg-white rounded-xl border border-[#E0DEDB] p-6 mt-8">
          <h2 className="text-xl font-semibold text-[#37322F] mb-6">Link Performance</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E0DEDB]">
                  <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Link</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#37322F]">Clicks</th>
                  <th className="text-left py-3 px-4 font-semibold text-[#37322F]">CTR</th>
                </tr>
              </thead>
              <tbody>
                {(user?.links ? user.links : []).slice(0, 3).map((link: any, index: number) => {
                  // For a real implementation, this data would come from actual tracking
                  // For now, we'll show 0s for new users or actual data for existing users
                  const clicks = user?.metrics?.linkClicks?.[link.url] || 0
                  const ctr = clicks > 0 ? Math.min(100, Math.floor((clicks / ((user?.views ?? 0) + 1)) * 100)) : 0
                  
                  return (
                    <tr key={index} className="border-b border-[#E0DEDB] hover:bg-gray-50">
                      <td className="py-3 px-4 text-[#37322F]">{link.title}</td>
                      <td className="py-3 px-4 text-[#605A57]">{clicks} clicks</td>
                      <td className="py-3 px-4 text-[#605A57]">{ctr}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            
            {(user?.links?.length ?? 0) === 0 && (
              <div className="text-center py-8 text-[#605A57]">
                <p>No links added yet. Add links to your profile to track their performance.</p>
              </div>
            )}
          </div>
        </div>

        {/* Goal Progress */}
        {user.goal && (
          <div className="bg-white rounded-xl border border-[#E0DEDB] p-6 mt-8">
            <h2 className="text-xl font-semibold text-[#37322F] mb-6">Goal Progress</h2>
            
            <div className="mb-4">
              <p className="text-[#37322F] font-medium mb-2">"{user.goal.title}"</p>
              <p className="text-[#605A57] mb-4">{user.goal.description}</p>
              
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[#605A57]">Progress</span>
                <span className="font-medium text-[#37322F]">
                  {user.goal.progressPercent}/100 ({user.goal.progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-[#E0DEDB] rounded-full h-3">
                <motion.div 
                  className="bg-gradient-to-r from-[#37322F] to-[#2a2520] h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${user.goal.progressPercent}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}