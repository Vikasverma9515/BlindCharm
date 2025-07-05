'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Heart, Users, MessageCircle } from 'lucide-react'

const features = [
  {
    icon: <Users className="w-8 h-8" />,
    title: "Join a Lobby",
    description: "Enter themed lobbies based on your interests and preferences",
    delay: 0
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Get Matched",
    description: "Our AI matches you with compatible partners based on shared interests",
    delay: 0.2
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: "Connect Deeply",
    description: "Chat and discover each other's personality before revealing photos",
    delay: 0.4
  }
]

export default function FeaturesSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center mb-16 text-gray-900"
        >
          How BlindCharm Works
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: feature.delay, duration: 0.8 }}
              className="relative group"
            >
              <div className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="absolute -inset-0.5 bg-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur" />
                <div className="relative bg-white rounded-2xl p-6">
                  <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6 text-red-600 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}