// // lib/voiceChallenges.ts
// export const QUICK_FUN_CHALLENGES = [
//   {
//     prompt: "🎭 Do your best impression of a movie character",
//     timeLimit: 30,
//     category: "impression"
//   },
//   {
//     prompt: "🎵 Hum a song and let me guess what it is",
//     timeLimit: 20,
//     category: "music"
//   },
//   {
//     prompt: "🗣️ Say 'Hello, how are you?' in 3 different accents",
//     timeLimit: 25,
//     category: "accent"
//   },
//   {
//     prompt: "📢 Give me a 20-second motivational pep talk",
//     timeLimit: 30,
//     category: "motivational"
//   },
//   {
//     prompt: "🎪 Tell me a joke using a funny voice",
//     timeLimit: 30,
//     category: "comedy"
//   },
//   {
//     prompt: "🐾 Make 3 different animal sounds and I'll guess them",
//     timeLimit: 20,
//     category: "animals"
//   },
//   {
//     prompt: "🎯 Describe your perfect pizza using only dramatic words",
//     timeLimit: 25,
//     category: "creative"
//   },
//   {
//     prompt: "🎨 Pretend you're a sports commentator describing making coffee",
//     timeLimit: 30,
//     category: "roleplay"
//   },
//   {
//     prompt: "🌟 Give me a weather report in the style of a superhero",
//     timeLimit: 25,
//     category: "roleplay"
//   },
//   {
//     prompt: "🎵 Sing 'Happy Birthday' like you're an opera singer",
//     timeLimit: 20,
//     category: "music"
//   }
// ];

// export const getRandomChallenge = () => {
//   const randomIndex = Math.floor(Math.random() * QUICK_FUN_CHALLENGES.length);
//   return QUICK_FUN_CHALLENGES[randomIndex];
// };


// lib/voiceChallenges.ts
export const QUICK_FUN_CHALLENGES = [
  {
    prompt: "🎭 Do your best impression of a romantic movie character (bonus points if it’s cheesy 💕)",
    timeLimit: 30,
    category: "impression"
  },
  {
    prompt: "🎵 Hum a love song and let me guess it (don’t worry if it’s off-key 😅)",
    timeLimit: 20,
    category: "music"
  },
  {
    prompt: "🗣️ Say 'I like you' in 3 different accents",
    timeLimit: 25,
    category: "accent"
  },
  {
    prompt: "📢 Give me a 20-second pep talk like you’re convincing me to go on a date with you",
    timeLimit: 30,
    category: "motivational"
  },
  {
    prompt: "🎪 Tell me the worst joke you know... but in your cutest or funniest voice",
    timeLimit: 30,
    category: "comedy"
  },
  {
    prompt: "🐾 Make 3 animal sounds you’d use if you were trying to flirt (yep, go wild 🐒🐱🐦)",
    timeLimit: 20,
    category: "animals"
  },
  {
    prompt: "🎯 Describe your dream date… but pretend you’re narrating a dramatic movie trailer 🎬",
    timeLimit: 25,
    category: "creative"
  },
  {
    prompt: "🎨 Pretend you’re a sports commentator describing me walking into our first date",
    timeLimit: 30,
    category: "roleplay"
  },
  {
    prompt: "🌟 Give me a weather report but make it sound like you’re falling in love ☀️💖",
    timeLimit: 25,
    category: "roleplay"
  },
  {
    prompt: "🎵 Sing 'Happy Birthday' to me like I’m your crush (extra charm points 😉)",
    timeLimit: 20,
    category: "music"
  }
];

export const getRandomChallenge = () => {
  const randomIndex = Math.floor(Math.random() * QUICK_FUN_CHALLENGES.length);
  return QUICK_FUN_CHALLENGES[randomIndex];
};
