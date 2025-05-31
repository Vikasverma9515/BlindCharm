// src/components/shared/Background.tsx
export default function Background() {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base Background */}
        <div className="absolute inset-0 bg-[#fff8f8]" />
  
        {/* Diagonal Lines Pattern */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(45deg, 
                rgba(255, 0, 0, 0.03) 25%, 
                transparent 25%, 
                transparent 75%, 
                rgba(255, 0, 0, 0.03) 75%, 
                rgba(255, 0, 0, 0.03)
              )`,
            backgroundSize: '100px 100px',
            opacity: 0.5
          }}
        />
  
        {/* Soft Gradient Overlays */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 0% 0%, rgba(255, 228, 230, 0.7) 0%, transparent 50%),
              radial-gradient(circle at 100% 100%, rgba(254, 202, 202, 0.7) 0%, transparent 50%)
            `
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
            backgroundImage: `
              linear-gradient(rgba(255, 0, 0, 0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 0, 0, 0.02) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
    )
  }