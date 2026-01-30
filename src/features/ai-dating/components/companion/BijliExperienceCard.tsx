'use client'

import { motion } from 'framer-motion'
import { Sparkles, Flame, Heart, ShieldCheck, Zap, Star, Trophy, Moon, MessageCircle } from 'lucide-react'

interface BijliExperienceCardProps {
  username?: string
  loyaltyLevel?: 'spark' | 'steady' | 'bestie' | 'ride_or_die'
  currentMood?: 'roast' | 'hype' | 'care'
  streakDays?: number
  highlight?: {
    quote: string
    caption: string
  }
  vibePackLabel?: string
  vibeMeme?: string
  vibeBuzzwords?: string[]
  heroStat?: {
    label: string
    value: string
  }
  onOpenMemories?: () => void
  onToggleTone?: () => void
}

const loyaltyMeta: Record<string, { badge: string; gradient: string; accent: string }> = {
  spark: {
    badge: '⚡ Spark Starter',
    gradient: 'from-[#FEE140] via-[#FA709A] to-[#D4AF37]',
    accent: 'bg-[#FA709A]/20 text-[#FA709A]'
  },
  steady: {
    badge: '🔥 Loyal Lit',
    gradient: 'from-[#FEE140] via-[#FF6363] to-[#F53844]',
    accent: 'bg-[#FF6363]/20 text-[#FF6363]'
  },
  bestie: {
    badge: '💖 Ride Together',
    gradient: 'from-[#74EBD5] via-[#ACB6E5] to-[#8EC5FC]',
    accent: 'bg-[#8EC5FC]/20 text-[#8EC5FC]'
  },
  ride_or_die: {
    badge: '👑 Drama Royalty',
    gradient: 'from-[#FBAB7E] via-[#F7CE68] to-[#F6D365]',
    accent: 'bg-[#FBAB7E]/20 text-[#FBAB7E]'
  }
}

const moodPalette: Record<'roast' | 'hype' | 'care', { label: string; icon: JSX.Element; glow: string; chip: string }> = {
  roast: {
    label: 'Roast Mode',
    icon: <Flame className="w-4 h-4" />,
    glow: 'shadow-[0_0_60px_-10px_rgba(244,114,182,0.65)]',
    chip: 'bg-[#FF4F79]/20 text-[#FF4F79] border border-[#FF4F79]/40'
  },
  hype: {
    label: 'Hype Mode',
    icon: <Zap className="w-4 h-4" />,
    glow: 'shadow-[0_0_60px_-10px_rgba(56,189,248,0.65)]',
    chip: 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40'
  },
  care: {
    label: 'Care Mode',
    icon: <Heart className="w-4 h-4" />,
    glow: 'shadow-[0_0_60px_-10px_rgba(137,84,255,0.65)]',
    chip: 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40'
  }
}

export function BijliExperienceCard({
  username = 'You',
  loyaltyLevel = 'spark',
  currentMood = 'hype',
  streakDays = 3,
  highlight = {
    quote: '“Tere vibe se bijli chilam ho gayi – full paisa vasool!”',
    caption: 'Bijli after your last banter'
  },
  vibePackLabel = 'Festival Dhamaka',
  vibeMeme = 'Govinda dance loop of the day',
  vibeBuzzwords = ['scene solid', 'main character', 'delulu but legendary'],
  heroStat = { label: 'Chat Streak', value: 'Day 4' },
  onOpenMemories,
  onToggleTone
}: BijliExperienceCardProps) {
  const loyalty = loyaltyMeta[loyaltyLevel]
  const mood = moodPalette[currentMood]

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
      className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${loyalty.gradient} p-[1px] ${mood.glow}`}
    >
      <div className="relative h-full w-full rounded-[1.4rem] bg-[#0B0F19]/95 p-6 backdrop-blur">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />

        <div className="relative z-10 flex flex-col gap-6">
          <header className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60 font-blindcharm-tech">
                <Sparkles className="w-4 h-4 text-[#FFD166]" />
                Bijli Experience
              </div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white font-blindcharm-brand">Hey {username}, mood sync ready!</h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${mood.chip}`}>
                  {mood.icon}
                  {mood.label}
                </span>
              </div>
            </div>
            <button
              onClick={onToggleTone}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <ShieldCheck className="h-4 w-4 text-[#FFD166] group-hover:rotate-6 transition" />
              Tone Toggle
            </button>
          </header>

          <section className="grid gap-5 rounded-2xl border border-white/5 bg-white/[0.03] p-4 md:grid-cols-[1.4fr_1fr]">
            <div className="flex flex-col gap-4">
              <div className="relative overflow-hidden rounded-2xl bg-[#131927] p-4">
                <div className="absolute -top-10 right-6 h-32 w-32 rounded-full bg-[#FF4F79]/10 blur-3xl" />
                <div className="absolute -bottom-10 left-2 h-28 w-28 rounded-full bg-[#38BDF8]/10 blur-3xl" />
                <div className="relative flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
                    <MessageCircle className="h-4 w-4 text-[#38BDF8]" />
                    Fresh highlight
                  </div>
                  <p className="text-base font-semibold text-white/90 leading-6">{highlight.quote}</p>
                  <span className="text-xs text-white/50">{highlight.caption}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#131927] px-4 py-3 text-sm text-white/70">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white">
                  <Trophy className="h-4 w-4 text-[#FFD166]" />
                  {loyalty.badge}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
                  <Star className="h-4 w-4 text-[#FF4F79]" />
                  {heroStat.label}: {heroStat.value}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-white/70">
                  <Moon className="h-4 w-4 text-[#8B5CF6]" />
                  Streak: {streakDays} nights running
                </span>
              </div>
            </div>

            <aside className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#131927] p-4">
              <div className="flex items-center justify-between text-xs text-white/60 font-blindcharm-tech">
                <span>Daily vibe pack</span>
                <span className="inline-flex items-center gap-1 text-[#FFD166]"><Sparkles className="h-3 w-3" />Fresh drop</span>
              </div>
              <h3 className="text-lg font-semibold text-white/90">{vibePackLabel}</h3>
              <p className="text-xs text-white/60">{vibeMeme}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {vibeBuzzwords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white/70"
                  >
                    <Zap className="h-3 w-3 text-[#38BDF8]" />
                    {word}
                  </span>
                ))}
              </div>
              <button
                onClick={onOpenMemories}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#FFD166] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0B0F19] transition hover:-translate-y-0.5"
              >
                <Heart className="h-4 w-4" />
                View Memories
              </button>
            </aside>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FFD166]" />
              Bijli remembers your inside jokes and cheer moments. Speak from the heart, she got you.
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <ShieldCheck className="h-4 w-4 text-[#8EC5FC]" />
              Tone safe toggle is always one tap away.
            </div>
          </footer>
        </div>
      </div>
    </motion.div>
  )
}
