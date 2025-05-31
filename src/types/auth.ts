// src/types/auth.ts
export interface User {
    id: string
    email: string
    user_metadata: {
      full_name?: string
      avatar_url?: string
    }
    created_at: string
  }
  
  // Update the AuthContextType in AuthProvider.tsx
  interface AuthContextType {
    user: User | null
    loading: boolean
    error: string | null
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
  }