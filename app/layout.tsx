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
          role="note"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 9999,
            width: '100%',
            background: '#141415',
            borderBottom: '1px solid #2A2A2D',
            color: '#9A9AA2',
            fontSize: '11px',
            fontWeight: 500,
            textAlign: 'center',
            padding: '5px 16px',
            letterSpacing: '0.02em',
            lineHeight: 1.3,
          }}
        >
        </div>
        {children}
      </body>
    </html>
  )
}
