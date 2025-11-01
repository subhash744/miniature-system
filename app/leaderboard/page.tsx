"use client";

import { useEffect } from "react";
import Navigation from "@/components/navigation";
import { updateStreaks } from "@/lib/storage";
import ImprovedLeaderboard from "@/components/improved-leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { getLeaderboardFromSupabase } from "@/lib/leaderboardHelpers";

export default function LeaderboardPage() {
  useEffect(() => {
    const init = async () => {
      await updateStreaks()
    }
    
    init()
  }, [])

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] flex flex-col">
      <Navigation />
      <ImprovedLeaderboard />
    </div>
  )
}