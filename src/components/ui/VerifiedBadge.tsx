'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Shield } from 'lucide-react'

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  className?: string
  variant?: 'default' | 'shield'
}

export default function VerifiedBadge({ 
  size = 'md', 
  showText = false, 
  className = '',
  variant = 'default'
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  const Icon = variant === 'shield' ? Shield : CheckCircle
  
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 500, 
        damping: 30,
        delay: 0.2 
      }}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      <div className="relative">
        <Icon 
          className={`${sizeClasses[size]} text-blue-600 dark:text-blue-400 fill-current`}
        />
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-30 animate-pulse" />
      </div>
      
      {showText && (
        <span className={`font-medium text-blue-600 dark:text-blue-400 ${textSizeClasses[size]}`}>
          Verified
        </span>
      )}
    </motion.div>
  )
}

// Verification status indicator component
interface VerificationStatusProps {
  status: 'unverified' | 'pending' | 'verified' | 'rejected'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function VerificationStatus({ 
  status, 
  size = 'md', 
  showText = true 
}: VerificationStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          borderColor: 'border-green-200 dark:border-green-800',
          text: 'Verified',
          glowColor: 'bg-green-400'
        }
      case 'pending':
        return {
          icon: motion.div,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          text: 'Pending',
          glowColor: 'bg-yellow-400'
        }
      case 'rejected':
        return {
          icon: motion.div,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          text: 'Rejected',
          glowColor: 'bg-red-400'
        }
      default:
        return {
          icon: motion.div,
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          text: 'Unverified',
          glowColor: 'bg-gray-400'
        }
    }
  }
  
  const config = getStatusConfig()
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }
  
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }
  
  if (status === 'verified') {
    return <VerifiedBadge size={size} showText={showText} />
  }
  
  return (
    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${config.bgColor} ${config.borderColor}`}>
      {status === 'pending' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={`${sizeClasses[size]} border-2 border-current border-t-transparent rounded-full ${config.color}`}
        />
      )}
      
      {status === 'rejected' && (
        <div className={`${sizeClasses[size]} rounded-full ${config.color} flex items-center justify-center`}>
          ✕
        </div>
      )}
      
      {status === 'unverified' && (
        <div className={`${sizeClasses[size]} rounded-full ${config.color} flex items-center justify-center`}>
          ?
        </div>
      )}
      
      {showText && (
        <span className={`font-medium ${config.color} ${textSizeClasses[size]}`}>
          {config.text}
        </span>
      )}
    </div>
  )
}