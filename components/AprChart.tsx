'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

interface AprChartProps {
  data: { time: string; value: number }[]
  color?: string
  height?: number
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#242426',
        border: '1px solid #2A2A2D',
        borderRadius: '6px',
        padding: '6px 10px',
        fontSize: '12px',
        color: '#E8E8EA',
      }}>
        <span style={{ color: '#39FF6B', fontWeight: 600 }}>{payload[0].value.toFixed(2)}%</span>
      </div>
    )
  }
  return null
}

export default function AprChart({ data, color = '#39FF6B', height = 100 }: AprChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
        <defs>
          <linearGradient id="aprGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis domain={['auto', 'auto']} hide />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
