"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AuthModal } from "@/components/auth-modal"
import { getCurrentUser } from "@/lib/storage"

export function LandingHero() {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  }

  const handleGetStarted = () => {
    if (currentUser) {
      router.push("/leaderboard")
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden bg-gradient-to-b from-[#F7F5F3] to-white">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#37322F]/5 to-transparent rounded-full blur-3xl"
            animate={{
              y: [0, 30, 0],
              x: [0, 20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-[#37322F]/5 to-transparent rounded-full blur-3xl"
            animate={{
              y: [0, -30, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </div>

        <motion.div
          className="relative z-10 max-w-4xl mx-auto text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-5xl md:text-7xl font-serif text-[#37322F] mb-6 leading-tight"
            variants={itemVariants}
          >
            Be Seen. Get Ranked. Share Your Links.
          </motion.h1>

          <motion.p className="text-lg md:text-xl text-[#605A57] mb-8 max-w-2xl mx-auto" variants={itemVariants}>
            Join the daily leaderboard. Get discovered. Grow your audience.
          </motion.p>

          <motion.div className="flex gap-4 justify-center mb-16 flex-wrap" variants={itemVariants}>
            <motion.button
              onClick={handleGetStarted}
              className="px-8 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentUser ? "Go to Leaderboard" : "Create Profile"}
            </motion.button>
            <motion.button
              onClick={() => router.push("/leaderboard")}
              className="px-8 py-3 border border-[#E0DEDB] text-[#37322F] rounded-full font-medium hover:bg-white transition"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View Leaderboard
            </motion.button>
          </motion.div>

          {/* Updated feature cards as per requirements */}
          <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" variants={itemVariants}>
            {[
              { 
                icon: "👤", 
                title: "Create Your Profile", 
                desc: "Add your bio, avatar, and important links" 
              },
              { 
                icon: "🏆", 
                title: "Get Discovered", 
                desc: "Appear on daily leaderboards as visitors find you" 
              },
              { 
                icon: "⭐", 
                title: "Climb the Ranks", 
                desc: "Earn upvotes and badges as your presence grows" 
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                className="p-6 bg-white rounded-lg border border-[#E0DEDB] hover:shadow-lg transition"
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-[#37322F] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#605A57]">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  )
}