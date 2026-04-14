'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart2, Layers, Users, Settings, LogOut,
  ChevronDown, Bell, Menu, X, ExternalLink
} from 'lucide-react'
import { useWallet } from '@/context/WalletContext'

const navItems = [
  { icon: BarChart2, label: 'Métricas', href: '/dashboard/metrics' },
  { icon: Layers, label: 'Validadores', href: '/dashboard/validators' },
  { icon: Users, label: 'Operadores', href: '/dashboard/operators' },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
]

function shortAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { address, isConnected, connect, disconnect, error: walletError } = useWallet()

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0E0E0F' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        minHeight: '100vh',
        background: '#141415',
        borderRight: '1px solid #2A2A2D',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        zIndex: 40,
        transition: 'transform 0.3s ease',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 18px', borderBottom: '1px solid #2A2A2D' }}>
          <img src="/logo.png" alt="Ethernodes" style={{ height: '44px', width: 'auto' }} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
                  background: active ? 'rgba(57,255,107,0.08)' : 'transparent',
                  color: active ? '#39FF6B' : '#7A7A82',
                  cursor: 'pointer', fontSize: '14px', fontWeight: active ? 600 : 400,
                  transition: 'all 0.15s',
                  border: active ? '1px solid rgba(57,255,107,0.15)' : '1px solid transparent',
                }}>
                  <item.icon size={16} />
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #2A2A2D' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px',
            background: '#1A1A1C', marginBottom: '8px',
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #39FF6B, #00B4D8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#0E0E0F',
              flexShrink: 0,
            }}>E</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#E8E8EA' }}>Easyfi Wadz</div>
              <div style={{ fontSize: '11px', color: '#7A7A82' }}>Administrador</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 12px', borderRadius: '8px',
            color: '#7A7A82', cursor: 'pointer', fontSize: '14px',
            background: 'none', border: 'none', width: '100%',
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ff6b6b')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A82')}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{
          height: '60px', borderBottom: '1px solid #2A2A2D',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', background: '#141415',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#7A7A82', fontSize: '13px' }}>app.ethernodes.io</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Wallet button */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              {!isConnected ? (
                <div>
                  <button
                    onClick={connect}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '6px 14px', borderRadius: '20px',
                      background: '#1A1A1C', border: '1px solid #2A2A2D',
                      color: '#E8E8EA', fontSize: '12px', fontWeight: 500,
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3A3A3E')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2A2A2D')}
                  >
                    <span style={{ fontSize: '14px', lineHeight: 1 }}>🦊</span>
                    Conectar Wallet
                  </button>
                  {walletError && (
                    <div style={{
                      position: 'absolute', top: '38px', right: 0,
                      background: '#1A1A1C', border: '1px solid rgba(255,107,107,0.3)',
                      borderRadius: '8px', padding: '8px 12px',
                      fontSize: '12px', color: '#ff6b6b', whiteSpace: 'nowrap', zIndex: 50,
                    }}>
                      {walletError}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setDropdownOpen(o => !o)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      padding: '6px 14px', borderRadius: '20px',
                      background: '#1A1A1C', border: '1px solid rgba(57,255,107,0.3)',
                      color: '#E8E8EA', fontSize: '12px', fontWeight: 500,
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(57,255,107,0.6)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(57,255,107,0.3)')}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#39FF6B', flexShrink: 0, display: 'inline-block' }} />
                    {shortAddress(address!)}
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '38px', right: 0,
                      background: '#1A1A1C', border: '1px solid #2A2A2D',
                      borderRadius: '10px', padding: '4px',
                      zIndex: 50, minWidth: '140px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    }}>
                      <button
                        onClick={() => { disconnect(); setDropdownOpen(false) }}
                        style={{
                          width: '100%', padding: '9px 14px', background: 'none',
                          border: 'none', borderRadius: '7px', textAlign: 'left',
                          fontSize: '13px', color: '#ff6b6b', cursor: 'pointer',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        Desconectar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Status pill */}
            <div style={{
              padding: '6px 14px', borderRadius: '20px',
              background: 'rgba(57,255,107,0.1)',
              border: '1px solid rgba(57,255,107,0.2)',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <span className="live-dot" />
              <span style={{ fontSize: '12px', color: '#39FF6B', fontWeight: 500 }}>En línea</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div style={{ padding: '0' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

