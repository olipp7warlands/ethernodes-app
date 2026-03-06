'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ArrowLeft, ExternalLink, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const PositionChart = dynamic(() => import('@/components/AprChart'), { ssr: false })

type MainTab = 'overview' | 'performance' | 'risk' | 'activity' | 'position'
type SideTab = 'deposit' | 'withdraw'

const ETH_PRICE = 1790

interface TxRow {
  date: string
  time: string
  usdAmount: number
  hash: string
}

const TRANSACTIONS: TxRow[] = [
  { date: '2025-10-15', time: '09:14:23', usdAmount: 53.08,      hash: '0x3f7ab2c1...1b2c' },
  { date: '2025-10-15', time: '11:32:47', usdAmount: 2136.61,    hash: '0xb4d2e8f3...8e3f' },
  { date: '2025-10-15', time: '14:08:11', usdAmount: 9306.77,    hash: '0x7c1ea4d5...4a5d' },
  { date: '2025-10-15', time: '16:55:39', usdAmount: 1110.90,    hash: '0xe2f89c7b...9c7b' },
  { date: '2025-10-16', time: '08:22:14', usdAmount: 2441.27,    hash: '0x1a3d6f4e...6f4e' },
  { date: '2025-10-16', time: '13:47:58', usdAmount: 2275.56,    hash: '0x9d6c2b8a...2b8a' },
  { date: '2025-10-17', time: '10:03:27', usdAmount: 1182.78,    hash: '0x5e4b7d1f...7d1f' },
  { date: '2025-10-17', time: '15:19:42', usdAmount: 1879.53,    hash: '0xc8a73e6d...3e6d' },
  { date: '2025-10-19', time: '09:44:16', usdAmount: 25888.92,   hash: '0x2f9b5c4a...5c4a' },
  { date: '2025-10-19', time: '17:28:53', usdAmount: 7439.31,    hash: '0x8d1eb7f2...b7f2' },
  { date: '2025-10-20', time: '12:06:34', usdAmount: 53617.22,   hash: '0x4a7c9e3d...9e3d' },
  { date: '2025-10-21', time: '10:33:19', usdAmount: 7087.12,    hash: '0xf3b81d6a...1d6a' },
  { date: '2025-10-22', time: '08:51:07', usdAmount: 36365.67,   hash: '0x6c2d4f8b...4f8b' },
  { date: '2025-10-22', time: '14:17:44', usdAmount: 10831.00,   hash: '0xd5a47c2e...7c2e' },
  { date: '2025-10-23', time: '09:08:29', usdAmount: 6956.15,    hash: '0x3e9f8b1d...8b1d' },
  { date: '2025-10-23', time: '11:42:55', usdAmount: 79999.00,   hash: '0xb1c75a9f...5a9f' },
  { date: '2025-10-23', time: '16:34:18', usdAmount: 3754.00,    hash: '0x7f4e2d3c...2d3c' },
  { date: '2025-11-02', time: '10:15:33', usdAmount: 19999.00,   hash: '0xa2d69e1b...9e1b' },
  { date: '2025-11-02', time: '13:58:47', usdAmount: 169850.00,  hash: '0x4c8b6f7a...6f7a' },
  { date: '2025-11-02', time: '17:22:09', usdAmount: 49999.50,   hash: '0xe7f33b4c...3b4c' },
  { date: '2025-11-11', time: '11:04:22', usdAmount: 44991.23,   hash: '0x9a1d8c5e...8c5e' },
  { date: '2025-11-13', time: '14:37:48', usdAmount: 2914.08,    hash: '0x2b5f1a7d...1a7d' },
  { date: '2025-11-29', time: '09:51:36', usdAmount: 50000.00,   hash: '0x8e3c4d9f...4d9f' },
]

const PAGE_SIZE = 10

