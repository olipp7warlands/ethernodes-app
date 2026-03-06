import { supabaseAdmin } from './supabase'

export interface ProtocolMetrics {
  apr_current: number
  apr_7d: number
  apr_30d: number
  total_deposits_eth: number
  total_funds_eth: number
  rewards_distributed_eth: number
  active_validators: number
  liquidity_withdrawal: number
  protocol_reserves: number
  eth_eur_rate: number
}

export async function getMetrics(): Promise<ProtocolMetrics> {
  try {
    const db = supabaseAdmin()
    if (!db) throw new Error('No DB')
    const { data } = await db.from('protocol_metrics').select('*')
    
    const metricsMap: Record<string, string> = {}
    data?.forEach((row: { key: string; value: string }) => {
      metricsMap[row.key] = row.value
    })
    
    return {
      apr_current: parseFloat(metricsMap.apr_current || '6.78'),
      apr_7d: parseFloat(metricsMap.apr_7d || '6.45'),
      apr_30d: parseFloat(metricsMap.apr_30d || '6.12'),
      total_deposits_eth: parseFloat(metricsMap.total_deposits_eth || '169.323'),
      total_funds_eth: parseFloat(metricsMap.total_funds_eth || '66744.72'),
      rewards_distributed_eth: parseFloat(metricsMap.rewards_distributed_eth || '3458.64'),
      active_validators: parseInt(metricsMap.active_validators || '2056'),
      liquidity_withdrawal: parseFloat(metricsMap.liquidity_withdrawal || '7918.09'),
      protocol_reserves: parseFloat(metricsMap.protocol_reserves || '8843.34'),
      eth_eur_rate: parseFloat(metricsMap.eth_eur_rate || '1789.50'),
    }
  } catch {
    // Return defaults if DB not connected
    return {
      apr_current: 6.78,
      apr_7d: 6.45,
      apr_30d: 6.12,
      total_deposits_eth: 169.323,
      total_funds_eth: 66744.72,
      rewards_distributed_eth: 3458.64,
      active_validators: 2056,
      liquidity_withdrawal: 7918.09,
      protocol_reserves: 8843.34,
      eth_eur_rate: 1789.50,
    }
  }
}

// Generate realistic chart data for APR
export function generateAprChartData(days: number, baseApr: number) {
  const data = []
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 0.8
    data.push({
      time: new Date(now - i * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      value: Math.max(1.5, baseApr + variance)
    })
  }
  return data
}

// Format numbers like Ethernodes does
export function formatEth(value: number): string {
  return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatEur(value: number): string {
  return value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
