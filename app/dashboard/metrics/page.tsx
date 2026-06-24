'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ExternalLink, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const AprChart = dynamic(() => import('@/components/AprChart'), { ssr: false })

// 7-day APR: clear downward trend ending at the latest value (right edge)
function generate7dChart(endApr: number) {
  const days = 7
  const start = endApr + 0.95
  const data = []
  for (let i = days; i >= 0; i--) {
    const progress = (days - i) / days // 0 (oldest) -> 1 (latest)
    const base = start + (endApr - start) * progress
    const noise = Math.sin(i * 1.7) * 0.05
    data.push({ time: `${i}d`, value: Math.max(1.2, base + noise) })
  }
  return data
}

// 30-day APR: rises to a peak around week 2-3, then declines
function generate30dChart(avgApr: number) {
  const days = 30
  const startVal = avgApr - 0.55
  const peakVal = avgApr + 1.05
  const endVal = avgApr - 0.35
  const peakAt = 0.58 // ~day 17 from start ≈ week 2.5
  const data = []
  for (let i = days; i >= 0; i--) {
    const progress = (days - i) / days // 0 (oldest) -> 1 (latest)
    const base = progress <= peakAt
      ? startVal + (peakVal - startVal) * (progress / peakAt)
      : peakVal + (endVal - peakVal) * ((progress - peakAt) / (1 - peakAt))
    const noise = Math.sin(i * 0.9) * 0.07
    data.push({ time: `${i}d`, value: Math.max(1.2, base + noise) })
  }
  return data
}

// Validators data
const validatorsByProtocol = [
  { name: 'Lido CSM', count: 776 },
  { name: 'Stader Permissionless', count: 701 },
  { name: 'Stader Permissioned', count: 478 },
  { name: 'Vanilla', count: 146 },
  { name: 'Lido SDVT', count: 86 },
]

// Weekly fees history (educational simulation, week 1 starts 2026-04-01)
const weeklyFees = [
  { short: 'S1', period: '01 Abr – 07 Abr 2026', amount: 789.45, start: '2026-04-01', end: '2026-04-07' },
  { short: 'S2', period: '08 Abr – 14 Abr 2026', amount: 643.32, start: '2026-04-08', end: '2026-04-14' },
  { short: 'S3', period: '15 Abr – 21 Abr 2026', amount: 432.78, start: '2026-04-15', end: '2026-04-21' },
  { short: 'S4', period: '22 Abr – 28 Abr 2026', amount: 339.50, start: '2026-04-22', end: '2026-04-28' },
  { short: 'S5', period: '29 Abr – 05 May 2026', amount: 567.88, start: '2026-04-29', end: '2026-05-05' },
  { short: 'S6', period: '06 May – 12 May 2026', amount: 493.31, start: '2026-05-06', end: '2026-05-12' },
  { short: 'S7', period: '13 May – 19 May 2026', amount: 344.14, start: '2026-05-13', end: '2026-05-19' },
  { short: 'S8', period: '20 May – 26 May 2026', amount: 421.89, start: '2026-05-20', end: '2026-05-26' },
  { short: 'S9',  period: '27 May – 02 Jun 2026', amount: 323.70, start: '2026-05-27', end: '2026-06-02' },
  { short: 'S10', period: '03 Jun – 09 Jun 2026', amount: 287.43, start: '2026-06-03', end: '2026-06-09' },
  { short: 'S11', period: '10 Jun – 16 Jun 2026', amount: 312.67, start: '2026-06-10', end: '2026-06-16' },
  { short: 'S12', period: '17 Jun – 23 Jun 2026', amount: 198.55, start: '2026-06-17', end: '2026-06-23' },
]

