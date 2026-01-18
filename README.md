# BlindCharm

**Charm comes first.**

BlindCharm is an **AI-First Social Discovery Platform** that reimagines online connection. By leveraging generative AI, spatial computing, and voice verification, we've moved beyond the "swipe loop" to create a universe where chemistry is authentic, and identity is expressive.

![BlindCharm Hero](/public/HeroAvatar/a1.svg)

## 🚀 The AI-First Experience

### 🦸 Hero Avatars
**Be who you are, not just what you look like.**
BlindCharm replaces the pressure of "perfect selfies" with **Hero Avatars**—generative 3D identities that reflect your vibe, style, and personality.
- **Generative Identity**: Create a unique digital persona that evolves with you.
- **Privacy by Design**: Connect based on energy and conversation first.

### 🌌 Galaxy View
**Explore a universe of matches.**
Say goodbye to the flat list. **Galaxy View** is an immersive, spatial interface where potential matches orbit you based on compatibility.
- **Spatial UI**: Navigate a 3D cosmos of profiles.
- **AI Sorting**: Intelligent algorithms float the most compatible "stars" closer to your orbit using deep learning analysis of personality traits and voice patterns.

### ⚡ Verified Vibes
**Real people. Real chemistry.**
We combine AI safety with human authenticity.
- **Voice-First**: Profiles come alive with voice prompts. Hear the laugh, the tone, and the nuance before you match.
- **100% Verified**: Mandatory phone verification and AI-driven anti-catfish tech ensure every star in your galaxy is a real person.

## 🧬 Project Evolution

### Phase 1: The Hypothesis
Initially, we built a "Blind Dating" experiment. The core thesis was simple: *Remove visual bias to foster deeper emotional connections.* We used blurring filters and strict "chat-to-reveal" mechanics. While effective for privacy, it felt restrictive.

### Phase 2: The AI Pivot
We realized that **hiding** isn't the same as **connecting**. We didn't want users to be invisible; we wanted them to be *more* visible than a static photo allows.
- **From Blur to Avatar**: Instead of blurring faces, we introduced Hero Avatars to allow expressive anonymity.
- **From List to Galaxy**: We replaced the static feed with a dynamic, AI-curated 3D environment.
- **From "Blind" to "Insight"**: The "blind" aspect evolved into "insight-first"—using AI to surface deeper compatibility signals (voice, interests, mood) before the physical reveal.

**BlindCharm is no longer just about what you can't see—it's about seeing the person, not the pixel.**

## 🛠 Tech Stack

**Frontend**
- **Core**: [Next.js](https://nextjs.org/) (React 18+, App Router)
- **Styling**: TailwindCSS, Framer Motion (Complex Animations)
- **3D Engine**: Three.js, React Three Fiber (Galaxy View)

**Backend & AI**
- **Infrastructure**: [Supabase](https://supabase.com/) (Auth, Database, Realtime)
- **AI Processing**: Python-based microservices for match scoring (see `scripts/`)
- **Verification**: Face-api.js & TensorFlow.js for client-side liveness checks

**Mobile**
- **Native Wrapper**: Capacitor (iOS & Android)

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Vikasverma9515/BlindCharm.git
   cd BlindCharm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## 🤝 Contributing
BlindCharm is a living project. Check out our [implementation plan](docs/IMPLEMENTATION_SUMMARY.md) to see what we're building next.

## 📄 License
This project is private and proprietary.
