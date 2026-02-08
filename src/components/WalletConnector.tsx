import { useState, useEffect } from 'react'
import { Wallet, X, Lock, CheckCircle, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react'
import { midnightWalletManager, MidnightWalletAccount } from '../utils/midnightWallet'
import { logWalletInfo, detectWallet } from '../utils/walletDebug'

interface WalletConnectorProps {
  selectedRole: string
  onConnect: (address: string) => void
  onCancel: () => void
}

export default function WalletConnector({
  selectedRole,
  onConnect,
  onCancel,
}: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [account, setAccount] = useState<MidnightWalletAccount | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Log wallet detection info to console
    console.log('🔍 Starting wallet detection...');
    logWalletInfo();
    
    // Initialize wallet
    midnightWalletManager.initializeWallet()
      .then(() => {
        console.log('✓ Wallet manager initialized');
      })
      .catch((e) => {
        console.error('❌ Wallet initialization failed:', e);
        setError(e.message);
      });

    // Check if wallet was previously connected
    const storedAccount = midnightWalletManager.getAccount()
    if (storedAccount) {
      console.log('✓ Found stored wallet connection');
      setAccount(storedAccount)
    }

    // Subscribe to wallet changes
    const unsubscribe = midnightWalletManager.onAccountChange((acc) => {
      console.log('Wallet account changed:', acc);
      setAccount(acc)
    })

    return () => unsubscribe()
  }, [])

  const getRoleColorGradient = () => {
    return 'bg-gray-700'
  }

  const getRoleDescription = () => {
    switch (selectedRole) {
      case 'university':
        return 'Issue and manage digital diplomas with complete privacy preservation'
      case 'student':
        return 'Access your credentials and generate zero-knowledge proofs'
      case 'employer':
        return 'Verify candidate credentials without accessing personal data'
      default:
        return 'Connect your wallet to get started'
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check wallet detection first
      const detection = detectWallet();
      console.log('Wallet detection result:', detection);
      
      if (!detection.detected) {
        throw new Error(detection.error || 'No wallet extension found');
      }
      
      console.log(`🔗 Attempting to connect to ${detection.walletType}...`);
      
      // Connect to real Midnight wallet
      const connectedAccount = await midnightWalletManager.connectWallet()
      
      console.log('✓ Wallet connected successfully:', connectedAccount);
      setAccount(connectedAccount)
      onConnect(connectedAccount.address)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to wallet'
      console.error('❌ Wallet connection error:', err)
      setError(errorMessage)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = async () => {
    await midnightWalletManager.disconnectWallet()
    setAccount(null)
    onCancel()
  }

  // If wallet is already connected
  if (account) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="card-premium p-8 backdrop-blur-xl max-w-2xl w-full rounded-[3rem] border border-slate-700 border-opacity-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-800 border border-gray-600 rounded-xl shadow-lg">
                <Wallet className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                {account.walletType} Connected
              </h3>
            </div>
            <button
              onClick={handleDisconnect}
              className="p-2 hover:bg-slate-800 hover:bg-opacity-50 rounded-lg text-slate-400 hover:text-slate-200 transition-all duration-300"
            >
              <X size={24} />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8" />

          {/* Connection Status */}
          <div className="bg-green-600 bg-opacity-10 p-6 rounded-xl border border-green-500 border-opacity-50 mb-8">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-300 mb-4">
                  Successfully Connected to Midnight Network
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-800 bg-opacity-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Address:</span>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-2 text-xs font-mono text-gray-300 hover:text-white transition-colors"
                    >
                      {account.address.slice(0, 16)}...{account.address.slice(-8)}
                      {copied ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 bg-opacity-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Balance:</span>
                    <span className="text-xs font-semibold text-gray-300">
                      ₳{parseFloat(account.balance).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 bg-opacity-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Network:</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      account.network === 'testnet' 
                        ? 'bg-amber-600 bg-opacity-20 text-amber-300 border border-amber-600 border-opacity-50' 
                        : 'bg-green-500 bg-opacity-20 text-green-300 border border-green-500 border-opacity-50'
                    }`}>
                      {account.network === 'testnet' ? 'TESTNET' : 'MAINNET'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-slate-800 bg-opacity-50 p-3 rounded-lg">
                    <span className="text-xs text-slate-400">Role:</span>
                    <span className="text-xs font-semibold text-white capitalize">
                      {selectedRole}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800 bg-opacity-40 p-4 rounded-lg border border-slate-700 border-opacity-30 flex flex-col items-center justify-center text-center min-h-[80px]">
              <p className="text-lg font-mono text-slate-400 mb-2">■■■</p>
              <p className="text-xs font-semibold text-slate-300">Encrypted</p>
            </div>
            <div className="bg-slate-800 bg-opacity-40 p-4 rounded-lg border border-slate-700 border-opacity-30 flex flex-col items-center justify-center text-center min-h-[80px]">
              <p className="text-lg font-mono text-slate-400 mb-2">→→→</p>
              <p className="text-xs font-semibold text-slate-300">Real-time</p>
            </div>
            <div className="bg-slate-800 bg-opacity-40 p-4 rounded-lg border border-slate-700 border-opacity-30 flex flex-col items-center justify-center text-center min-h-[80px]">
              <p className="text-lg font-mono text-slate-400 mb-2">✓</p>
              <p className="text-xs font-semibold text-slate-300">On-Chain</p>
            </div>
          </div>

          {/* Proceed Button */}
          <button
            onClick={() => onConnect(account.address)}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold bg-white text-black rounded-xl border border-gray-300 hover:bg-gray-100 transition-all duration-300"
          >
            <CheckCircle size={22} />
            Continue to Dashboard
          </button>

          {/* Info Footer */}
          <div className="mt-6 p-4 bg-slate-800 bg-opacity-30 rounded-lg border border-slate-700 border-opacity-30">
            <p className="text-xs text-slate-400 text-center mb-2">
              Connected to real Midnight Network wallet. All operations are on-chain and can be verified.
            </p>
            <div className={`text-xs text-center font-semibold px-3 py-1.5 rounded mt-2 ${
              account.network === 'testnet'
                ? 'bg-amber-600 bg-opacity-10 text-amber-300 border border-amber-600 border-opacity-30'
                : 'bg-green-500 bg-opacity-10 text-green-300 border border-green-500 border-opacity-30'
            }`}>
              {account.network === 'testnet' ? 'TEST MODE - Using Testnet' : 'LIVE - Using Mainnet'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="card-premium p-8 backdrop-blur-xl max-w-2xl w-full rounded-[3rem] border border-slate-700 border-opacity-50">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-xl shadow-lg">
              <Wallet className="w-6 h-6 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-white">
              Connect Wallet
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-slate-800 hover:bg-opacity-50 rounded-lg text-slate-400 hover:text-slate-200 transition-all duration-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mb-8" />

        {/* Role Info Card */}
        <div className="bg-gray-800 bg-opacity-10 p-6 rounded-xl border border-slate-700 border-opacity-50 mb-8">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-300 mb-1">
                Role: <span className="text-white font-bold capitalize">
                  {selectedRole}
                </span>
              </p>
              <p className="text-sm text-slate-400">
                {getRoleDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Wallet Option Selection */}
        <div className="mb-8">
          <div className="bg-slate-800 bg-opacity-40 p-5 rounded-xl border border-slate-700 border-opacity-50">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Real Midnight Network Wallet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Connecting to your installed Midnight wallet extension
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 bg-opacity-40 p-4 rounded-lg border border-slate-700 border-opacity-30 flex flex-col items-center justify-center text-center min-h-[80px]">
            <p className="text-lg font-mono text-slate-400 mb-2">■■■</p>
            <p className="text-xs font-semibold text-slate-300">Encrypted</p>
          </div>
          <div className="bg-slate-800 bg-opacity-40 p-4 rounded-lg border border-slate-700 border-opacity-30 flex flex-col items-center justify-center text-center min-h-[80px]">
            <p className="text-lg font-mono text-slate-400 mb-2">→→→</p>
            <p className="text-xs font-semibold text-slate-300">Real-time</p>
          </div>
          <div className="bg-slate-800 bg-opacity-40 p-4 rounded-lg border border-slate-700 border-opacity-30 flex flex-col items-center justify-center text-center min-h-[80px]">
            <p className="text-lg font-mono text-slate-400 mb-2">✓</p>
            <p className="text-xs font-semibold text-slate-300">Verified</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 rounded-xl p-4 mb-8 animate-fade-in">
            <div className="flex gap-3">
              <AlertCircle size={18} className="flex-shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300 text-sm">Connection Error</p>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Make sure the Lace wallet extension is installed and active. Open the extension first before connecting.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`w-full flex items-center justify-center gap-3 py-4 px-6 text-lg font-semibold bg-white text-black rounded-xl border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
            isConnecting ? 'animate-pulse' : ''
          }`}
        >
          {isConnecting ? (
            <>
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Connecting to Midnight Wallet...
            </>
          ) : (
            <>
              <Wallet size={22} />
              Connect Midnight Wallet
            </>
          )}
        </button>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-slate-800 bg-opacity-30 rounded-lg border border-slate-700 border-opacity-30">
          <div className="flex gap-2 items-start">
            <CheckCircle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-1">
                Secure Connection
              </p>
              <p className="text-xs text-slate-400">
                Your private keys never leave your wallet. All operations are signed locally and verified on-chain by the Midnight Network.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Networks */}
        <div className="mt-6 pt-6 border-t border-slate-700 border-opacity-50">
          <div className="bg-amber-600 bg-opacity-10 border border-amber-600 border-opacity-30 rounded-lg p-3 mb-3">
            <p className="text-xs text-amber-300 text-center font-semibold">
              TESTNET MODE
            </p>
            <p className="text-xs text-slate-400 text-center mt-1">
              Safe for testing - No real funds required
            </p>
          </div>
          <p className="text-xs text-slate-500 text-center mb-2">
            🌐 Network: <span className="text-gray-300 font-semibold">Midnight Network (Testnet)</span>
          </p>
          <a
            href="https://midnight.network"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-white text-center block flex items-center justify-center gap-1"
          >
            Need help? Learn more about Midnight <ExternalLink size={12} />
          </a>
          <p className="text-xs text-slate-500 text-center mt-2">
            Make sure Lace wallet extension is installed in your browser
          </p>
          <p className="text-xs text-gray-400 text-center mt-1">
            Download from Chrome Web Store: Search "Lace Wallet"
          </p>
        </div>
      </div>
    </div>
  )
}
