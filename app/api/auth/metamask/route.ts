import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SiweMessage } from 'siwe'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { address, message, signature } = await request.json()

    if (!address || !message || !signature) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // Read the nonce that was set in /api/auth/nonce
    const cookieStore = cookies()
    const nonce = cookieStore.get('siwe_nonce')?.value

    if (!nonce) {
      return NextResponse.json(
        { error: 'Nonce expirado, reintenta' },
        { status: 400 }
      )
    }

    // Verify the SIWE signature
    const siweMessage = new SiweMessage(message)
    const result = await siweMessage.verify({ signature, nonce })

    if (!result.success) {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 401 })
    }

    // Generate session token — same flow as email/password login
    const token = crypto.randomBytes(32).toString('hex')
    const maxAge = 24 * 60 * 60 // 1 day

    // Try to save to Supabase if configured
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const { supabaseAdmin } = await import('@/lib/supabase')
        const db = supabaseAdmin()
        if (db) {
          const walletEmail = `wallet:${address.toLowerCase()}@ethernodes.io`

          let userId: string | undefined
          const { data: existingUser } = await db
            .from('admin_users')
            .select('id')
            .eq('email', walletEmail)
            .single()

          if (existingUser) {
            userId = existingUser.id
          } else {
            const { data: newUser } = await db
              .from('admin_users')
              .insert({ email: walletEmail, password_hash: 'wallet_auth' })
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
      }
    } catch {
      // Continue without DB — cookie-only auth
    }

    const response = NextResponse.json({ success: true })

    // Remove used nonce
    response.cookies.delete('siwe_nonce')

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    })

    response.cookies.set('en_session', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
