// src/components/profile/InterestSelector.tsx
'use client'

import { useState, useEffect } from 'react'
import { Interest, INTEREST_CATEGORIES } from '@/types'

export interface InterestSelectorProps {
  onSelect: (interests: string[]) => void;
  defaultSelected?: string[];
  maxSelections?: number;
  minSelections?: number;
}

export default function InterestSelector({
  onSelect,
  defaultSelected = [],
  maxSelections = 10,
  minSelections = 3,
}: InterestSelectorProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>(defaultSelected)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    validateSelections(selectedInterests)
  }, [selectedInterests])

  const validateSelections = (interests: string[]) => {
    if (interests.length < minSelections) {
      setError(`Please select at least ${minSelections} interests`)
    } else if (interests.length > maxSelections) {
      setError(`You can only select up to ${maxSelections} interests`)
    } else {
      setError('')
    }
  }

  const toggleInterest = (interest: string) => {
    const updatedInterests = selectedInterests.includes(interest)
      ? selectedInterests.filter(i => i !== interest)
      : selectedInterests.length < maxSelections
        ? [...selectedInterests, interest]
        : selectedInterests

    setSelectedInterests(updatedInterests)
    onSelect(updatedInterests)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Your Interests
        </label>
        <p className="text-sm text-gray-500">
          Select {minSelections}-{maxSelections} interests that best describe you
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {INTEREST_CATEGORIES.map((interest) => (
          <button
            key={interest}
            type="button"
            onClick={() => toggleInterest(interest)}
            disabled={!selectedInterests.includes(interest) && selectedInterests.length >= maxSelections}
            className={`
              p-2 rounded-md text-sm transition-all
              ${selectedInterests.includes(interest)
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
              }
            `}
          >
            {interest}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Selected: {selectedInterests.length}/{maxSelections}
        </span>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    </div>
  )
}