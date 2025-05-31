// src/lib/auth/userManagement.ts
import { supabase } from '@/lib/supabase'

export async function createUser(userData: {
  email: string
  password: string
  name: string
}) {
  // Create auth user in Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
    options: {
      data: {
        full_name: userData.name
      }
    }
  })

  if (authError) throw authError

  // Create user record in your database
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: authData.user!.id,
      email: userData.email,
      name: userData.name
    })

  if (dbError) throw dbError

  return authData.user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users (
        name,
        email
      )
    `)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}