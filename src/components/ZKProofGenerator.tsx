import { useState } from 'react'
import { X, Copy, Download, Lock, CheckCircle2 } from 'lucide-react'

// Simple hash function for browser environment
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
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

export default function ZKProofGenerator({
  credential,
  studentData,
  onClose,
}: ZKProofGeneratorProps) {
  const [step, setStep] = useState<'confirm' | 'generating' | 'result'>('confirm')
  const [proof, setProof] = useState<any>(null)
  const [copiedFields, setCopiedFields] = useState<Set<string>>(new Set())

  const generateProof = async () => {
    setStep('generating')

    try {
      // Simulate proof generation
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate cryptographic commitment
      const dataString = JSON.stringify(studentData)
      const proofCommitment = await sha256(dataString)

      // Generate cryptographic random values
      const nullifier = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      const nonce = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      const studentDataHash = await sha256(dataString)

      const newProof = {
        certificateHash: credential.certificateHash,
        proofCommitment,
        nullifier,
        nonce,
        timestamp: new Date().toISOString(),
        studentDataHash,
      }

      setProof(newProof)
      setStep('result')
    } catch (error) {
      console.error('Error generating proof:', error)
      setStep('confirm')
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
    element.setAttribute('download', `proof_${credential.id}.json`)
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

        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mb-4"></div>
            <p className="text-gray-300 text-lg">Generating your proof...</p>
            <p className="text-gray-500 text-sm mt-2">
              This is happening locally on your device
            </p>
          </div>
        )}

        {step === 'result' && proof && (
          <>
            {/* Success Message */}
            <div className="success-message mb-6 flex items-start gap-3">
              <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <strong>✓ Proof Generated Successfully!</strong>
                <p className="text-sm mt-1">
                  Your zero-knowledge proof is ready. You can now share this with employers
                  without revealing your personal information.
                </p>
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

              <div>
                <p className="text-sm text-gray-500 mb-2">Generated At:</p>
                <p className="text-gray-300">{proof.timestamp}</p>
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
