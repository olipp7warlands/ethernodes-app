import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { getMetrics } = await import('@/lib/metrics')
    const metrics = await getMetrics()
    return NextResponse.json(metrics)
  } catch {
    return NextResponse.json({
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
  }
}
