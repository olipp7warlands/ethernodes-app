'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'

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

  // Auto-reconnect silently on page load if previously connected
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        const accs = accounts as string[]
        if (accs.length > 0) setAddress(accs[0])
      })
      .catch(() => {})
  }, [])

  const connect = async () => {
    setError('')

    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Instala MetaMask para continuar: metamask.io')
      return
    }

    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]

      // Check network
      const chainId = (await window.ethereum.request({ method: 'eth_chainId' })) as string
      if (chainId !== '0x1') {
        setError('Cambia a la red Ethereum Mainnet')
        // Still connect — wallet is valid even on wrong network
      }

      setAddress(accounts[0])
    } catch (err: unknown) {
      const code = (err as { code?: number })?.code
      if (code === 4001) {
        setError('Conexión cancelada')
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
