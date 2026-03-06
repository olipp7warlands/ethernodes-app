import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  
  if (!token) return null
  
  const db = supabaseAdmin()
  if (!db) return null

  const { data: session } = await db
    .from('sessions')
    .select('*, admin_users(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    return null
  }
  return session
}
