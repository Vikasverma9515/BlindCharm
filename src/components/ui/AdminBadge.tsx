'use client'

import { Settings,Ghost } from 'lucide-react'

interface AdminBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AdminBadge({ size = 'md', className = '' }: AdminBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  }

  const iconSizes = {
    sm: 10,
    md: 12,
    lg: 14
  }

  return (
    <div className={`
      flex items-center gap-2 
      bg-purple-500
      text-white 
      ${sizeClasses[size]}
      rounded-full 
      font-semibold 
      shadow-lg 
      ${className}
    `}>
      <Ghost size={iconSizes[size]} />
      <span>ADMIN</span>
    </div>
  )
}