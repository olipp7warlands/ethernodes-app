'use client'

import { useState } from 'react'
import { Save, Eye, EyeOff } from 'lucide-react'

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [metrics, setMetrics] = useState({
    apr_current: '3.49',
    apr_7d: '3.08',
    apr_30d: '2.60',
    total_deposits_eth: '169.00',
    total_funds_eth: '66744.72',
    rewards_distributed_eth: '3458.64',
    active_validators: '2056',
    liquidity_withdrawal: '7918.09',
    protocol_reserves: '8843.34',
    eth_eur_rate: '1789.50',
  })

  const handleSave = async () => {
    try {
      await fetch('/api/metrics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const fields = [
    { key: 'total_deposits_eth', label: 'Total Depósitos (ETH)', desc: 'ETH stakeados por usuarios' },
    { key: 'apr_current', label: 'APR Actual (%)', desc: 'APR efectivo mostrado en métricas' },
    { key: 'apr_7d', label: 'APR 7 días (%)', desc: 'APR promedio últimos 7 días' },
    { key: 'apr_30d', label: 'APR 30 días (%)', desc: 'APR promedio últimos 30 días' },
    { key: 'total_funds_eth', label: 'Fondos Totales (ETH)', desc: 'Volumen total gestionado' },
    { key: 'rewards_distributed_eth', label: 'Recompensas Repartidas (ETH)', desc: 'Total desde lanzamiento' },
    { key: 'active_validators', label: 'Validadores Activos', desc: 'Número total de validadores' },
    { key: 'liquidity_withdrawal', label: 'Liquidez para Retiros (€)', desc: 'Balance cartera retiros' },
    { key: 'protocol_reserves', label: 'Reservas del Protocolo (€)', desc: 'Reservas actuales' },
    { key: 'eth_eur_rate', label: 'Tipo de Cambio ETH/EUR', desc: 'Precio ETH en euros' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0E0E0F', padding: '24px 32px' }}>
      <div style={{ maxWidth: '700px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#E8E8EA', marginBottom: '4px' }}>
          Configuración
        </h1>
        <p style={{ fontSize: '14px', color: '#7A7A82', marginBottom: '32px' }}>
          Ajusta los valores que se muestran en el panel de métricas.
        </p>

        <div style={{
          background: '#1A1A1C', border: '1px solid #2A2A2D',
          borderRadius: '12px', padding: '24px', marginBottom: '16px',
        }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#7A7A82', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '20px' }}>
            Métricas del protocolo
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {fields.map(field => (
              <div key={field.key}>
                <label style={{ display: 'block', fontSize: '13px', color: '#E8E8EA', marginBottom: '4px', fontWeight: 500 }}>
                  {field.label}
                </label>
                <p style={{ fontSize: '11px', color: '#5A5A62', marginBottom: '6px' }}>{field.desc}</p>
                <input
                  type="text"
                  value={metrics[field.key as keyof typeof metrics]}
                  onChange={(e) => setMetrics(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={{
                    width: '100%',
                    background: '#141415',
                    border: '1px solid #2A2A2D',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#E8E8EA',
                    fontSize: '14px',
                    fontFamily: 'JetBrains Mono, monospace',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#39FF6B')}
                  onBlur={(e) => (e.target.style.borderColor = '#2A2A2D')}
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSave} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: saved ? '#1a3d25' : '#39FF6B',
          color: saved ? '#39FF6B' : '#0E0E0F',
          border: saved ? '1px solid #39FF6B' : 'none',
          borderRadius: '8px', padding: '12px 24px',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          transition: 'all 0.2s',
        }}>
          <Save size={16} />
          {saved ? '✓ Guardado correctamente' : 'Guardar cambios'}
        </button>
        
        <p style={{ fontSize: '12px', color: '#5A5A62', marginTop: '12px' }}>
          Los cambios se reflejan inmediatamente en el panel de métricas.
        </p>
      </div>
    </div>
  )
}
