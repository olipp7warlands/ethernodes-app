'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { ExternalLink, ChevronRight } from 'lucide-react'

const AprChart = dynamic(() => import('@/components/AprChart'), { ssr: false })

// Generate realistic chart data
function generateChartData(days: number, baseApr: number) {
  const data = []
  for (let i = days; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * 1.2
    const trend = Math.sin(i * 0.3) * 0.4
    data.push({
      time: `${i}d`,
      value: Math.max(1.2, baseApr + noise + trend),
    })
  }
  return data
}

// Validators data
const validatorsByProtocol = [
  { name: 'Lido CSM', count: 729 },
  { name: 'Stader Permissionless', count: 660 },
  { name: 'Stader Permissioned', count: 450 },
  { name: 'Vanilla', count: 137 },
  { name: 'Lido SDVT', count: 80 },
]

type TabType = 'stablecoins' | 'ethereum' | 'bitcoin'

export default function MetricsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ethereum')
  const [metrics, setMetrics] = useState({
    apr_current: 3.49,
    apr_7d: 3.08,
    apr_30d: 2.60,
    total_deposits_eth: 169.00,
    total_funds_eth: 66744.72,
    rewards_distributed_eth: 3458.64,
    active_validators: 2056,
    liquidity_withdrawal: 7918.09,
    protocol_reserves: 8843.34,
    eth_eur_rate: 1789.50,
  })

  const chart7d = useMemo(() => generateChartData(7, metrics.apr_7d), [metrics.apr_7d])
  const chart30d = useMemo(() => generateChartData(30, metrics.apr_30d), [metrics.apr_30d])

  useEffect(() => {
    fetch('/api/metrics')
      .then(r => r.json())
      .then(data => setMetrics(data))
      .catch(() => {})
  }, [])

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
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#E8E8EA', marginBottom: '4px' }}>
              {fmt(metrics.liquidity_withdrawal)} €
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                RESERVAS DEL PROTOCOLO
              </span>
              <span style={{ fontSize: '13px', color: '#E8E8EA', fontWeight: 500 }}>
                {fmt(metrics.protocol_reserves)} € – 0,00%
              </span>
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

      {/* Bottom stats */}
      <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        
        <StatCard
          title="TOTAL DEPÓSITOS"
          mainValue={`${fmt(metrics.total_deposits_eth)} ETH`}
          subValue={`${fmt(totalDepositsEur)} €`}
          description="Suma de todo el ETH depositado por los usuarios."
          highlight
        />
        <StatCard
          title="FONDOS TOTALES"
          mainValue={`${fmt(metrics.total_funds_eth)} ETH`}
          subValue={`${fmt(totalFundsEur)} €`}
          description="Volumen total gestionado en validación Ethereum."
        />
        <StatCard
          title="RECOMPENSAS REPARTIDAS"
          mainValue={`${fmt(metrics.rewards_distributed_eth)} ETH`}
          subValue={`${fmt(rewardsEur)} €`}
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
