// src/components/shared/DynamicBackground.tsx
'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function DynamicBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const particles: { element: HTMLDivElement; x: number; y: number }[] = []
    const container = containerRef.current
    if (!container) return

    // Create canvas once
    if (!canvasRef.current) {
      const canvas = document.createElement('canvas')
      canvas.className = 'absolute inset-0 pointer-events-none'
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      container.appendChild(canvas)
      canvasRef.current = canvas
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    // Create particles
    const createParticles = () => {
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2
      const radius = Math.min(window.innerWidth, window.innerHeight) / 4

      for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div')
        particle.className = `
          absolute w-2 h-2 bg-red-500/20 rounded-full
          transform transition-all duration-[2000ms]
        `
        container.appendChild(particle)

        // Position particles in a circle around the center
        const angle = (i / 30) * Math.PI * 2
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        particles.push({ element: particle, x, y })

        // Animate with GSAP
        gsap.to(particle, {
          x: x + (Math.random() - 0.5) * 100,
          y: y + (Math.random() - 0.5) * 100,
          duration: 2 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      }
    }

    // Draw connections between particles
    const drawConnections = () => {
      if (!ctx || !canvasRef.current) return
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const rect1 = p1.element.getBoundingClientRect()
          const rect2 = p2.element.getBoundingClientRect()

          const x1 = rect1.x + rect1.width / 2
          const y1 = rect1.y + rect1.height / 2
          const x2 = rect2.x + rect2.width / 2
          const y2 = rect2.y + rect2.height / 2

          const distance = Math.hypot(x2 - x1, y2 - y1)
          const maxDistance = 150

          if (distance < maxDistance) {
            const opacity = (1 - distance / maxDistance) * 0.5
            ctx.beginPath()
            ctx.moveTo(x1, y1)
            ctx.lineTo(x2, y2)
            ctx.strokeStyle = `rgba(239, 68, 68, ${opacity})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(drawConnections)
    }

    // Handle window resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }

    // Initialize
    handleResize() // Ensure canvas covers the full viewport initially
    createParticles()
    drawConnections()
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      particles.forEach(p => p.element.remove())
      if (canvasRef.current) {
        canvasRef.current.remove()
        canvasRef.current = null
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50 to-white -z-10" />
      
      {/* Particle container */}
      <div
        ref={containerRef}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      />
    </div>
  )
}