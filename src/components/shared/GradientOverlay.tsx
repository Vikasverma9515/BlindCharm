// src/components/shared/GradientOverlay.tsx
export default function GradientOverlay() {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-red-50/30" />
        <div className="absolute inset-0 bg-red-500/5" />
      </div>
    )
  }