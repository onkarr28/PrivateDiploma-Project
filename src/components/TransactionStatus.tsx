/**
 * Transaction Status Component
 * Displays real-time transaction status with gas fees and block confirmation
 */

import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Loader } from 'lucide-react'
import { TransactionResult, GasEstimate } from '../utils/transactionManager'

interface TransactionStatusProps {
  txHash: string
  status: TransactionResult
  gasEstimate?: GasEstimate
  onClose?: () => void
}

export default function TransactionStatus({
  txHash,
  status,
  gasEstimate,
  onClose,
}: TransactionStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    switch (status.status) {
      case 'pending':
        return <Loader className="w-6 h-6 text-yellow-400 animate-spin" />
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-400" />
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-400" />
      default:
        return <Clock className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status.status) {
      case 'pending':
        return 'border-yellow-500 bg-yellow-950/20'
      case 'confirmed':
        return 'border-green-500 bg-green-950/20'
      case 'failed':
        return 'border-red-500 bg-red-950/20'
      default:
        return 'border-gray-500 bg-gray-950/20'
    }
  }

  const getStatusText = () => {
    switch (status.status) {
      case 'pending':
        return 'Transaction Pending'
      case 'confirmed':
        return 'Transaction Confirmed'
      case 'failed':
        return 'Transaction Failed'
      default:
        return 'Unknown Status'
    }
  }

  const formatGas = (gas: string) => {
    const gasNum = parseInt(gas)
    return (gasNum / 1e9).toFixed(6) // Convert to Gwei
  }

  const formatTimeElapsed = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className={`card p-6 border-2 ${getStatusColor()} animate-fade-in`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-bold text-gray-100">{getStatusText()}</h3>
            <p className="text-xs text-gray-400">
              {status.status === 'pending' && `Elapsed: ${formatTimeElapsed(timeElapsed)}`}
              {status.status === 'confirmed' && `Block: ${status.blockNumber}`}
              {status.status === 'failed' && 'Transaction reverted'}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Transaction Hash */}
      <div className="bg-slate-800/50 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Transaction Hash:</span>
          <div className="flex items-center gap-2">
            <code className="text-xs font-mono text-cyan-300">
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </code>
            <a
              href={`https://explorer.midnight.network/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

      {/* Gas Information */}
      {gasEstimate && (
        <div className="space-y-2 mb-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Gas & Fees</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Gas Limit</p>
              <p className="text-sm font-semibold text-gray-200">
                {parseInt(gasEstimate.gasLimit).toLocaleString()}
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Gas Price</p>
              <p className="text-sm font-semibold text-gray-200">
                {formatGas(gasEstimate.gasPrice)} Gwei
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Estimated Fee</p>
              <p className="text-sm font-semibold text-green-400">
                {formatGas(gasEstimate.estimatedFee)} DUST
              </p>
            </div>
            
            <div className="bg-slate-800/50 p-3 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Max Fee</p>
              <p className="text-sm font-semibold text-yellow-400">
                {formatGas(gasEstimate.maxFee)} DUST
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Gas Used (after confirmation) */}
      {status.status === 'confirmed' && status.gasUsed && (
        <div className="bg-green-950/20 border border-green-500/30 p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-400">Actual Gas Used:</span>
            <span className="text-sm font-semibold text-green-300">
              {parseInt(status.gasUsed).toLocaleString()} ({((parseInt(status.gasUsed) / parseInt(gasEstimate?.gasLimit || '1')) * 100).toFixed(1)}% of limit)
            </span>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-blue-950/20 border border-blue-500/30 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-blue-300 mb-1">Privacy Preserved</p>
            <p className="text-xs text-gray-400">
              Only the ZK commitment is visible on-chain. Student data (name, grades, ID) remains private.
            </p>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {status.status === 'pending' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-yellow-400">
            ⏳ Waiting for block confirmation... This may take 10-30 seconds
          </p>
        </div>
      )}

      {status.status === 'confirmed' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-green-400">
            ✓ Transaction confirmed and permanently recorded on Midnight Network
          </p>
        </div>
      )}

      {status.status === 'failed' && (
        <div className="mt-4 text-center">
          <p className="text-xs text-red-400">
            ✕ Transaction failed. Please check your wallet balance and try again
          </p>
        </div>
      )}
    </div>
  )
}
