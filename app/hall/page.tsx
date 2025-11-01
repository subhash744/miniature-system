"use client"

import { useEffect, useState } from "react"
import { getAllUsers } from "@/lib/storage"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import { EnhancedHallOfFame } from "@/components/enhanced-hall-of-fame"

export default function HallOfFamePage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setMounted(true)
      const allUsers = await getAllUsers()
      setUsers(allUsers)
    }
    
    fetchUsers()
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3]">
      <Navigation />
      <EnhancedHallOfFame initialUsers={users} />
    </div>
  )
}
