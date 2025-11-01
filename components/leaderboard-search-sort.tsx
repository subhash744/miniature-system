"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { motion } from "framer-motion"
import { getAllUsers, getLeaderboard, type LeaderboardEntry } from "@/lib/storage"

interface LeaderboardSearchSortProps {
  onResultsChange: (results: LeaderboardEntry[]) => void
}

export function LeaderboardSearchSort({ onResultsChange }: LeaderboardSearchSortProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"rank" | "upvotes" | "views" | "latest">("rank")
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  
  useEffect(() => {
    const fetchData = async () => {
      const users = await getAllUsers()
      setAllUsers(users)
      const leaderboardData = await getLeaderboard("all-time")
      setLeaderboard(leaderboardData)
    }
    
    fetchData()
  }, [])

  const filteredResults = useMemo(() => {
    let results = leaderboard

    if (searchQuery) {
      results = results.filter(
        (entry) =>
          entry.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (sortBy === "upvotes") {
      results = [...results].sort((a, b) => b.upvotes - a.upvotes)
    } else if (sortBy === "views") {
      results = [...results].sort((a, b) => b.views - a.views)
    } else if (sortBy === "latest") {
      const userMap = new Map(allUsers.map((u: any) => [u.id, u]))
      results = [...results].sort((a, b) => {
        const userA = userMap.get(a.userId)
        const userB = userMap.get(b.userId)
        return (userB?.createdAt || 0) - (userA?.createdAt || 0)
      })
    }

    return results
  }, [searchQuery, sortBy, leaderboard, allUsers])

  useEffect(() => {
    onResultsChange(filteredResults)
  }, [filteredResults, onResultsChange])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as any)
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="Search by name or username..."
        value={searchQuery}
        onChange={handleSearchChange}
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="rank">Sort by Rank</option>
        <option value="upvotes">Sort by Upvotes</option>
        <option value="views">Sort by Views</option>
        <option value="latest">Sort by Latest</option>
      </select>
    </motion.div>
  )
}
