// src/components/shared/Background.tsx
export default function Background() {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base Background */}
        <div className="absolute inset-0 bg-[#fff8f8]" />
  
        {/* Subtle Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(255, 0, 0, 0.02)',
            backgroundSize: '100px 100px',
            opacity: 0.5
          }}
        />
  
        {/* Soft Overlays */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(255, 228, 230, 0.3)'
          }}
        />
  
        {/* Animated Gradient Blobs */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] animate-blob">
          <div className="absolute inset-0 bg-red-100/30 rounded-full blur-3xl transform-gpu" />
        </div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] animate-blob animation-delay-2000">
          <div className="absolute inset-0 bg-pink-100/20 rounded-full blur-3xl transform-gpu" />
        </div>
        <div className="absolute top-1/2 left-1/2 w-[700px] h-[700px] animate-blob animation-delay-4000">
          <div className="absolute inset-0 bg-red-50/20 rounded-full blur-3xl transform-gpu" />
        </div>
  
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(255, 0, 0, 0.01)',
            backgroundSize: '40px 40px'
          }}
        />
      </div>
    )
  }