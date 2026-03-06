import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ethernodes - Ethereum Staking',
  description: 'Professional Ethereum staking platform',
  icons: {
    icon: '/favicon.ico',
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
      <body className="bg-en-bg text-en-text antialiased">{children}</body>
    </html>
  )
}
