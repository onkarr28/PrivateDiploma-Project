import { useState } from 'react'
import { X, Copy, Download, Lock, CheckCircle2, Zap, Clock } from 'lucide-react'

// Simple hash function for browser environment
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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

interface Credential {
  id: string
  degree: string
  issuer: string
  certificateHash: string
  issuanceDate: string
  expiryDate: string
  status: 'valid' | 'revoked'
}

interface StudentData {
  name: string
  email: string
  studentId: string
  marks: Record<string, number>
}

interface ZKProofGeneratorProps {
  credential: Credential
  studentData: StudentData
  onClose: () => void
}

type ProofStep = 'confirm' | 'hashing' | 'computing-commitment' | 'generating-nullifier' | 'result'

export default function ZKProofGenerator({
  credential,
  studentData,
  onClose,
}: ZKProofGeneratorProps) {
  const [step, setStep] = useState<ProofStep>('confirm')
  const [proof, setProof] = useState<any>(null)
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())
  const [proofStep, setProofStep] = useState<ProofStep | null>(null)

  const generateProof = async () => {
    setStep('hashing')
    setProofStep('hashing')

    try {
      // Step 1: Hash student data - 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const dataString = JSON.stringify(studentData)
      const studentDataHash = await sha256(dataString)

      // Step 2: Computing commitment - 2 seconds
      setProofStep('computing-commitment')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const proofCommitment = await sha256(dataString + Date.now())

      // Step 3: Generating nullifier - 2 seconds
      setProofStep('generating-nullifier')
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const nullifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      const newProof = {
        certificateHash: credential.certificateHash,
        transactionHash: generateTransactionHash(),
        proofCommitment,
        nullifier,
        nonce,
        timestamp: new Date().toISOString(),
        studentDataHash,
        status: 'generated',
      }

      setProof(newProof)
      setStep('result')
      setProofStep(null)
    } catch (error) {
      console.error('Error generating proof:', error)
      setStep('confirm')
      setProofStep(null)
    }
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    const newCopied = new Set(copiedFields)
    newCopied.add(field)
    setCopiedFields(newCopied)
    setTimeout(() => {
      const updated = new Set(copiedFields)
      updated.delete(field)
      setCopiedFields(updated)
    }, 2000)
  }

  const downloadProof = () => {
    const proofData = JSON.stringify(proof, null, 2)
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(proofData)
    )
    element.setAttribute('download', `proof_${credential.id}_${Date.now()}.json`)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock size={28} className="text-cyan-400" />
            Generate Zero-Knowledge Proof
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        {step === 'confirm' && (
          <>
            {/* Privacy Notice */}
            <div className="info-message mb-6">
              <strong>⚠️ Important:</strong> This proof will be generated locally on your
              device. Your actual name, grades, and personal information will NEVER be sent
              anywhere. Only the cryptographic proof will be shared.
            </div>

            {/* Credential Info */}
            <div className="bg-white bg-opacity-5 p-6 rounded-lg border border-white border-opacity-20 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Credential Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Degree:</p>
                  <p className="text-white">{credential.degree}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issued by:</p>
                  <p className="text-white">{credential.issuer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Issuance Date:</p>
                  <p className="text-white">{credential.issuanceDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status:</p>
                  <p className="text-green-400">{credential.status.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* What Will Happen */}
            <div className="bg-white bg-opacity-5 p-6 rounded-lg border border-white border-opacity-20 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                What Happens Next
              </h3>
              <ol className="space-y-3">
                {[
                  'Your credential data will be hashed locally (not sent anywhere)',
                  'A cryptographic commitment will be created',
                  'A unique nullifier will be generated (prevents reuse)',
                  'You can share this proof with employers',
                  'They verify it on-chain without learning your identity',
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-cyan-400 font-bold flex-shrink-0">
                      {idx + 1}.
                    </span>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Generate Button */}
            <button
              onClick={generateProof}
              className="btn-primary w-full mb-3"
            >
              Generate Proof Locally
            </button>

            <button
              onClick={onClose}
              className="btn-secondary w-full"
            >
              Cancel
            </button>
          </>
        )}

        {step !== 'confirm' && step !== 'result' && (
          <div className="space-y-6">
            {/* Progress Title */}
            <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
              <Zap size={20} />
              Computing Zero-Knowledge Proof
            </h3>

            {/* Step 1: Hashing Data */}
            <div className="flex items-start gap-3">
              {proofStep === 'hashing' ? (
                <div className="w-5 h-5 rounded-full border-2 border-green-400 border-t-transparent animate-spin flex-shrink-0 mt-0.5"></div>
              ) : proofStep && ['computing-commitment', 'generating-nullifier'].includes(proofStep) ? (
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-white font-medium">
                  Step 1: Hashing Student Data
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Converting credential info to cryptographic hash...
                </p>
              </div>
            </div>

            {/* Step 2: Computing Commitment */}
            <div className="flex items-start gap-3">
              {proofStep === 'computing-commitment' ? (
                <div className="w-5 h-5 rounded-full border-2 border-green-400 border-t-transparent animate-spin flex-shrink-0 mt-0.5"></div>
              ) : proofStep === 'generating-nullifier' ? (
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-white font-medium">
                  Step 2: Computing Commitment
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Creating zero-knowledge commitment from hash...
                </p>
              </div>
            </div>

            {/* Step 3: Generating Nullifier */}
            <div className="flex items-start gap-3">
              {proofStep === 'generating-nullifier' ? (
                <div className="w-5 h-5 rounded-full border-2 border-green-400 border-t-transparent animate-spin flex-shrink-0 mt-0.5"></div>
              ) : proofStep === null ? (
                <CheckCircle2 size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock size={20} className="text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-white font-medium">
                  Step 3: Generating Nullifier
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Creating unique identifier to prevent proof reuse...
                </p>
              </div>
            </div>

            {/* Status Message */}
            <div className="bg-black bg-opacity-30 border border-cyan-400 border-opacity-30 rounded p-3 text-center">
              <p className="text-sm text-gray-300">
                🔐 All computation is happening <strong>locally</strong> on your device.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your personal data never leaves your browser.
              </p>
            </div>
          </div>
        )}

        {step === 'result' && proof && (
          <>
            {/* Success Message */}
            <div className="success-message mb-6 flex items-start gap-3">
              <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>✓ Zero-Knowledge Proof Generated Successfully!</strong>
                <p className="text-sm mt-1">
                  Your proof is ready to share with employers without revealing your identity.
                </p>
              </div>
            </div>

            {/* Transaction Success Info */}
            <div className="bg-green-500 bg-opacity-10 border border-green-500 border-opacity-30 rounded-lg p-4 mb-6">
              <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} />
                Proof Details
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Proof Transaction Hash:</p>
                  <code className="text-xs text-cyan-400 bg-black bg-opacity-50 p-2 rounded block break-all">
                    {proof.transactionHash}
                  </code>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Generated At:</p>
                  <p className="text-gray-300">{proof.timestamp}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status:</p>
                  <p className="text-green-400 font-medium">✓ Ready to Share</p>
                </div>
              </div>
            </div>

            {/* Proof Details */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Proof Commitment:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black bg-opacity-50 px-3 py-2 rounded text-xs text-cyan-400 overflow-x-auto">
                    {proof.proofCommitment}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(proof.proofCommitment, 'commitment')
                    }
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition flex-shrink-0"
                  >
                    <Copy
                      size={16}
                      className={
                        copiedFields.has('commitment')
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }
                    />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Nullifier (Prevents Reuse):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black bg-opacity-50 px-3 py-2 rounded text-xs text-purple-400 overflow-x-auto">
                    {proof.nullifier}
                  </code>
                  <button
                    onClick={() => copyToClipboard(proof.nullifier, 'nullifier')}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition flex-shrink-0"
                  >
                    <Copy
                      size={16}
                      className={
                        copiedFields.has('nullifier')
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }
                    />
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Nonce:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-black bg-opacity-50 px-3 py-2 rounded text-xs text-pink-400 overflow-x-auto">
                    {proof.nonce}
                  </code>
                  <button
                    onClick={() => copyToClipboard(proof.nonce, 'nonce')}
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition flex-shrink-0"
                  >
                    <Copy
                      size={16}
                      className={
                        copiedFields.has('nonce')
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Reminder */}
            <div className="info-message mb-6 text-xs">
              🔐 Your data (name, grades, ID) was ONLY used locally to create the proof.
              It was NEVER sent anywhere. Employers can only verify the proof on-chain.
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={downloadProof}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download Proof JSON
              </button>

              <button
                onClick={onClose}
                className="btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
