// src/components/shared/FloatingShapes.tsx
'use client'

import { useEffect, useState } from 'react'

interface ShapeProps {
  id: number
  color: string
  size: number
  x: number
  y: number
  duration: number
  delay: number
}

const Shape: React.FC<ShapeProps> = ({ color, size, x, y, duration, delay }) => {
  return (
    <div
      className="floating-shape"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: size,
        height: size,
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 50 50"
        style={{ display: 'block' }}
      >
        <path
          d="M25,0 L50,25 L25,50 L0,25 Z"
          fill={color}
          opacity="0.5"
        />
      </svg>
    </div>
  )
}

const FloatingShapes: React.FC = () => {
  const [shapes, setShapes] = useState<ShapeProps[]>([])

  useEffect(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD']
    const sizes = [20, 30, 40]

    if (typeof window !== 'undefined') {
      const newShapes = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        x: Math.random() * (window.innerWidth * 0.8),
        y: Math.random() * (window.innerHeight * 0.8),
        duration: 3 + Math.random() * 2, // Random duration between 3-5s
        delay: Math.random() * 2, // Random delay between 0-2s
      }))

      setShapes(newShapes)
    }
  }, [])

  return (
    <div
      className="shapes-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: -1,
        overflow: 'hidden',
      }}
    >
      {shapes.map((shape) => (
        <Shape key={shape.id} {...shape} />
      ))}
    </div>
  )
}

export default FloatingShapes