import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ethernodes - Ethereum Staking',
  description: 'Professional Ethereum staking platform',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-en-bg text-en-text antialiased">
        <div
          role="alert"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            width: '100%',
            background: '#7A2E0E',
            borderBottom: '1px solid #FB923C',
            color: '#FFE8D6',
            fontSize: '13px',
            fontWeight: 600,
            textAlign: 'center',
            padding: '8px 16px',
            letterSpacing: '0.01em',
            lineHeight: 1.4,
          }}
        >
          ⚠️ DEMO · Entorno formativo — Todos los datos (saldos, APR, validadores,
          transacciones y fees) son <strong>simulados</strong> y no tienen valor real.
          Esto no es un servicio financiero ni de inversión.
        </div>
        {children}
      </body>
    </html>
  )
}
