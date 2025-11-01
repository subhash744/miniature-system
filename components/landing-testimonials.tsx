"use client"

import { motion } from "framer-motion"

export function LandingTestimonials() {
  // Removed fake testimonials to create a 0-user ready web app
  const testimonials: any[] = []

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
    <section className="py-20 px-6 bg-gradient-to-b from-white to-[#F7F5F3]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-serif text-[#37322F] mb-4">Community Feedback</h2>
          <p className="text-lg text-[#605A57]">Join our growing community of creators</p>
        </motion.div>

        {testimonials.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial: any, idx: number) => (
              <motion.div
                key={idx}
                className="p-6 bg-white rounded-lg border border-[#E0DEDB] hover:shadow-lg transition"
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <p className="text-[#605A57] mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.author}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-[#37322F]">{testimonial.author}</p>
                    <p className="text-sm text-[#605A57]">{testimonial.role}</p>
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
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-2xl font-semibold text-[#37322F] mb-2">No testimonials yet</h3>
            <p className="text-[#605A57] mb-6">Be the first to share your experience with our community!</p>
            <motion.button
              className="px-6 py-3 bg-[#37322F] text-white rounded-full font-medium hover:bg-[#2a2520] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Join Our Community
            </motion.button>
          </motion.div>
        )}
      </div>
    </section>
  )
}