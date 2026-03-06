'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, ExternalLink, ChevronDown } from 'lucide-react'

const PositionChart = dynamic(() => import('@/components/AprChart'), { ssr: false })

type MainTab = 'overview' | 'performance' | 'risk' | 'activity' | 'position'
type SideTab = 'deposit' | 'withdraw'

function generateDepositGrowth() {
  const data = []
  const start = new Date('2025-12-15')
  const now = new Date('2026-03-06')
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000)
  for (let i = 0; i <= days; i++) {
    const d = new Date(start.getTime() + i * 86400000)
    const label = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    const value = 302550 + (i / days) * 7550 + Math.sin(i * 0.3) * 400
    data.push({ time: label, value })
  }
  return data
}

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'performance', label: 'Performance' },
  { key: 'risk', label: 'Risk' },
  { key: 'activity', label: 'Activity' },
  { key: 'position', label: 'Your Position' },
]

export default function PositionPage() {
  const router = useRouter()
  const [mainTab, setMainTab] = useState<MainTab>('activity')
  const [sideTab, setSideTab] = useState<SideTab>('withdraw')
  const [amountUnit, setAmountUnit] = useState<'wsteth' | 'usd'>('wsteth')
  const chartData = useMemo(() => generateDepositGrowth(), [])

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0F', padding: '24px 32px' }}>

      {/* Back + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => router.push('/dashboard/operators')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A7A82', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#E8E8EA')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#7A7A82')}
        >
          <ArrowLeft size={16} /> Vaults
        </button>
        <span style={{ color: '#2A2A2D' }}>›</span>
        <span style={{ fontSize: '13px', color: '#E8E8EA', fontWeight: 600 }}>Ethernodes WSTETH</span>
      </div>

      {/* Vault identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', flexShrink: 0,
        }}>⬡</div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#E8E8EA' }}>Ethernodes WSTETH</div>
          <div style={{ fontSize: '13px', color: '#7A7A82' }}>wstETH · Ethereum · 3,49% APY</div>
        </div>
      </div>

      {/* Main tabs */}
      <div style={{
        display: 'flex', gap: '2px',
        borderBottom: '1px solid #2A2A2D',
        marginBottom: '24px',
      }}>
        {MAIN_TABS.map(tab => (
          <button key={tab.key} onClick={() => setMainTab(tab.key)} style={{
            padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: mainTab === tab.key ? 600 : 400,
            color: mainTab === tab.key ? '#E8E8EA' : '#7A7A82',
            borderBottom: mainTab === tab.key ? '2px solid #39FF6B' : '2px solid transparent',
            marginBottom: '-1px',
            transition: 'all 0.15s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content: two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* LEFT — Activity tab */}
        <div>
          {/* Deposit summary */}
          <div style={{
            background: '#1A1A1C', border: '1px solid #2A2A2D',
            borderRadius: '12px', padding: '24px', marginBottom: '16px',
          }}>
            <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Mi Depósito (wstETH)
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: '#E8E8EA', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                  {amountUnit === 'wsteth' ? '169,00' : '$302.550,00'}
                </div>
                <div style={{ fontSize: '13px', color: '#7A7A82', marginTop: '4px' }}>
                  {amountUnit === 'wsteth' ? '≈ $302.550,00' : '169,00 wstETH'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {/* Unit toggle */}
                <div style={{ display: 'flex', background: '#141415', borderRadius: '8px', border: '1px solid #2A2A2D', overflow: 'hidden' }}>
                  {(['wsteth', 'usd'] as const).map(u => (
                    <button key={u} onClick={() => setAmountUnit(u)} style={{
                      padding: '6px 12px', border: 'none', cursor: 'pointer',
                      background: amountUnit === u ? 'rgba(59,130,246,0.2)' : 'transparent',
                      color: amountUnit === u ? '#3B82F6' : '#7A7A82',
                      fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                    }}>
                      {u === 'wsteth' ? 'wstETH' : 'USD'}
                    </button>
                  ))}
                </div>
                {/* Timeframe */}
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', background: '#141415', border: '1px solid #2A2A2D',
                  borderRadius: '8px', color: '#E8E8EA', fontSize: '12px', cursor: 'pointer',
                }}>
                  3 meses <ChevronDown size={12} />
                </button>
              </div>
            </div>

            {/* Area chart */}
            <PositionChart data={chartData} color="#3B82F6" height={140} />
          </div>

          {/* Transactions table */}
          <div style={{
            background: '#1A1A1C', border: '1px solid #2A2A2D',
            borderRadius: '12px', overflow: 'hidden',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A2D' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#E8E8EA' }}>Tus transacciones</span>
            </div>

            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '180px 140px 1fr 140px',
              padding: '10px 20px', borderBottom: '1px solid #1F1F21',
            }}>
              {['Fecha ↓', 'Tipo', 'Cantidad', 'Transacción'].map((h, i) => (
                <span key={i} style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '180px 140px 1fr 140px',
              padding: '14px 20px', alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', color: '#9A9AA2', fontVariantNumeric: 'tabular-nums' }}>
                2025-12-15 20:07:59
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 600,
                color: '#3B82F6',
                background: 'rgba(59,130,246,0.1)',
                borderRadius: '6px', padding: '3px 10px',
                display: 'inline-block',
              }}>
                Vault Deposit
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', flexShrink: 0,
                }}>⬡</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8EA', fontVariantNumeric: 'tabular-nums' }}>
                    169,00 wstETH
                  </div>
                  <div style={{ fontSize: '11px', color: '#7A7A82' }}>$302.550,00</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: '#3B82F6', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
                  0xa935...7294
                </span>
                <ExternalLink size={12} color="#3B82F6" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Deposit/Withdraw panel */}
        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', padding: '20px',
          alignSelf: 'start',
          position: 'sticky', top: '80px',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#141415', borderRadius: '10px', padding: '3px', marginBottom: '20px' }}>
            {(['deposit', 'withdraw'] as const).map(t => (
              <button key={t} onClick={() => setSideTab(t)} style={{
                flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                background: sideTab === t ? '#1A1A1C' : 'transparent',
                color: sideTab === t ? '#E8E8EA' : '#7A7A82',
                fontSize: '13px', fontWeight: sideTab === t ? 600 : 400,
                transition: 'all 0.15s',
                boxShadow: sideTab === t ? '0 1px 3px rgba(0,0,0,0.3)' : 'none',
              }}>
                {t === 'deposit' ? 'Depositar' : 'Retirar'}
              </button>
            ))}
          </div>

          {sideTab === 'withdraw' ? (
            <>
              {/* Withdraw input */}
              <div style={{
                background: '#141415', border: '1px solid #2A2A2D',
                borderRadius: '10px', padding: '14px 16px', marginBottom: '8px',
              }}>
                <div style={{ fontSize: '11px', color: '#7A7A82', marginBottom: '8px' }}>Retirar wstETH</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <input
                    type="text"
                    defaultValue="0.00"
                    style={{
                      background: 'none', border: 'none', outline: 'none',
                      fontSize: '24px', fontWeight: 700, color: '#E8E8EA',
                      width: '100%', fontVariantNumeric: 'tabular-nums',
                    }}
                  />
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', flexShrink: 0,
                  }}>⬡</div>
                </div>
                <div style={{ fontSize: '12px', color: '#7A7A82', marginTop: '4px' }}>$0</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#7A7A82' }}>
                  169,00 wstETH{' '}
                  <span style={{ color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>MAX</span>
                </span>
              </div>

              {/* Lock notice */}
              <div style={{
                background: 'rgba(251,146,60,0.08)',
                border: '1px solid rgba(251,146,60,0.35)',
                borderRadius: '10px', padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>🔒</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#FB923C' }}>Posición bloqueada</span>
                </div>
                <div style={{ fontSize: '12px', color: '#FED7AA', lineHeight: 1.6 }}>
                  Tu depósito está bloqueado durante <strong>9 meses</strong> desde la fecha de depósito.
                </div>
                <div style={{ fontSize: '12px', color: '#FED7AA', marginTop: '8px', lineHeight: 1.6 }}>
                  Fecha de desbloqueo: <strong style={{ color: '#FB923C' }}>15 de septiembre de 2026</strong>
                </div>
                <div style={{ fontSize: '12px', color: '#9A6A50', marginTop: '6px' }}>
                  Los retiros estarán disponibles a partir de esa fecha.
                </div>
              </div>

              {/* Summary */}
              <div style={{
                background: '#141415', border: '1px solid #2A2A2D',
                borderRadius: '10px', padding: '16px',
              }}>
                {[
                  { label: 'Red', value: '◆ Ethereum' },
                  { label: 'Depósito (wstETH)', value: '169,00' },
                  { label: 'APY', value: '3,49%' },
                  { label: 'Ganancia mensual est.', value: '$879,85' },
                  { label: 'Ganancia anual est.', value: '$10.558,20' },
                ].map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 0',
                    borderBottom: i < 4 ? '1px solid #1F1F21' : 'none',
                  }}>
                    <span style={{ fontSize: '12px', color: '#7A7A82' }}>{row.label}</span>
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      color: row.label === 'APY' ? '#39FF6B' : '#E8E8EA',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Deposit tab placeholder */
            <div style={{
              background: '#141415', border: '1px solid #2A2A2D',
              borderRadius: '10px', padding: '32px', textAlign: 'center',
              color: '#7A7A82', fontSize: '13px',
            }}>
              Los depósitos adicionales están disponibles bajo solicitud.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
