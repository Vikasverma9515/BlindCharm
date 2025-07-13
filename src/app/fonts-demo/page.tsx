export default function FontsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4 blindcharm-logo">
            BlindCharm
          </h1>
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4 blindcharm-heading">
            Font Showcase
          </h2>
          <p className="text-gray-600 dark:text-gray-300 font-body">
            Explore the beautiful typography that makes BlindCharm unique
          </p>
        </div>

        {/* BlindCharm Brand Fonts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white blindcharm-heading">
            BlindCharm Brand Typography
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Brand Logo (Dancing Script)</h3>
              <div className="text-6xl blindcharm-logo mb-2">BlindCharm</div>
              <div className="text-4xl blindcharm-logo mb-2">Find Your Match</div>
              <div className="text-2xl romantic-text">Love is in the air ✨</div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Elegant Headings (Playfair Display)</h3>
              <div className="text-4xl blindcharm-heading mb-2">Discover Your Perfect Match</div>
              <div className="text-3xl blindcharm-heading mb-2">Connect Through Personality</div>
              <div className="text-2xl blindcharm-heading">Anonymous Dating Reimagined</div>
            </div>
          </div>
        </div>

        {/* All Font Families */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inter - Main Body Font */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Inter - Main Body Font
            </h3>
            <div className="space-y-3">
              <p className="text-lg">Clean and readable for all content</p>
              <p className="text-base">Perfect for user interfaces and long-form text</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Excellent legibility at all sizes</p>
            </div>
          </div>

          {/* Poppins - UI Elements */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-ui">
              Poppins - UI Elements
            </h3>
            <div className="space-y-3 font-ui">
              <p className="text-lg font-medium">Modern geometric feel</p>
              <p className="text-base">Great for buttons and navigation</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-rose-500 text-white rounded-full text-sm font-medium">
                  Join Now
                </button>
                <button className="px-4 py-2 border border-rose-500 text-rose-500 rounded-full text-sm font-medium">
                  Learn More
                </button>
              </div>
            </div>
          </div>

          {/* Nunito - Body Text */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-body">
              Nunito - Friendly Body Text
            </h3>
            <div className="space-y-3 font-body">
              <p className="text-lg">Friendly and approachable</p>
              <p className="text-base">Perfect for descriptions and content</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Warm and welcoming feel</p>
            </div>
          </div>

          {/* Quicksand - Friendly UI */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-friendly">
              Quicksand - Friendly UI
            </h3>
            <div className="space-y-3 font-friendly">
              <p className="text-lg">Rounded and modern</p>
              <p className="text-base">Great for casual interactions</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Playful yet professional</p>
            </div>
          </div>

          {/* Comfortaa - Comfortable Reading */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-comfort">
              Comfortaa - Comfortable Reading
            </h3>
            <div className="space-y-3 font-comfort">
              <p className="text-lg">Soft and comfortable</p>
              <p className="text-base">Easy on the eyes</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Perfect for long reading sessions</p>
            </div>
          </div>

          {/* Raleway - Elegant Text */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white elegant-text">
              Raleway - Elegant Text
            </h3>
            <div className="space-y-3 elegant-text">
              <p className="text-lg">Sophisticated and refined</p>
              <p className="text-base">Perfect for premium content</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adds elegance to any design</p>
            </div>
          </div>

          {/* Montserrat - Bold Headings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-bold">
              Montserrat - Bold Headings
            </h3>
            <div className="space-y-3 font-bold">
              <p className="text-lg font-semibold">Strong and impactful</p>
              <p className="text-base font-medium">Great for headlines</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">Commands attention</p>
            </div>
          </div>

          {/* Dancing Script - Brand & Romance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white font-brand">
              Dancing Script - Brand & Romance
            </h3>
            <div className="space-y-3 font-brand">
              <p className="text-2xl text-rose-500">Romantic and elegant</p>
              <p className="text-lg text-rose-400">Perfect for special moments</p>
              <p className="text-base text-rose-300">Adds personality and charm</p>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white blindcharm-heading">
            Usage Examples
          </h2>
          <div className="space-y-8">
            {/* Dating Card Example */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-2xl font-semibold mb-2 blindcharm-heading">Coffee Chat Lobby</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 font-body">
                Join fellow coffee enthusiasts for meaningful conversations over your favorite brew.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 font-ui">5 participants waiting</span>
                <button className="px-6 py-2 bg-rose-500 text-white rounded-full font-ui font-medium hover:bg-rose-600 transition-colors">
                  Join Lobby
                </button>
              </div>
            </div>

            {/* Profile Example */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="text-center">
                <h3 className="text-3xl mb-2 blindcharm-logo">Sarah, 28</h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 font-body">
                  "I believe in meaningful connections and authentic conversations."
                </p>
                <div className="flex justify-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-friendly">Coffee Lover</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-friendly">Book Enthusiast</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-friendly">Yoga</span>
                </div>
                <button className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-ui font-semibold hover:from-rose-600 hover:to-pink-600 transition-all">
                  Start Conversation
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white blindcharm-heading">
            BlindCharm Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-500 rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium font-ui">Primary</p>
              <p className="text-xs text-gray-500">#F43F5E</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-rose-600 rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium font-ui">Primary Dark</p>
              <p className="text-xs text-gray-500">#E11D48</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-amber-100 rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium font-ui">Secondary</p>
              <p className="text-xs text-gray-500">#FEF3C7</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-800 rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium font-ui">Neutral</p>
              <p className="text-xs text-gray-500">#1F2937</p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-pink-500 rounded-lg mx-auto mb-2 shadow-lg"></div>
              <p className="text-sm font-medium font-ui">Gradient</p>
              <p className="text-xs text-gray-500">Rose to Pink</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}