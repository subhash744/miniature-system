"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getCurrentUser } from "@/lib/storage"

export function ReferralBanner() {
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }
    
    fetchCurrentUser()
  }, [])

  if (!currentUser) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUser.referralCode)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Invite Friends</h3>
          <p className="text-sm text-gray-600 mt-1">Share your referral code and earn 10 XP per friend</p>
          <p className="text-sm font-mono text-green-700 mt-2">Code: {currentUser.referralCode}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
        >
          Copy Code
        </motion.button>
      </div>
    </motion.div>
  )
}
