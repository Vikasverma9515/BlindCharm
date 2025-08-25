'use client';

import { Shield, CheckCircle, Award, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerifiedBadgeProps {
  type: 'face' | 'college' | 'premium' | 'age';
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  score?: number;
  age?: number;
  collegeName?: string;
}

export default function VerifiedBadge({ 
  type, 
  verified, 
  size = 'md', 
  showText = false,
  className = '',
  score,
  age,
  collegeName
}: VerifiedBadgeProps) {
  if (!verified) return null;

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-5 h-5 text-sm', 
    lg: 'w-6 h-6 text-base'
  };

  const badgeConfig = {
    face: {
      icon: Shield,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-100',
      darkBgColor: 'dark:bg-green-900/20',
      darkTextColor: 'dark:text-green-400',
      label: 'Face Verified',
      emoji: '✅'
    },
    college: {
      icon: Award,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      darkBgColor: 'dark:bg-blue-900/20',
      darkTextColor: 'dark:text-blue-400',
      label: collegeName || 'College Verified',
      emoji: '🎓'
    },
    premium: {
      icon: Sparkles,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-100',
      darkBgColor: 'dark:bg-purple-900/20',
      darkTextColor: 'dark:text-purple-400',
      label: 'Premium Member',
      emoji: '👑'
    },
    age: {
      icon: CheckCircle,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-100',
      darkBgColor: 'dark:bg-amber-900/20',
      darkTextColor: 'dark:text-amber-400',
      label: `Age: ${age}`,
      emoji: '🎂'
    }
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  if (!showText) {
    // Simple icon badge
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
        className={`inline-flex items-center justify-center rounded-full ${config.color} text-white ${sizeClasses[size]} ${className}`}
        title={config.label + (score ? ` (${score.toFixed(1)}%)` : '')}
      >
        <Icon className={sizeClasses[size]} />
      </motion.div>
    );
  }

  // Full badge with text
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center px-2 py-1 rounded-full ${config.bgColor} ${config.darkBgColor} ${className}`}
    >
      <Icon className={`${sizeClasses[size]} ${config.textColor} ${config.darkTextColor} mr-1`} />
      <span className={`font-medium ${config.textColor} ${config.darkTextColor} ${sizeClasses[size]}`}>
        {config.label}
      </span>
      {score && (
        <span className={`ml-1 text-xs ${config.textColor} ${config.darkTextColor} opacity-75`}>
          {score.toFixed(0)}%
        </span>
      )}
    </motion.div>
  );
}

// Utility component for multiple badges
interface VerifiedBadgesProps {
  faceVerified?: boolean;
  faceScore?: number;
  collegeVerified?: boolean;
  collegeName?: string;
  isPremium?: boolean;
  estimatedAge?: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function VerifiedBadges({
  faceVerified,
  faceScore,
  collegeVerified,
  collegeName,
  isPremium,
  estimatedAge,
  size = 'md',
  showText = false,
  className = ''
}: VerifiedBadgesProps) {
  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {faceVerified && (
        <VerifiedBadge
          type="face"
          verified={true}
          size={size}
          showText={showText}
          score={faceScore}
        />
      )}
      {collegeVerified && (
        <VerifiedBadge
          type="college"
          verified={true}
          size={size}
          showText={showText}
          collegeName={collegeName}
        />
      )}
      {isPremium && (
        <VerifiedBadge
          type="premium"
          verified={true}
          size={size}
          showText={showText}
        />
      )}
      {estimatedAge && (
        <VerifiedBadge
          type="age"
          verified={true}
          size={size}
          showText={showText}
          age={estimatedAge}
        />
      )}
    </div>
  );
}