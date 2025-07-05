// src/components/shared/BackgroundPattern.tsx
export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-white to-purple-50" />
      
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            {/* Soft dot pattern */}
            <pattern
              id="soft-dots"
              width={60}
              height={60}
              patternUnits="userSpaceOnUse"
            >
              <circle cx="30" cy="30" r="1.5" fill="rgba(219, 39, 119, 0.1)" />
            </pattern>
            
            {/* Subtle heart shapes */}
            <pattern
              id="heart-pattern"
              width={120}
              height={120}
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M60,25 C60,15 50,10 45,15 C40,10 30,15 30,25 C30,35 45,50 60,65 C75,50 90,35 90,25 C90,15 80,10 75,15 C70,10 60,15 60,25 Z"
                fill="rgba(236, 72, 153, 0.03)"
                opacity="0.5"
              />
            </pattern>
          </defs>
          
          {/* Apply the dot pattern */}
          <rect
            width="100%"
            height="100%"
            fill="url(#soft-dots)"
          />
          
          {/* Apply the heart pattern with lower opacity */}
          <rect
            width="100%"
            height="100%"
            fill="url(#heart-pattern)"
            opacity="0.3"
          />
        </svg>
      </div>
      
      {/* Soft radial gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-pink-100/20" />
    </div>
  )
}