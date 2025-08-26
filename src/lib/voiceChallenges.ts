// lib/voiceChallenges.ts
export const QUICK_FUN_CHALLENGES = [
  {
    prompt: "🎭 Do your best impression of a movie character",
    timeLimit: 30,
    category: "impression"
  },
  {
    prompt: "🎵 Hum a song and let me guess what it is",
    timeLimit: 20,
    category: "music"
  },
  {
    prompt: "🗣️ Say 'Hello, how are you?' in 3 different accents",
    timeLimit: 25,
    category: "accent"
  },
  {
    prompt: "📢 Give me a 20-second motivational pep talk",
    timeLimit: 30,
    category: "motivational"
  },
  {
    prompt: "🎪 Tell me a joke using a funny voice",
    timeLimit: 30,
    category: "comedy"
  },
  {
    prompt: "🐾 Make 3 different animal sounds and I'll guess them",
    timeLimit: 20,
    category: "animals"
  },
  {
    prompt: "🎯 Describe your perfect pizza using only dramatic words",
    timeLimit: 25,
    category: "creative"
  },
  {
    prompt: "🎨 Pretend you're a sports commentator describing making coffee",
    timeLimit: 30,
    category: "roleplay"
  },
  {
    prompt: "🌟 Give me a weather report in the style of a superhero",
    timeLimit: 25,
    category: "roleplay"
  },
  {
    prompt: "🎵 Sing 'Happy Birthday' like you're an opera singer",
    timeLimit: 20,
    category: "music"
  }
];

export const getRandomChallenge = () => {
  const randomIndex = Math.floor(Math.random() * QUICK_FUN_CHALLENGES.length);
  return QUICK_FUN_CHALLENGES[randomIndex];
};