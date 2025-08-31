import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get('name') || 'BlindCharm Lobby'
    const theme = searchParams.get('theme') || 'Dating'
    const count = searchParams.get('count') || '0'
    const description = searchParams.get('description') || 'Connect through personality, not photos'

    // Theme colors
    const themeColors: Record<string, { bg: string; accent: string; emoji: string }> = {
      'Dating': { bg: 'linear-gradient(135deg, #fce7f3 0%, #fdf2f8 100%)', accent: '#ec4899', emoji: '❤️' },
      'Coffee Chat': { bg: 'linear-gradient(135deg, #fef3c7 0%, #fef7cd 100%)', accent: '#d97706', emoji: '☕' },
      'Music Lovers': { bg: 'linear-gradient(135deg, #ede9fe 0%, #f3f4f6 100%)', accent: '#8b5cf6', emoji: '🎵' },
      'Gaming': { bg: 'linear-gradient(135deg, #d1fae5 0%, #f0fdf4 100%)', accent: '#10b981', emoji: '🎮' },
      'Book Club': { bg: 'linear-gradient(135deg, #dbeafe 0%, #f0f9ff 100%)', accent: '#3b82f6', emoji: '📚' },
      'Photography': { bg: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', accent: '#0ea5e9', emoji: '📷' },
      'Art & Design': { bg: 'linear-gradient(135deg, #fce7f3 0%, #fff1f2 100%)', accent: '#ec4899', emoji: '🎨' },
      'Fitness': { bg: 'linear-gradient(135deg, #fed7aa 0%, #ffedd5 100%)', accent: '#ea580c', emoji: '💪' }
    }

    const themeConfig = themeColors[theme] || themeColors['Dating']

    return new ImageResponse(
      (
        <div
          style={{
            background: themeConfig.bg,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative'
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2px, transparent 0)',
              backgroundSize: '50px 50px'
            }}
          />
          
          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 1,
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '60px',
              borderRadius: '32px',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(20px)',
              maxWidth: '900px'
            }}
          >
            {/* Logo/Icon */}
            <div
              style={{
                width: '120px',
                height: '120px',
                background: `linear-gradient(135deg, ${themeConfig.accent}, ${themeConfig.accent}dd)`,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                marginBottom: '32px',
                boxShadow: `0 15px 40px ${themeConfig.accent}40`
              }}
            >
              {themeConfig.emoji}
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '48px',
                fontWeight: '900',
                color: '#1f2937',
                marginBottom: '16px',
                lineHeight: '1.1',
                maxWidth: '700px'
              }}
            >
              Join "{name}"
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '24px',
                color: themeConfig.accent,
                marginBottom: '32px',
                fontWeight: '700'
              }}
            >
              on BlindCharm
            </p>

            {/* Description */}
            <p
              style={{
                fontSize: '18px',
                color: '#4b5563',
                marginBottom: '40px',
                maxWidth: '600px',
                lineHeight: '1.5'
              }}
            >
              {description.length > 80 ? description.substring(0, 80) + '...' : description}
            </p>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: '60px',
                marginBottom: '32px'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '36px',
                    fontWeight: '900',
                    color: themeConfig.accent,
                    marginBottom: '8px'
                  }}
                >
                  {count}
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  Members
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: themeConfig.accent,
                    marginBottom: '8px'
                  }}
                >
                  {theme}
                </div>
                <div
                  style={{
                    fontSize: '16px',
                    color: '#6b7280',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  Theme
                </div>
              </div>
            </div>

            {/* Call to action */}
            <div
              style={{
                fontSize: '20px',
                fontWeight: '700',
                background: `linear-gradient(90deg, ${themeConfig.accent}, ${themeConfig.accent}aa)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              💫 Connect through personality, not photos
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '18px',
              color: '#9ca3af',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🎯 BlindCharm • Real Connections
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    
    // Fallback simple image
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: '800',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎯</div>
          <div>BlindCharm</div>
          <div style={{ fontSize: '24px', fontWeight: '400', marginTop: '10px' }}>
            Connect through personality, not photos
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}