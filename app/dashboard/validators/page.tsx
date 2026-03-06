'use client'

import { useState } from 'react'
import { MoreVertical, AlertTriangle } from 'lucide-react'

const operators = [
  { name: 'EtherNodes - 06', id: 424, uptime24h: 100, uptime30d: 99.98, annualFee: 0.015 },
  { name: 'EtherNodes - 07', id: 425, uptime24h: 100, uptime30d: 100, annualFee: 0.015 },
  { name: 'EtherNodes - 08', id: 426, uptime24h: 100, uptime30d: 100, annualFee: 0.015 },
  { name: 'EtherNodes - 09', id: 427, uptime24h: 100, uptime30d: 99.98, annualFee: 0.015 },
]

const clusterStats = {
  operators: 4,
  validators: 170,
  runawayDays: 10,
  balance: 32.7980,
  liquidationCollateral: 44.1432,
  annualClusterCost: 1150.8761,
}

// Generate fake validators
function generateValidators(count: number) {
  const protocols = ['Vanilla', 'Lido CSM', 'Stader Permissionless']
  const validators = []
  for (let i = 0; i < count; i++) {
    const hex = Math.random().toString(16).slice(2, 10)
    const hex2 = Math.random().toString(16).slice(2, 6)
    validators.push({
      publicKey: `0x${hex}...${hex2}`,
      status: 'Active',
      protocol: protocols[i % 3],
      rewards24h: 0.0020,
      rewardsTotal: (Math.random() * 0.15 + 0.05).toFixed(4),
      apr: (Math.random() * 1.5 + 2.0).toFixed(2),
      activationDate: '15/12/2025',
      deactivationDate: '-',
    })
  }
  return validators
}

const validators = generateValidators(50)

export default function ValidatorsPage() {
  const [page, setPage] = useState(0)
  const limit = 10
  const paginated = validators.slice(page * limit, (page + 1) * limit)

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0F', padding: '24px 32px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#E8E8EA', marginBottom: '24px' }}>
        Validadores
      </h1>

      {/* Cluster stats top */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        <ClusterStat icon="👥" label="OPERADORES" value={clusterStats.operators.toString()} sub="Across active cluster" />
        <ClusterStat icon="🔑" label="VALIDADORES" value={clusterStats.validators.toString()} sub="Validating on SSV network" />
        <ClusterStat icon="⏱" label="DÍAS DE RUNAWAY" value={`${clusterStats.runawayDays} days`} sub="Estimated days of runway for current cluster" badge="Low runway" />
        <ClusterStat icon="👁" label="BALANCE EFFECTIVO" value={`${clusterStats.balance.toFixed(4)} SSV`} sub={`Colateral de Liquidación ${clusterStats.liquidationCollateral} SSV\nCoste Anual del Cluster ${clusterStats.annualClusterCost} SSV`} />
      </div>

      {/* Operators */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#E8E8EA', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          OPERADORES
        </h2>
        <p style={{ fontSize: '12px', color: '#7A7A82', marginBottom: '16px' }}>
          Detailed metrics per operator in this cluster.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {operators.map((op) => (
            <div key={op.id} style={{
              background: '#1A1A1C', border: '1px solid #2A2A2D',
              borderRadius: '10px', padding: '16px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#E8E8EA' }}>{op.name}</div>
                  <div style={{ fontSize: '11px', color: '#7A7A82' }}>ID {op.id}</div>
                </div>
                <button style={{
                  background: 'rgba(57,255,107,0.1)', border: '1px solid rgba(57,255,107,0.2)',
                  borderRadius: '6px', padding: '4px 10px',
                  color: '#39FF6B', fontSize: '12px', cursor: 'pointer',
                }}>
                  View →
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <MetricRow color="#39FF6B" label="Tiempo Activo 24h" value={`${op.uptime24h.toFixed(2)}%`} />
                <MetricRow color="#00B4D8" label="Tiempo Activo 30d" value={`${op.uptime30d.toFixed(2)}%`} />
                <MetricRow color="#FFB800" label="Tarifa Anual" value={`${op.annualFee} SSV`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Validators table */}
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#E8E8EA', marginBottom: '20px' }}>
          Validadores ({validators.length * 54})
        </h2>
        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '180px 80px 160px 130px 140px 100px 120px 140px 40px',
            padding: '12px 16px',
            background: '#141415',
            borderBottom: '1px solid #2A2A2D',
          }}>
            {['Public Key', 'Estado', 'Protocolo', 'Recompensas (24h)', 'Recompensas (total)', 'APR Validador', 'Fecha activación', 'Fecha desactivación', ''].map((h, i) => (
              <div key={i} style={{ fontSize: '12px', fontWeight: 600, color: '#7A7A82' }}>{h}</div>
            ))}
          </div>
          
          {paginated.map((v, i) => (
            <div key={i} style={{
              display: 'grid',
              gridTemplateColumns: '180px 80px 160px 130px 140px 100px 120px 140px 40px',
              padding: '12px 16px',
              borderBottom: '1px solid #1F1F21',
              alignItems: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#1F1F21')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ color: '#E8E8EA', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{v.publicKey}</span>
              <span style={{
                fontSize: '12px', color: '#39FF6B', fontWeight: 500,
                background: 'rgba(57,255,107,0.1)', borderRadius: '4px',
                padding: '2px 8px', display: 'inline-block',
              }}>{v.status}</span>
              <span style={{ fontSize: '13px', color: '#9A9AA2' }}>{v.protocol}</span>
              <span style={{ color: '#E8E8EA', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{v.rewards24h.toFixed(4)} ETH</span>
              <span style={{ color: '#E8E8EA', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>{v.rewardsTotal} ETH</span>
              <span style={{ fontSize: '13px', color: '#E8E8EA', fontWeight: 500 }}>{v.apr}%</span>
              <span style={{ fontSize: '13px', color: '#9A9AA2' }}>{v.activationDate}</span>
              <span style={{ fontSize: '13px', color: '#9A9AA2' }}>{v.deactivationDate}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A7A82' }}>
                <MoreVertical size={14} />
              </button>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          {Array.from({ length: Math.ceil(validators.length / limit) }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              width: '32px', height: '32px', borderRadius: '6px',
              background: page === i ? 'rgba(57,255,107,0.15)' : '#1A1A1C',
              border: `1px solid ${page === i ? 'rgba(57,255,107,0.3)' : '#2A2A2D'}`,
              color: page === i ? '#39FF6B' : '#7A7A82',
              cursor: 'pointer', fontSize: '13px', fontWeight: page === i ? 600 : 400,
            }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ClusterStat({ icon, label, value, sub, badge }: {
  icon: string; label: string; value: string; sub: string; badge?: string
}) {
  return (
    <div style={{
      background: '#1A1A1C', border: '1px solid #2A2A2D',
      borderRadius: '10px', padding: '18px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
        <span style={{ fontSize: '18px' }}>{icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
        <span style={{ fontSize: '24px', fontWeight: 700, color: '#E8E8EA', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        {badge && (
          <span style={{
            fontSize: '10px', fontWeight: 600,
            background: 'rgba(255,100,50,0.15)', color: '#ff7a50',
            border: '1px solid rgba(255,100,50,0.3)',
            borderRadius: '4px', padding: '2px 7px',
          }}>{badge}</span>
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#5A5A62', whiteSpace: 'pre-line', lineHeight: 1.6 }}>{sub}</div>
    </div>
  )
}

function MetricRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
        <span style={{ fontSize: '12px', color: '#9A9AA2' }}>{label}</span>
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#E8E8EA' }}>{value}</span>
    </div>
  )
}
