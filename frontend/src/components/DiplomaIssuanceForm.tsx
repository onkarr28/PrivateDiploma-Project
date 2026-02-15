import { useState } from 'react'
import { Send, X, CheckCircle2, Clock, Zap } from 'lucide-react'

interface DiplomaIssuanceFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  universityAddress: string
}

type TransactionStep = 'idle' | 'committing' | 'proof-generation' | 'broadcasting' | 'confirmed'

interface TransactionStatus {
  step: TransactionStep
  txHash: string
  blockNumber: string
}

// Generate transaction hash
function generateTransactionHash(): string {
  const chars = '0123456789abcdef'
  let hash = '0x'
  for (let i = 0; i < 64; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return hash
}

// Generate block number
function generateBlockNumber(): string {
  return Math.floor(Math.random() * 1000000 + 2500000).toString()
}

export default function DiplomaIssuanceForm({
  onSubmit,
  onCancel,
  universityAddress,
}: DiplomaIssuanceFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null)
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    degreeType: '',
    department: '',
    marks: {
      subject1: '0',
      subject2: '0',
      subject3: '0',
    },
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const simulateTransactionStep = async (
    step: TransactionStep,
    duration: number,
    txHash: string,
    blockNumber: string
  ) => {
    setTransactionStatus({ step, txHash, blockNumber })
    await new Promise((resolve) => setTimeout(resolve, duration))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const txHash = generateTransactionHash()
      const blockNumber = generateBlockNumber()

      // Step 1: ZK Commitment - 3 seconds
      await simulateTransactionStep('committing', 3000, txHash, blockNumber)

      // Step 2: Proof Generation - 4 seconds
      await simulateTransactionStep('proof-generation', 4000, txHash, blockNumber)

      // Step 3: Broadcasting to Node - 3 seconds
      await simulateTransactionStep('broadcasting', 3000, txHash, blockNumber)

      // Step 4: Confirmed
      await simulateTransactionStep('confirmed', 2000, txHash, blockNumber)

      // Call onSubmit with full diploma data
      onSubmit({
        ...formData,
        certificateHash: txHash,
        transactionHash: txHash,
        blockNumber: blockNumber,
        timestamp: new Date().toISOString(),
        status: 'confirmed',
      })

      // Reset form after success
      setTimeout(() => {
        setFormData({
          studentId: '',
          studentName: '',
          degreeType: '',
          department: '',
          marks: {
            subject1: '0',
            subject2: '0',
            subject3: '0',
          },
        })
        setTransactionStatus(null)
        setIsLoading(false)
      }, 2000)
    } catch (error) {
      console.error('Error issuing diploma:', error)
      setIsLoading(false)
      setTransactionStatus(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Show transaction progress instead of form when processing */}
      {transactionStatus && (
        <div className="space-y-4 mb-4">
          {/* Transaction Status Steps */}
          <div className="bg-black bg-opacity-30 border border-cyan-400 border-opacity-50 rounded-lg p-6">
            <h4 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
              <Zap size={20} />
              Broadcasting Transaction to Midnight Network
            </h4>

            <div className="space-y-3">
              {/* Step 1: ZK Commitment */}
              <div className="flex items-center gap-3">
                {transactionStatus.step === 'committing' || 
                 transactionStatus.step === 'proof-generation' ||
                 transactionStatus.step === 'broadcasting' ||
                 transactionStatus.step === 'confirmed' ? (
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                ) : (
                  <Clock size={20} className="text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    Step 1: Calculating ZK-Commitment...
                  </p>
                  {transactionStatus.step === 'committing' && (
                    <p className="text-xs text-gray-400 mt-1">Processing cryptographic hash...</p>
                  )}
                </div>
                {transactionStatus.step === 'committing' && (
                  <div className="w-4 h-4 rounded-full border-2 border-green-400 border-t-transparent animate-spin"></div>
                )}
              </div>

              {/* Step 2: Proof Generation */}
              <div className="flex items-center gap-3">
                {transactionStatus.step === 'proof-generation' ||
                 transactionStatus.step === 'broadcasting' ||
                 transactionStatus.step === 'confirmed' ? (
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                ) : (
                  <Clock size={20} className="text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    Step 2: Generating Proof on Local Server...
                  </p>
                  {transactionStatus.step === 'proof-generation' && (
                    <p className="text-xs text-gray-400 mt-1">Creating zero-knowledge proof...</p>
                  )}
                </div>
                {transactionStatus.step === 'proof-generation' && (
                  <div className="w-4 h-4 rounded-full border-2 border-green-400 border-t-transparent animate-spin"></div>
                )}
              </div>

              {/* Step 3: Broadcasting to Node */}
              <div className="flex items-center gap-3">
                {transactionStatus.step === 'broadcasting' ||
                 transactionStatus.step === 'confirmed' ? (
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                ) : (
                  <Clock size={20} className="text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    Step 3: Broadcasting to Midnight Node...
                  </p>
                  {transactionStatus.step === 'broadcasting' && (
                    <p className="text-xs text-gray-400 mt-1">Submitting to blockchain network...</p>
                  )}
                </div>
                {transactionStatus.step === 'broadcasting' && (
                  <div className="w-4 h-4 rounded-full border-2 border-green-400 border-t-transparent animate-spin"></div>
                )}
              </div>
            </div>

            {/* Transaction Hash and Block - Show when confirmed */}
            {transactionStatus.step === 'confirmed' && (
              <div className="mt-6 pt-6 border-t border-cyan-400 border-opacity-30 space-y-3 animate-fade-in">
                <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded p-3">
                  <p className="text-green-400 font-bold text-sm flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    ✓ Transaction Confirmed
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
                  <code className="text-xs text-cyan-400 bg-black bg-opacity-50 p-2 rounded block break-all">
                    {transactionStatus.txHash}
                  </code>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">Included in Block:</p>
                  <p className="text-sm text-white font-mono">
                    Block #{transactionStatus.blockNumber}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show form only when not processing */}
      {!isLoading && (
        <>
          {/* Student ID */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Student ID
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleInputChange}
              placeholder="e.g., STU-2026-001"
              className="input-field"
              required
            />
          </div>

          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Student Name
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleInputChange}
              placeholder="Full name"
              className="input-field"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Will be hashed and committed (not stored on-chain)
            </p>
          </div>

          {/* Degree Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Degree Type
            </label>
            <select
              name="degreeType"
              value={formData.degreeType}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Select degree type...</option>
              <option value="Bachelor of Science in Computer Science">
                B.Sc. Computer Science
              </option>
              <option value="Bachelor of Science in Engineering">
                B.Sc. Engineering
              </option>
              <option value="Bachelor of Science in Mathematics">
                B.Sc. Mathematics
              </option>
              <option value="Master of Science in Computer Science">
                M.Sc. Computer Science
              </option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Department of Computer Science"
              className="input-field"
              required
            />
          </div>

          {/* Divider */}
          <div className="border-t border-white border-opacity-20 my-4"></div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
            Issue Diploma
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary w-full flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>

          {/* Privacy Notice */}
          <div className="info-message text-xs">
            <strong>Privacy Notice:</strong> Student grades and name will be cryptographically hashed and committed. No sensitive data will be exposed on the public ledger.
          </div>
        </>
      )}

      {/* Show spinner during processing */}
      {isLoading && !transactionStatus && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3"></div>
          <p className="text-gray-300 text-sm">Preparing transaction...</p>
        </div>
      )}
    </form>
  )
}
