import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ethernodes.io'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin1234!'

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json()

    // Simple credential check (no DB needed for single admin)
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Credenciales incorrectas' },
        { status: 401 }
      )
    }

    // Generate session token
    const token = crypto.randomBytes(32).toString('hex')
    const maxAge = remember ? 30 * 24 * 60 * 60 : 24 * 60 * 60 // 30 days or 1 day

    // Try to save to Supabase if configured
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { supabaseAdmin } = await import('@/lib/supabase')
        const db = supabaseAdmin()
        if (!db) throw new Error('No DB')

        // Get or create admin user
        let userId: string
        const { data: existingUser } = await db
          .from('admin_users')
          .select('id')
          .eq('email', email)
          .single()
        
        if (existingUser) {
          userId = existingUser.id
        } else {
          const { data: newUser } = await db
            .from('admin_users')
            .insert({ email, password_hash: 'env_controlled' })
            .select('id')
            .single()
          userId = newUser?.id
        }

        if (userId) {
          await db.from('sessions').insert({
            user_id: userId,
            token,
            expires_at: new Date(Date.now() + maxAge * 1000).toISOString(),
          })
        }
      }
    } catch (dbError) {
      // Continue without DB - use cookie-only auth
      console.log('DB not available, using cookie-only auth')
    }

    const response = NextResponse.json({ success: true })
    
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    })

    // Also store a simple flag for client-side
    response.cookies.set('en_session', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
