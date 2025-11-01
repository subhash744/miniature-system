"use client"

import { useEffect, useState } from "react"
import Navigation from "@/components/navigation"
import { LandingHero } from "@/components/landing-hero"
import { LandingLeaderboardPreview } from "@/components/landing-leaderboard-preview"
import { LandingShowcase } from "@/components/landing-showcase"
import { LandingHowItWorks } from "@/components/landing-how-it-works"
import { LandingTestimonials } from "@/components/landing-testimonials"
import { LandingCTA } from "@/components/landing-cta"
import { LandingFooter } from "@/components/landing-footer"
import { LandingSocialProof } from "@/components/landing-social-proof"
import { LandingFeatures } from "@/components/landing-features"

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="w-full min-h-screen bg-[#F7F5F3] flex flex-col">
      <Navigation />
      <main className="flex-1">
        <LandingHero />
        <LandingHowItWorks />
        <LandingSocialProof />
        <LandingFeatures />
        <LandingLeaderboardPreview />
        <LandingShowcase />
        <LandingTestimonials />
        <LandingCTA />
      </main>
      <LandingFooter />
    </div>
  )
}