type TabType = 'stablecoins' | 'ethereum' | 'bitcoin'

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ethereum')
  const [metrics, setMetrics] = useState({
    apr_current: 5.12,
    apr_7d: 4.89,
    apr_30d: 5.67,
    total_deposits_eth: 169.323,
    total_funds_eth: 66744.72,
    rewards_distributed_eth: 3458.64,
    active_validators: 2187,
    liquidity_withdrawal: 0.04,
    protocol_reserves: 8843.34,
    eth_eur_rate: 1655.00,
  })

  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')

  const chart7d = useMemo(() => generate7dChart(metrics.apr_7d), [metrics.apr_7d])
  const chart30d = useMemo(() => generate30dChart(metrics.apr_30d), [metrics.apr_30d])

  useEffect(() => {
    fetch('/api/metrics')
      .then(r => r.json())
      .then(data => setMetrics(data))
      .catch(() => {})
  }, [])

  const filteredFees = weeklyFees.filter(w => {
    if (desde && w.end < desde) return false
    if (hasta && w.start > hasta) return false
    return true
  })
  const filteredTotal = filteredFees.reduce((sum, w) => sum + w.amount, 0)

  const fmt = (n: number, decimals = 2) =>
    n.toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  const totalDepositsEur = metrics.total_deposits_eth * metrics.eth_eur_rate
  const totalFundsEur = metrics.total_funds_eth * metrics.eth_eur_rate
  const rewardsEur = metrics.rewards_distributed_eth * metrics.eth_eur_rate

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0F' }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#E8E8EA' }}>
          Métricas del Protocolo
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: '#1A1A1C', border: '1px solid #2A2A2D',
            borderRadius: '8px', padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <span style={{ fontSize: '13px', color: '#7A7A82' }}>Mostrar</span>
            <span style={{ fontSize: '13px', color: '#E8E8EA', fontWeight: 600 }}>50%</span>
          </div>
          <button style={{
            background: 'rgba(57,255,107,0.1)',
            border: '1px solid rgba(57,255,107,0.3)',
            borderRadius: '8px', padding: '8px 16px',
            color: '#39FF6B', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          }}>
            Restablecer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '16px 32px 0' }}>
        <div style={{
          background: '#141415',
          border: '1px solid #2A2A2D',
          borderRadius: '100px',
          display: 'inline-flex',
          padding: '4px',
          gap: '2px',
        }}>
          {[
            { key: 'stablecoins', label: 'Stablecoins deposits' },
            { key: 'ethereum', label: 'Ethereum deposits' },
            { key: 'bitcoin', label: 'Bitcoin deposits' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as TabType)} style={{
              padding: '7px 20px', borderRadius: '100px',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.1)' : 'transparent',
              border: 'none', cursor: 'pointer',
              color: activeTab === tab.key ? '#E8E8EA' : '#7A7A82',
              fontSize: '13px', fontWeight: activeTab === tab.key ? 600 : 400,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content grid */}
      <div style={{ padding: '20px 32px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px' }}>

        {/* APR Card */}
        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', padding: '24px',
        }}>
          {/* APR Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span className="live-dot" />
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#7A7A82', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              APR DE ETHERNODES
            </span>
          </div>

          <div style={{ fontSize: '48px', fontWeight: 700, color: '#E8E8EA', lineHeight: 1.1, marginBottom: '6px', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.apr_current.toFixed(2).replace('.', ',')}%
          </div>
          <div style={{ fontSize: '13px', color: '#7A7A82', marginBottom: '24px' }}>
            APR efectivo generado por los validadores de la plataforma
          </div>

          {/* Two charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              background: '#141415', border: '1px solid #2A2A2D',
              borderRadius: '10px', padding: '16px',
            }}>
              <div style={{ fontSize: '10px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                ÚLTIMOS 7 DÍAS
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#E8E8EA', marginBottom: '12px' }}>
                {metrics.apr_7d.toFixed(2).replace('.', ',')}%
              </div>
              <AprChart data={chart7d} height={80} />
            </div>
            <div style={{
              background: '#141415', border: '1px solid #2A2A2D',
              borderRadius: '10px', padding: '16px',
            }}>
              <div style={{ fontSize: '10px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                ÚLTIMOS 30 DÍAS
              </div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#E8E8EA', marginBottom: '12px' }}>
                {metrics.apr_30d.toFixed(2).replace('.', ',')}%
              </div>
              <AprChart data={chart30d} height={80} />
            </div>
          </div>

          {/* Liquidity */}
          <div style={{
            background: '#141415', border: '1px solid #2A2A2D',
            borderRadius: '10px', padding: '16px',
          }}>
            <div style={{ fontSize: '10px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              LIQUIDEZ PARA RETIROS
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#E8E8EA' }}>
              {fmt(metrics.liquidity_withdrawal)} $
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Active validators */}
          <div style={{
            background: '#1A1A1C', border: '1px solid #2A2A2D',
            borderRadius: '12px', padding: '20px',
          }}>
            <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              VALIDADORES ACTIVOS
            </div>
            <div style={{ fontSize: '40px', fontWeight: 700, color: '#E8E8EA', marginBottom: '16px', fontVariantNumeric: 'tabular-nums' }}>
              {metrics.active_validators.toLocaleString('es-ES')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {validatorsByProtocol.map((v, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '7px 0',
                  borderBottom: i < validatorsByProtocol.length - 1 ? '1px solid #1F1F21' : 'none',
                }}>
                  <span style={{ fontSize: '13px', color: '#9A9AA2' }}>{v.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#E8E8EA', fontVariantNumeric: 'tabular-nums' }}>{v.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Transparency */}
          <div style={{
            background: '#1A1A1C', border: '1px solid #2A2A2D',
            borderRadius: '12px', padding: '20px',
          }}>
            <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
              TRANSPARENCIA
            </div>
            {[
              { title: 'Saldo de la cartera de retiros instantáneos', sub: 'Ver transacciones onchain' },
              { title: 'Tiempo de recuperación de liquidez', sub: 'Ver gráfico' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px', borderRadius: '8px', background: '#141415',
                marginBottom: i === 0 ? '8px' : 0, cursor: 'pointer',
                border: '1px solid #242426',
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#E8E8EA', marginBottom: '3px', fontWeight: 500 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11px', color: '#7A7A82' }}>{item.sub}</div>
                </div>
                <ExternalLink size={14} color="#7A7A82" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly fees history */}
      <div style={{ padding: '0 32px 20px' }}>
        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', padding: '24px',
        }}>
          <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
            HISTORIAL DE FEES GENERADOS
          </div>

          {/* Bar chart */}
          <div style={{ width: '100%', height: '200px', marginBottom: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyFees} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis
                  dataKey="short"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#7A7A82', fontSize: 11 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(57,255,107,0.06)' }}
                  contentStyle={{
                    background: '#141415', border: '1px solid #2A2A2D',
                    borderRadius: '8px', fontSize: '12px',
                  }}
                  labelStyle={{ color: '#E8E8EA', fontWeight: 600 }}
                  formatter={(value: number) => [`$${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Fees']}
                  labelFormatter={(label: string) => {
                    const row = weeklyFees.find(w => w.short === label)
                    return row ? row.period : label
                  }}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {weeklyFees.map((_, i) => (
                    <Cell key={i} fill="#39FF6B" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Date filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#7A7A82' }}>Desde</span>
            <input
              type="date"
              value={desde}
              onChange={e => setDesde(e.target.value)}
              style={{
                background: '#242426', border: '1px solid #2A2A2D', borderRadius: '8px',
                padding: '6px 10px', color: '#E8E8EA', fontSize: '13px',
                outline: 'none', colorScheme: 'dark',
              }}
            />
            <span style={{ fontSize: '12px', color: '#7A7A82' }}>Hasta</span>
            <input
              type="date"
              value={hasta}
              onChange={e => setHasta(e.target.value)}
              style={{
                background: '#242426', border: '1px solid #2A2A2D', borderRadius: '8px',
                padding: '6px 10px', color: '#E8E8EA', fontSize: '13px',
                outline: 'none', colorScheme: 'dark',
              }}
            />
            {(desde || hasta) && (
              <button
                onClick={() => { setDesde(''); setHasta('') }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#7A7A82', fontSize: '13px', textDecoration: 'underline', padding: 0,
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ borderTop: '1px solid #2A2A2D' }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr',
              padding: '10px 0', borderBottom: '1px solid #1F1F21',
            }}>
              {['Período', 'Fees generados'].map((h, i) => (
                <span key={i} style={{
                  fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase',
                  letterSpacing: '0.07em', fontWeight: 600,
                  textAlign: i === 1 ? 'right' : 'left',
                }}>
                  {h}
                </span>
              ))}
            </div>
            {filteredFees.map((w, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr',
                padding: '11px 0', alignItems: 'center',
                borderBottom: '1px solid #1F1F21',
              }}>
                <span style={{ fontSize: '13px', color: '#9A9AA2' }}>{w.period}</span>
                <span style={{ fontSize: '13px', color: '#E8E8EA', fontWeight: 600, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                  ${w.amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            {filteredFees.length === 0 && (
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '13px', color: '#5A5A62' }}>
                Sin resultados para el rango seleccionado
              </div>
            )}
            {/* Total */}
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr',
              padding: '14px 0 0', alignItems: 'center',
            }}>
              <span style={{ fontSize: '13px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: '16px', color: '#39FF6B', fontWeight: 700, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                ${filteredTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        
        <StatCard
          title="TOTAL DEPÓSITOS"
          mainValue={`${fmt(metrics.total_deposits_eth)} ETH`}
          subValue={`${fmt(totalDepositsEur)} $`}
          description="Suma de todo el ETH depositado por los usuarios."
          highlight
        />
        <StatCard
          title="FONDOS TOTALES"
          mainValue={`${fmt(metrics.total_funds_eth)} ETH`}
          subValue={`${fmt(totalFundsEur)} $`}
          description="Volumen total gestionado en validación Ethereum."
        />
        <StatCard
          title="RECOMPENSAS REPARTIDAS"
          mainValue={`${fmt(metrics.rewards_distributed_eth)} ETH`}
          subValue={`${fmt(rewardsEur)} $`}
          description="Recompensas generadas por el Vault desde su lanzamiento."
        />
      </div>
    </div>
  )
}

function StatCard({
  title, mainValue, subValue, description, highlight
}: {
  title: string
  mainValue: string
  subValue: string
  description: string
  highlight?: boolean
}) {
  return (
    <div style={{
      background: '#1A1A1C',
      border: `1px solid ${highlight ? 'rgba(57,255,107,0.25)' : '#2A2A2D'}`,
      borderRadius: '12px', padding: '24px',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{
        fontSize: '28px', fontWeight: 700,
        color: highlight ? '#39FF6B' : '#E8E8EA',
        marginBottom: '4px', fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.2,
      }}>
        {mainValue}
      </div>
      <div style={{ fontSize: '14px', color: '#7A7A82', marginBottom: '12px', fontVariantNumeric: 'tabular-nums' }}>
        {subValue}
      </div>
      <div style={{ fontSize: '12px', color: '#5A5A62', lineHeight: 1.5 }}>
        {description}
      </div>
    </div>
  )
}
