// components/ui/VerifiedBadge.tsx
'use client';

import { GraduationCap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerifiedBadgeProps {
  collegeName?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function CollegeVerifiedBadge({ 
  collegeName, 
  size = 'md', 
  showText = true 
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center gap-1.5 
        bg-gradient-to-r from-purple-500 to-purple-600 
        text-white font-medium rounded-full
        ${sizeClasses[size]}
      `}
      title={collegeName ? `College verified: ${collegeName}` : 'College verified'}
    >
      <div className="relative">
        <GraduationCap className={iconSizes[size]} />
        <CheckCircle className={`${iconSizes[size]} absolute -top-1 -right-1 bg-white text-green-500 rounded-full`} />
      </div>
      {showText && (
        <span className="font-semibold">
          {size === 'sm' ? 'Verified' : 'College Verified'}
        </span>
      )}
    </motion.div>
  );
}