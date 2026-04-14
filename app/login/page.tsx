'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      isMetaMask?: boolean
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [metamaskLoading, setMetamaskLoading] = useState(false)
  const [error, setError] = useState('')

  const handleMetamaskLogin = async () => {
    setMetamaskLoading(true)
    setError('')

    try {
      if (!window.ethereum) {
        setError('Instala MetaMask para continuar')
        return
      }

      // Request wallet connection
      const { ethers } = await import('ethers')
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()

      // Get nonce from server
      const nonceRes = await fetch('/api/auth/nonce')
      if (!nonceRes.ok) throw new Error('No se pudo obtener el nonce')
      const { nonce } = await nonceRes.json()

      // Build SIWE message
      const { SiweMessage } = await import('siwe')
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: 'Inicia sesión en Ethernodes',
        uri: window.location.origin,
        version: '1',
        chainId: 1,
        nonce,
      })
      const preparedMessage = siweMessage.prepareMessage()

      // Ask user to sign
      const signature = await signer.signMessage(preparedMessage)

      // Verify on server
      const res = await fetch('/api/auth/metamask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message: preparedMessage, signature }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/dashboard/metrics')
      } else {
        setError(data.error || 'Error de autenticación')
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase()
        if (msg.includes('user rejected') || msg.includes('action_rejected') || msg.includes('denied')) {
          setError('Firma cancelada')
        } else if (msg.includes('network') || msg.includes('chain')) {
          setError('Red incorrecta — conéctate a Ethereum Mainnet')
        } else {
          setError('Error al conectar con MetaMask')
        }
      }
    } finally {
      setMetamaskLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/dashboard/metrics')
      } else {
        setError(data.error || 'Credenciales incorrectas')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: '#0d0d0f' }}>
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-100px',
          width: '700px', height: '700px',
          background: 'radial-gradient(circle, rgba(15,80,35,0.7) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-50px', right: '-50px',
          width: '600px', height: '600px',
          background: 'radial-gradient(circle, rgba(15,25,90,0.6) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Login card */}
      <div style={{
        background: '#1A1A1C',
        border: '1px solid #2A2A2D',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <EthernodesLogo />
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#E8E8EA', marginBottom: '8px', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              style={{
                width: '100%',
                background: '#242426',
                border: '1px solid #2A2A2D',
                borderRadius: '10px',
                padding: '13px 16px',
                color: '#E8E8EA',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.target.style.borderColor = '#39FF6B'}
              onBlur={(e) => e.target.style.borderColor = '#2A2A2D'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#E8E8EA', marginBottom: '8px', fontWeight: 500 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  background: '#242426',
                  border: '1px solid #2A2A2D',
                  borderRadius: '10px',
                  padding: '13px 44px 13px 16px',
                  color: '#E8E8EA',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.target.style.borderColor = '#39FF6B'}
                onBlur={(e) => e.target.style.borderColor = '#2A2A2D'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#7A7A82', padding: '4px',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#39FF6B', cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '14px', color: '#E8E8EA', cursor: 'pointer' }}>
              Recordar contraseña
            </label>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(255,60,60,0.1)',
              border: '1px solid rgba(255,60,60,0.3)',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              color: '#ff6b6b',
              fontSize: '14px',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#2a5a38' : '#39FF6B',
              color: loading ? '#7A7A82' : '#0E0E0F',
              border: 'none',
              borderRadius: '10px',
              padding: '14px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = '#4dff7c' }}
            onMouseLeave={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = '#39FF6B' }}
          >
            {loading ? 'Accediendo...' : 'Acceder'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#2A2A2D' }} />
          <span style={{ fontSize: '13px', color: '#7A7A82', whiteSpace: 'nowrap' }}>o continúa con</span>
          <div style={{ flex: 1, height: '1px', background: '#2A2A2D' }} />
        </div>

        {/* MetaMask button */}
        <button
          type="button"
          onClick={handleMetamaskLogin}
          disabled={metamaskLoading}
          style={{
            width: '100%',
            background: metamaskLoading ? 'rgba(246,133,27,0.15)' : 'rgba(246,133,27,0.1)',
            color: metamaskLoading ? '#a0622a' : '#F6851B',
            border: '1px solid rgba(246,133,27,0.35)',
            borderRadius: '10px',
            padding: '13px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: metamaskLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!metamaskLoading) {
              const btn = e.currentTarget
              btn.style.background = 'rgba(246,133,27,0.18)'
              btn.style.borderColor = 'rgba(246,133,27,0.6)'
            }
          }}
          onMouseLeave={(e) => {
            if (!metamaskLoading) {
              const btn = e.currentTarget
              btn.style.background = 'rgba(246,133,27,0.1)'
              btn.style.borderColor = 'rgba(246,133,27,0.35)'
            }
          }}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>🦊</span>
          {metamaskLoading ? 'Conectando...' : 'Conectar con MetaMask'}
        </button>

        {/* Footer links */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <a href="#" style={{ fontSize: '14px', color: '#7A7A82', textDecoration: 'none' }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.color = '#E8E8EA'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.color = '#7A7A82'}
          >
            ¿Contraseña olvidada?
          </a>
        </div>
        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <span style={{ fontSize: '14px', color: '#7A7A82' }}>¿No tiene cuenta? </span>
          <a href="#" style={{ fontSize: '14px', color: '#E8E8EA', fontWeight: 600, textDecoration: 'none' }}>
            Registrarse
          </a>
        </div>
      </div>
    </div>
  )
}

function EthernodesLogo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {/* Arrow-E icon matching the real Ethernodes logo */}
      <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="42" height="42" rx="8" fill="rgba(57,255,107,0.08)" />
        {/* Left arrow → right arrow stacked, forming the E-like mark */}
        <path d="M10 14H28M10 14L16 9M10 14L16 19" stroke="#39FF6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 21H32M32 21L26 16M32 21L26 26" stroke="#39FF6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 28H28M10 28L16 23M10 28L16 33" stroke="#39FF6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{
        fontSize: '42px',
        fontWeight: 800,
        color: '#39FF6B',
        letterSpacing: '-1px',
        fontFamily: 'Inter, system-ui, sans-serif',
        lineHeight: 1,
      }}>
        Ethernodes
      </span>
    </div>
  )
}
