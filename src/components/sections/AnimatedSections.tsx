// src/components/shared/DynamicBackground.tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const particles: HTMLDivElement[] = []
    const container = containerRef.current
    if (!container) return

    // Create particles
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div')
      particle.className = `
        absolute w-2 h-2 bg-red-500/20 rounded-full
        transform transition-all duration-[2000ms]
      `
      particles.push(particle)
      container.appendChild(particle)

      // Random initial position
      gsap.set(particle, {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      })

      // Animate
      gsap.to(particle, {
        duration: 'random(2, 8)',
        x: 'random(0, window.innerWidth)',
        y: 'random(0, window.innerHeight)',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    }

    // Connect nearby particles
    const drawConnections = () => {
      const canvas = document.createElement('canvas')
      canvas.className = 'absolute inset-0 pointer-events-none'
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      container.appendChild(canvas)

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const p1 = particles[i].getBoundingClientRect()
            const p2 = particles[j].getBoundingClientRect()
            const distance = Math.sqrt(
              Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
            )

            if (distance < 150) {
              ctx.beginPath()
              ctx.moveTo(p1.x + p1.width / 2, p1.y + p1.height / 2)
              ctx.lineTo(p2.x + p2.width / 2, p2.y + p2.height / 2)
              ctx.strokeStyle = `rgba(239, 68, 68, ${1 - distance / 150})`
              ctx.stroke()
            }
          }
        }

        requestAnimationFrame(animate)
      }

      animate()
    }

    drawConnections()

    return () => {
      particles.forEach(p => p.remove())
      container.innerHTML = ''
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
    />
  )
}