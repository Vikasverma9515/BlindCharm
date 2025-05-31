// src/components/shared/GradientOverlay.tsx
export default function GradientOverlay() {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-red-50/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-transparent to-red-500/5" />
      </div>
    )
  }