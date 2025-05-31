import FloatingShapes from "./FloatingShapes"

// src/components/shared/BackgroundPattern.tsx
export default function BackgroundPattern() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      <svg
        className="absolute inset-0 w-full h-full stroke-gray-200 [mask-image:radial-gradient(circle, white, transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="light-pattern"
            width={100}
            height={100}
            patternUnits="userSpaceOnUse"
          >
            <path d="M50 100V0.5M0.5 0.5H100" fill="none" stroke="rgba(220, 220, 220, 0.7)" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          strokeWidth={0}
          fill="url(#light-pattern)"
        />
      </svg>
    </div>
  )
}