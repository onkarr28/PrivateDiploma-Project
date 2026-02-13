import React, { useCallback, useMemo, useState } from 'react'
import { Wallet, Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { waitForWalletInjection } from '../utils/walletDebug'

type ConnectResult = {
  address: string
  network: 'mainnet' | 'testnet'
  provider: 'Lace Midnight' | 'Lace Wallet' | 'Unknown'
}

interface MidnightAddressConnectorProps {
  onConnected?: (result: ConnectResult) => void
}

// Narrow types for window provider access
declare global {
  interface Window {
    midnight?: any
    cardano?: any
  }
}

export default function MidnightAddressConnector({ onConnected }: MidnightAddressConnectorProps) {
  const [addressInput, setAddressInput] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validated, setValidated] = useState(false)
  const [connected, setConnected] = useState<ConnectResult | null>(null)

  const canConnect = useMemo(() => addressInput.trim().length > 0 && validated && !isConnecting, [addressInput, validated, isConnecting])

  // Try SDK validation first; if SDK not present, defer to wallet handshake match
  const validateAddress = useCallback(async (addr: string) => {
    setError(null)
    setIsValidating(true)
    try {
      const address = addr.trim()
      if (!address) throw new Error('Please enter your Midnight wallet address')

      let sdkValid = false
      try {
        const mod: any = await import('@midnight-ntwrk/wallet-api')
        if (typeof mod?.validateAddress === 'function') {
          sdkValid = await mod.validateAddress(address)
        }
      } catch {
        // SDK not available at runtime; will be validated by wallet handshake
      }

      if (sdkValid === false) {
        throw new Error('Invalid Midnight address format')
      }

      setValidated(true)
    } catch (e: any) {
      setValidated(false)
      setError(e?.message || 'Failed to validate address')
    } finally {
      setIsValidating(false)
    }
  }, [])

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      const target = addressInput.trim()
      if (!target) throw new Error('Please enter your Midnight wallet address')

      // Wait for provider injection (mnLace preferred)
      const detection = await waitForWalletInjection(15000)
      if (!detection.detected) {
        throw new Error('No wallet extension detected. Open Lace Midnight, unlock, refresh, then try again.')
      }

      // Primary: Lace Midnight provider
      if (window.midnight?.mnLace && typeof window.midnight.mnLace.enable === 'function') {
        const api = await window.midnight.mnLace.enable()
        // Some providers expose state() with richer info
        const state = await (typeof api.state === 'function' ? api.state() : Promise.resolve<any>({}))
        const unshielded = state?.address || state?.unshieldedAddress || state?.accountAddress
        const sessionAddr = unshielded || null
        if (!sessionAddr) throw new Error('Wallet connected but no address was provided')

        if (sessionAddr !== target) {
          throw new Error('Address mismatch: Entered address does not match wallet address')
        }

        // Optional: establish a session via SDK if available
        try {
          const mod: any = await import('@midnight-ntwrk/wallet-api')
          if (typeof mod?.createSession === 'function') {
            await mod.createSession({ address: sessionAddr })
          } else if (typeof mod?.connect === 'function') {
            await mod.connect({ address: sessionAddr })
          }
        } catch {
          // SDK session optional; wallet handshake is authoritative
        }

        const network: 'mainnet' | 'testnet' = 'testnet'
        const result = { address: sessionAddr, network, provider: 'Lace Midnight' as const }
        setConnected(result)
        onConnected?.(result)
        return
      }

      // Fallback: CIP-30 Lace
      if (window.cardano?.lace && typeof window.cardano.lace.enable === 'function') {
        const api = await window.cardano.lace.enable()
        const getAddr = async () => {
          if (typeof api.getChangeAddress === 'function') return api.getChangeAddress()
          if (typeof api.getUsedAddresses === 'function') {
            const arr = await api.getUsedAddresses()
            return Array.isArray(arr) ? arr[0] : arr
          }
          if (typeof api.getAddress === 'function') return api.getAddress()
          return null
        }
        const sessionAddr = await getAddr()
        if (!sessionAddr) throw new Error('Wallet connected but no address was provided')
        if (sessionAddr !== target) {
          throw new Error('Address mismatch: Entered address does not match wallet address')
        }
        let network: 'mainnet' | 'testnet' = 'testnet'
        try { const netId = await api.getNetworkId?.(); network = netId === 1 ? 'mainnet' : 'testnet' } catch {}
        const result = { address: sessionAddr, network, provider: 'Lace Wallet' as const }
        setConnected(result)
        onConnected?.(result)
        return
      }

      throw new Error('Supported wallet provider not found')
    } catch (e: any) {
      setError(e?.message || 'Failed to connect wallet')
      setConnected(null)
    } finally {
      setIsConnecting(false)
    }
  }, [addressInput, onConnected])

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-slate-800 border border-slate-600"><Shield className="w-5 h-5 text-slate-300"/></div>
          <h3 className="text-white font-semibold text-lg">Midnight Wallet Connect (Address-Gated)</h3>
        </div>

        <label className="block text-xs text-slate-400 mb-2">Midnight Wallet Address</label>
        <input
          value={addressInput}
          onChange={(e) => { setAddressInput(e.target.value); setValidated(false); setError(null) }}
          placeholder="Paste your Midnight wallet address"
          className="w-full px-4 py-3 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => validateAddress(addressInput)}
            disabled={isValidating || !addressInput.trim()}
            className={`px-4 py-2 rounded-lg border text-sm ${isValidating ? 'opacity-60' : ''} bg-slate-800 text-white border-slate-600 hover:bg-slate-700`}
          >
            {isValidating ? 'Validating…' : 'Validate Address'}
          </button>
          <button
            onClick={connect}
            disabled={!canConnect}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm ${!canConnect ? 'opacity-60 cursor-not-allowed' : ''} bg-white text-black border-gray-300 hover:bg-gray-100`}
          >
            {isConnecting ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"/> : <Wallet className="w-4 h-4"/>}
            {isConnecting ? 'Connecting…' : 'Connect'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-sm text-red-300 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0"/>
            <span>{error}</span>
          </div>
        )}

        {connected && (
          <div className="mt-4 p-3 rounded-lg border border-green-500/40 bg-green-500/10 text-sm text-green-300 flex items-start gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5"/>
            <div className="flex-1">
              <div className="text-white text-sm font-semibold">Connected</div>
              <div className="text-xs text-slate-300 mt-1">Provider: {connected.provider}</div>
              <div className="text-xs text-slate-300">Network: {connected.network}</div>
              <div className="text-xs text-slate-300 break-all">Address: {connected.address}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
