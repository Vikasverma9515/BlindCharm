// src/components/sections/StatsSection.tsx
'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import React from 'react'

const stats = [
  { value: 10000, label: "Active Users", suffix: "+" },
  { value: 5000, label: "Successful Matches", suffix: "+" },
  { value: 4.8, label: "User Rating", suffix: "/5" }
]

export default function StatsSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-red-50/50 to-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 blur" />
              <div className="relative p-8 bg-white rounded-2xl shadow-xl">
                <span className="text-4xl font-bold text-gray-900">
                  {inView ? `${stat.value}${stat.suffix}` : '...'}
                </span>
                <div className="text-gray-700 text-lg mt-2">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Counting number animation component
function CountingNumber({ value, inView, suffix = '' }: { value: number; inView: boolean; suffix?: string }) {
    const [count, setCount] = useState(0)
  
    React.useEffect(() => {
      if (inView) {
        let start = 0
        const end = value
        const duration = 2000
        const increment = end / (duration / 16)
  
        const timer = setInterval(() => {
          start += increment
          if (start >= end) {
            setCount(end)
            clearInterval(timer)
          } else {
            setCount(Math.floor(start))
          }
        }, 16)
  
        return () => clearInterval(timer)
      }
    }, [inView, value])
  
    return (
      <div className="text-5xl font-bold text-red-600">
        {count.toLocaleString()}{suffix}
      </div>
    )
  }