function generateDepositGrowth() {
  const data = []
  const start = new Date('2025-10-15')
  const now = new Date('2026-03-06')
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000)
  for (let i = 0; i <= days; i++) {
    const d = new Date(start.getTime() + i * 86400000)
    const label = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
    const value = 302100 + (i / days) * 8000 + Math.sin(i * 0.3) * 400
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

function fmt(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

export default function PositionPage() {
  const router = useRouter()
  const [mainTab, setMainTab] = useState<MainTab>('activity')
  const [sideTab, setSideTab] = useState<SideTab>('withdraw')
  const [amountUnit, setAmountUnit] = useState<'wsteth' | 'usd'>('wsteth')
  const [page, setPage] = useState(0)
  const chartData = useMemo(() => generateDepositGrowth(), [])

  const totalPages = Math.ceil(TRANSACTIONS.length / PAGE_SIZE)
  const pageRows = TRANSACTIONS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

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
          <div style={{ fontSize: '13px', color: '#7A7A82' }}>wstETH · Ethereum · 6,78% APY</div>
        </div>
      </div>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid #2A2A2D', marginBottom: '24px' }}>
        {MAIN_TABS.map(tab => (
          <button key={tab.key} onClick={() => setMainTab(tab.key)} style={{
            padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: mainTab === tab.key ? 600 : 400,
            color: mainTab === tab.key ? '#E8E8EA' : '#7A7A82',
            borderBottom: mainTab === tab.key ? '2px solid #39FF6B' : '2px solid transparent',
            marginBottom: '-1px', transition: 'all 0.15s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px' }}>

        {/* LEFT */}
        <div>
          {/* Deposit chart card */}
          <div style={{ background: '#1A1A1C', border: '1px solid #2A2A2D', borderRadius: '12px', padding: '24px', marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Mi Depósito (wstETH)
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '40px', fontWeight: 700, color: '#E8E8EA', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                  {amountUnit === 'wsteth' ? '169.323' : '$302,988.27'}
                </div>
                <div style={{ fontSize: '13px', color: '#7A7A82', marginTop: '4px' }}>
                  {amountUnit === 'wsteth' ? '≈ $302,988.27' : '169.323 wstETH'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                <button style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  padding: '6px 12px', background: '#141415', border: '1px solid #2A2A2D',
                  borderRadius: '8px', color: '#E8E8EA', fontSize: '12px', cursor: 'pointer',
                }}>
                  3 meses <ChevronDown size={12} />
                </button>
              </div>
            </div>
            <PositionChart data={chartData} color="#3B82F6" height={140} />
          </div>

          {/* Transactions table */}
          <div style={{ background: '#1A1A1C', border: '1px solid #2A2A2D', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2A2A2D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#E8E8EA' }}>Tus transacciones</span>
              <span style={{ fontSize: '12px', color: '#7A7A82' }}>{TRANSACTIONS.length} transacciones</span>
            </div>

            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '190px 130px 1fr 150px', padding: '10px 20px', borderBottom: '1px solid #1F1F21', background: '#141415' }}>
              {['Fecha ↓', 'Tipo', 'Cantidad', 'Transacción'].map((h, i) => (
                <span key={i} style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            {pageRows.map((tx, i) => {
              const wsteth = tx.usdAmount / ETH_PRICE
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '190px 130px 1fr 150px',
                  padding: '12px 20px', alignItems: 'center',
                  borderBottom: i < pageRows.length - 1 ? '1px solid #1F1F21' : 'none',
                  transition: 'background 0.12s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#242426')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '12px', color: '#9A9AA2', fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
                    {tx.date} {tx.time}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, color: '#3B82F6',
                    background: 'rgba(59,130,246,0.1)', borderRadius: '6px',
                    padding: '3px 8px', display: 'inline-block', whiteSpace: 'nowrap',
                  }}>
                    Vault Deposit
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '9px', flexShrink: 0,
                    }}>⬡</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8EA', fontVariantNumeric: 'tabular-nums' }}>
                        {fmt(wsteth, 5)} wstETH
                      </div>
                      <div style={{ fontSize: '11px', color: '#7A7A82' }}>${fmt(tx.usdAmount)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '12px', color: '#3B82F6', fontFamily: 'monospace' }}>
                      {tx.hash}
                    </span>
                    <ExternalLink size={11} color="#3B82F6" style={{ flexShrink: 0 }} />
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 20px', borderTop: '1px solid #2A2A2D', background: '#141415',
            }}>
              <span style={{ fontSize: '12px', color: '#7A7A82' }}>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, TRANSACTIONS.length)} de {TRANSACTIONS.length}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  style={{
                    width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #2A2A2D',
                    background: page === 0 ? 'transparent' : '#1A1A1C',
                    color: page === 0 ? '#3A3A3E' : '#E8E8EA',
                    cursor: page === 0 ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)} style={{
                    width: '30px', height: '30px', borderRadius: '6px', border: '1px solid',
                    borderColor: page === i ? 'rgba(57,255,107,0.4)' : '#2A2A2D',
                    background: page === i ? 'rgba(57,255,107,0.1)' : '#1A1A1C',
                    color: page === i ? '#39FF6B' : '#7A7A82',
                    cursor: 'pointer', fontSize: '12px', fontWeight: page === i ? 700 : 400,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  style={{
                    width: '30px', height: '30px', borderRadius: '6px', border: '1px solid #2A2A2D',
                    background: page === totalPages - 1 ? 'transparent' : '#1A1A1C',
                    color: page === totalPages - 1 ? '#3A3A3E' : '#E8E8EA',
                    cursor: page === totalPages - 1 ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Deposit/Withdraw panel */}
        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', padding: '20px',
          alignSelf: 'start', position: 'sticky', top: '80px',
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
              <div style={{ background: '#141415', border: '1px solid #2A2A2D', borderRadius: '10px', padding: '14px 16px', marginBottom: '8px' }}>
                <div style={{ fontSize: '11px', color: '#7A7A82', marginBottom: '8px' }}>Retirar wstETH</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <input
                    type="text"
                    defaultValue="0.00"
                    style={{ background: 'none', border: 'none', outline: 'none', fontSize: '24px', fontWeight: 700, color: '#E8E8EA', width: '100%', fontVariantNumeric: 'tabular-nums' }}
                  />
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>⬡</div>
                </div>
                <div style={{ fontSize: '12px', color: '#7A7A82', marginTop: '4px' }}>$0</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#7A7A82' }}>
                  169.323 wstETH{' '}
                  <span style={{ color: '#3B82F6', fontWeight: 600, cursor: 'pointer' }}>MAX</span>
                </span>
              </div>

              {/* Lock notice */}
              <div style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.35)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
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
              <div style={{ background: '#141415', border: '1px solid #2A2A2D', borderRadius: '10px', padding: '16px' }}>
                {[
                  { label: 'Red',                    value: '◆ Ethereum' },
                  { label: 'Depósito (wstETH)',       value: '169.323' },
                  { label: 'APY',                     value: '6,78%' },
                  { label: 'Ganancia mensual est.',   value: '$1,711.88' },
                  { label: 'Ganancia anual est.',     value: '$20,542.61' },
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < 4 ? '1px solid #1F1F21' : 'none' }}>
                    <span style={{ fontSize: '12px', color: '#7A7A82' }}>{row.label}</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: row.label === 'APY' ? '#39FF6B' : '#E8E8EA', fontVariantNumeric: 'tabular-nums' }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ background: '#141415', border: '1px solid #2A2A2D', borderRadius: '10px', padding: '32px', textAlign: 'center', color: '#7A7A82', fontSize: '13px' }}>
              Los depósitos adicionales están disponibles bajo solicitud.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
