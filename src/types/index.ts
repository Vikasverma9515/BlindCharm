// src/types/index.ts
export const INTEREST_CATEGORIES = [
    'Music', 'Movies', 'Gaming', 'Reading', 'Travel',
    'Sports', 'Cooking', 'Art', 'Technology', 'Fitness',
    'Photography', 'Dancing', 'Writing', 'Fashion', 'Nature'
  ] as const
  
  export type Interest = typeof INTEREST_CATEGORIES[number]


  // src/types/index.ts
export interface User {
  id: string
  email: string
  full_name: string
  username: string
  profile_complete: boolean
  created_at: string
  updated_at: string
}

export interface Session {
  user: User
  access_token: string
  refresh_token: string
}
export interface AuthContextType {
  user: User | null;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  // other properties
}