"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AuthModal } from "@/components/auth-modal"
import { getCurrentUser } from "@/lib/storage"
import confetti from "canvas-confetti"

export function LandingCTA() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }
    
    fetchCurrentUser()
  }, [])

  const handleJoinNow = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    if (currentUser) {
      router.push("/leaderboard")
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <section className="py-20 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-6 font-bold">Ready to be seen?</h2>
          <p className="text-lg text-[#605A57] mb-8">It's free. Takes 2 minutes.</p>

          <motion.button
            onClick={handleJoinNow}
            className="px-12 py-4 bg-gradient-to-r from-[#37322F] to-[#2a2520] text-white rounded-full font-semibold text-lg hover:shadow-lg transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your Profile
          </motion.button>
        </motion.div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}