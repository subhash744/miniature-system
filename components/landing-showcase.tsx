"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getFeaturedBuilders } from "@/lib/storage"
import type { UserProfile } from "@/lib/storage"
import { Users, MapPin, Eye, Heart, Award } from "lucide-react"

export function LandingShowcase() {
  const router = useRouter()
  const [featured, setFeatured] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedBuilders = async () => {
      setLoading(true)
      try {
        const builders = await getFeaturedBuilders()
        setFeatured(builders)
      } catch (error) {
        console.error("Error fetching featured builders:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeaturedBuilders()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-[#F7F5F3] to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#37322F] rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-4 font-bold">Featured Profiles</h2>
          <p className="text-lg text-[#605A57] max-w-2xl mx-auto">Discover amazing creators in our community. Get inspired by their work and connect with like-minded builders.</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[...Array(3)].map((_, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl border border-[#E0DEDB] animate-pulse">
                <div className="w-16 h-16 rounded-full bg-[#E0DEDB] mb-4"></div>
                <div className="h-4 bg-[#E0DEDB] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#E0DEDB] rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-[#E0DEDB] rounded w-full mb-1"></div>
                <div className="h-3 bg-[#E0DEDB] rounded w-5/6 mb-4"></div>
                <div className="flex gap-2 mb-3">
                  <div className="h-12 bg-[#E0DEDB] rounded flex-1"></div>
                  <div className="h-12 bg-[#E0DEDB] rounded flex-1"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-[#E0DEDB] rounded-full w-16"></div>
                  <div className="h-6 bg-[#E0DEDB] rounded-full w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featured.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {featured.map((user: UserProfile) => (
              <motion.div
                key={user.id}
                className="p-6 bg-white rounded-xl border border-[#E0DEDB] hover:shadow-xl transition cursor-pointer backdrop-blur-sm group relative overflow-hidden"
                variants={itemVariants}
                onClick={() => router.push(`/profile/${user.id}`)}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Badge for featured profiles */}
                <div className="absolute -top-3 -right-3 w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center rotate-12">
                  <span className="text-white text-xs font-bold">⭐</span>
                </div>
                
                <div className="relative z-10">
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.displayName}
                    className="w-16 h-16 rounded-full mb-4 border-2 border-white shadow-sm group-hover:ring-2 ring-[#37322F] transition"
                  />
                  <h3 className="font-semibold text-[#37322F] mb-1">{user.displayName}</h3>
                  <p className="text-sm text-[#605A57] mb-3">@{user.username}</p>
                  <p className="text-sm text-[#605A57] mb-4 line-clamp-2">{user.bio}</p>

                  {user.location && (
                    <div className="text-xs text-[#605A57] mb-3 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {user.location.city}, {user.location.country}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-[#F7F5F3] p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-[#605A57] mb-1">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Views</span>
                      </div>
                      <p className="font-semibold text-[#37322F]">{user.views}</p>
                    </div>
                    <div className="bg-[#F7F5F3] p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-[#605A57] mb-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">Upvotes</span>
                      </div>
                      <p className="font-semibold text-[#37322F]">{user.upvotes}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {user.badges.slice(0, 3).map((badge: string) => (
                      <span key={badge} className="text-xs bg-[#37322F] text-white px-2 py-1 rounded-full flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">⭐</div>
            <h3 className="text-2xl font-semibold text-[#37322F] mb-2">No featured profiles yet</h3>
            <p className="text-[#605A57] mb-6">Create your profile to be featured in our community!</p>
            <motion.button
              onClick={() => router.push("/profile-creation")}
              className="px-6 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition flex items-center gap-2 mx-auto"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Users className="w-4 h-4" />
              Create Your Profile
            </motion.button>
          </motion.div>
        )}

        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.button
            onClick={() => router.push("/leaderboard")}
            className="px-6 py-3 border border-[#37322F] text-[#37322F] rounded-full font-medium hover:bg-[#37322F] hover:text-white transition flex items-center gap-2 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-4 h-4" />
            View All Profiles
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}