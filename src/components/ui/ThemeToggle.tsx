'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'

interface ThemeToggleProps {
  variant?: 'default' | 'settings'
  showLabel?: boolean
}

export default function ThemeToggle({ variant = 'default', showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  if (variant === 'settings') {
    return (
      <button
        onClick={toggleTheme}
        className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
          {theme === 'dark' ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Switch to {theme === 'dark' ? 'light' : 'dark'} theme
          </p>
        </div>
        <div className="relative">
          <motion.div
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-primary-500' 
                : 'bg-gray-300'
            }`}
            onClick={(e) => {
              e.stopPropagation()
              toggleTheme()
            }}
          >
            <motion.div
              className="w-4 h-4 bg-white rounded-full shadow-md"
              animate={{
                x: theme === 'dark' ? 24 : 0
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            />
          </motion.div>
        </div>
      </button>
    )
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className="relative p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-6 h-6 text-gray-700 dark:text-gray-300"
      >
        {theme === 'dark' ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
      </motion.div>
      
      {showLabel && (
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </motion.button>
  )
}