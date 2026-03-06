'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ChevronDown, MoreHorizontal } from 'lucide-react'

const MiniChart = dynamic(() => import('@/components/AprChart'), { ssr: false })

function generateGrowthData() {
  const data = []
  const start = new Date('2025-12-15')
  const now = new Date('2026-03-06')
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000)
  for (let i = 0; i <= days; i++) {
    const d = new Date(start.getTime() + i * 86400000)
    const label = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    const value = 295000 + (i / days) * 7550 + Math.sin(i * 0.4) * 800
    data.push({ time: label, value })
  }
  return data
}

export default function OperatorsPage() {
  const router = useRouter()
  const [apyMode, setApyMode] = useState<'apy' | 'rewards'>('apy')
  const chartData = useMemo(() => generateGrowthData(), [])

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0F', padding: '28px 32px' }}>

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#E8E8EA', marginBottom: '4px' }}>
          Vaults
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: '#7A7A82' }}>Tus depósitos</span>
          <span style={{ fontSize: '13px', color: '#39FF6B' }}>›</span>
          <button style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: '#1A1A1C', border: '1px solid #2A2A2D',
            borderRadius: '6px', padding: '4px 10px',
            color: '#E8E8EA', fontSize: '12px', cursor: 'pointer',
          }}>
            All chains <ChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', marginBottom: '24px' }}>

        {/* Deposit value + mini chart */}
        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', padding: '24px',
        }}>
          <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Total Depósitos
          </div>
          <div style={{ fontSize: '36px', fontWeight: 700, color: '#39FF6B', marginBottom: '4px', fontVariantNumeric: 'tabular-nums' }}>
            $302,988.27
          </div>
          <div style={{ fontSize: '13px', color: '#7A7A82', marginBottom: '16px' }}>
            169,323 wstETH · Ethereum
          </div>
          <MiniChart data={chartData} color="#3B82F6" height={70} />
        </div>

        {/* Net APY card */}
        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', padding: '24px',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Net APY
            </div>
            <div style={{ fontSize: '48px', fontWeight: 700, color: '#E8E8EA', lineHeight: 1, marginBottom: '4px' }}>
              6,78%
            </div>
            <div style={{ fontSize: '12px', color: '#7A7A82' }}>APR efectivo actual</div>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '20px' }}>
            {(['apy', 'rewards'] as const).map(mode => (
              <button key={mode} onClick={() => setApyMode(mode)} style={{
                flex: 1, padding: '7px 0', borderRadius: '8px', cursor: 'pointer',
                border: '1px solid',
                borderColor: apyMode === mode ? 'rgba(57,255,107,0.4)' : '#2A2A2D',
                background: apyMode === mode ? 'rgba(57,255,107,0.1)' : 'transparent',
                color: apyMode === mode ? '#39FF6B' : '#7A7A82',
                fontSize: '12px', fontWeight: 600,
                transition: 'all 0.15s',
              }}>
                {mode === 'apy' ? 'APY' : '✦ Rewards'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#1A1A1C', border: '1px solid #2A2A2D',
        borderRadius: '12px', overflow: 'hidden',
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '100px 220px 200px 100px 120px 80px 40px',
          padding: '12px 20px',
          borderBottom: '1px solid #2A2A2D',
        }}>
          {['Red', 'Vault', 'Depósitos', 'Curador', 'Exposición', 'APY', ''].map((h, i) => (
            <span key={i} style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table row — clickable */}
        <div
          onClick={() => router.push('/dashboard/operators/position')}
          style={{
            display: 'grid',
            gridTemplateColumns: '100px 220px 200px 100px 120px 80px 40px',
            padding: '16px 20px',
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#242426')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          {/* Network */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <EthDiamond />
            <span style={{ fontSize: '13px', color: '#E8E8EA' }}>Ethereum</span>
          </div>

          {/* Vault */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', flexShrink: 0,
            }}>⬡</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8EA' }}>Ethernodes WSTETH</div>
              <div style={{ fontSize: '11px', color: '#7A7A82' }}>wstETH</div>
            </div>
          </div>

          {/* Deposits */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8EA', fontVariantNumeric: 'tabular-nums' }}>
              169,323 wstETH
            </div>
            <div style={{ fontSize: '11px', color: '#7A7A82' }}>$302.988,27</div>
          </div>

          {/* Curator */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #39FF6B, #00B4D8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', fontWeight: 700, color: '#0E0E0F',
            }}>E</div>
          </div>

          {/* Exposure */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {['#3B82F6', '#8B5CF6', '#39FF6B'].map((color, i) => (
              <div key={i} style={{
                width: '22px', height: '22px', borderRadius: '50%',
                background: color,
                border: '2px solid #1A1A1C',
                marginLeft: i === 0 ? 0 : '-6px',
              }} />
            ))}
          </div>

          {/* APY */}
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#39FF6B' }}>
            6,78%
          </div>

          {/* Menu */}
          <button
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A7A82', padding: '4px' }}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

function EthDiamond() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="6" fill="rgba(99,102,241,0.15)" />
      <path d="M12 4L7 12L12 14.5L17 12L12 4Z" fill="#6366F1" opacity="0.9" />
      <path d="M12 14.5L7 12L12 20L17 12L12 14.5Z" fill="#6366F1" opacity="0.6" />
    </svg>
  )
}
