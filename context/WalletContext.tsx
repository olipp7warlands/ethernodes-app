'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
      isMetaMask?: boolean
      on: (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
    }
  }
}

interface WalletContextValue {
  address: string | null
  isConnected: boolean
  error: string
  connect: () => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextValue>({
  address: null,
  isConnected: false,
  error: '',
  connect: async () => {},
  disconnect: () => {},
})

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [error, setError] = useState('')

  // No auto-reconnect — signature is always required explicitly

  const connect = async () => {
    setError('')

    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Instala MetaMask para continuar: metamask.io')
      return
    }

    try {
      // 1. Request accounts
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]
      const account = accounts[0]

      // 2. Check network
      const chainId = (await window.ethereum.request({ method: 'eth_chainId' })) as string
      if (chainId !== '0x1') {
        setError('Cambia a la red Ethereum Mainnet')
        // Continue — show warning but still request signature
      }

      // 3. Fetch nonce from server
      const nonceRes = await fetch('/api/auth/nonce')
      if (!nonceRes.ok) throw new Error('No se pudo obtener el nonce')
      const { nonce } = await nonceRes.json()

      // 4. Build message
      const message =
        `Ethernodes quiere que inicies sesión con tu cuenta de Ethereum.\n\n` +
        `Esta solicitud no iniciará ninguna transacción ni accederá a tus fondos.\n\n` +
        `Dirección: ${account}\n` +
        `Nonce: ${nonce}\n` +
        `Fecha: ${new Date().toISOString()}`

      // 5. Request signature — MetaMask opens the signing prompt
      await window.ethereum.request({
        method: 'personal_sign',
        params: [message, account],
      })

      // 6. Signature accepted — mark as connected
      setAddress(account)
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code
      if (code === 4001) {
        setError('Firma cancelada, conexión rechazada')
      } else if (err instanceof Error && err.message.toLowerCase().includes('already processing')) {
        // MetaMask popup already open — do nothing
      } else {
        setError('Error al conectar con MetaMask')
      }
    }
  }

  const disconnect = () => {
    setAddress(null)
    setError('')
    // No persistent session to clear — next connect() will always require a new signature
  }

  return (
    <WalletContext.Provider value={{ address, isConnected: !!address, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
