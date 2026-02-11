import { useState } from 'react'
import { CheckCircle2, AlertCircle, Upload, Search, Clock, Loader } from 'lucide-react'
import { useMidnightSDK } from '../utils/MidnightProvider'

interface EmployerVerificationProps {
  userAddress: string
}

interface VerificationResult {
  isValid: boolean
  diplomaHash: string
  message: string
  verifiedAt: number
  employerVerified: string
}

export default function EmployerVerification({ userAddress }: EmployerVerificationProps) {
  const { verifyDiploma, isLoading: sdkLoading, error: sdkError } = useMidnightSDK()
  
  const [step, setStep] = useState<'upload' | 'verifying' | 'result'>('upload')
  const [proof, setProof] = useState<any>(null)
  const [result, setResult] = useState<VerificationResult | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [useManual, setUseManual] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const proofData = JSON.parse(content)
        setProof(proofData)
        verifyProof(proofData)
      } catch (error) {
        alert('Invalid proof file format')
        console.error(error)
      }
    }
    reader.readAsText(file)
  }

  const handleManualSubmit = () => {
    try {
      const proofData = JSON.parse(manualInput)
      setProof(proofData)
      verifyProof(proofData)
    } catch (error) {
      alert('Invalid JSON format')
      console.error(error)
    }
  }

  const verifyProof = async (proofData: any) => {
    setStep('verifying')
    setVerificationError(null)

    try {
      console.log('🔍 Verifying diploma on Midnight Network...')
      
      // Call SDK to verify the diploma
      const verificationResult = await verifyDiploma({
        certificateHash: proofData.certificateHash || '',
        studentDataCommitment: proofData.commitment || '',
        proofData: proofData.proof || '',
      })

      // Format the result
      const result: VerificationResult = {
        isValid: verificationResult.isValid,
        diplomaHash: verificationResult.isValid ? (proofData.certificateHash || '') : '',
        message: verificationResult.message,
        verifiedAt: Date.now(),
        employerVerified: userAddress,
      }

      setResult(result)
      setStep('result')
      console.log('✅ Diploma verified successfully!')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      setVerificationError(errorMessage)
      console.error('❌ Verification error:', error)
      setStep('upload')
    }
  }

  const reset = () => {
    setStep('upload')
    setProof(null)
    setResult(null)
    setManualInput('')
    setUseManual(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Error Messages */}
        {(verificationError || sdkError) && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-200 font-semibold">Verification Error</p>
              <p className="text-red-300 text-sm">{verificationError || sdkError}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🏢 Employer Verification Portal
          </h1>
          <p className="text-gray-300">
            Verify candidate credentials with zero-knowledge proofs
          </p>
        </div>

        {/* Info Banner */}
        <div className="card p-6 mb-8 border-l-4 border-green-400">
          <div className="flex items-start gap-4">
            <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
              <CheckCircle2 size={24} className="text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Privacy-First Verification
              </h3>
              <p className="text-gray-300 text-sm">
                Verify candidate credentials instantly without accessing their personal
                information. Our system uses zero-knowledge proofs to confirm diploma
                validity while maintaining complete candidate privacy.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-20">
              <h3 className="text-xl font-bold text-white mb-4">
                📋 Verify Candidate
              </h3>

              {step === 'upload' && (
                <>
                  {!useManual ? (
                    <>
                      {/* File Upload */}
                      <div className="mb-6">
                        <label className="block mb-3">
                          <div className="border-2 border-dashed border-white border-opacity-30 rounded-lg p-6 text-center cursor-pointer hover:border-opacity-50 transition">
                            <Upload size={32} className="mx-auto text-cyan-400 mb-2" />
                            <p className="text-white font-medium mb-1">
                              Upload Proof File
                            </p>
                            <p className="text-xs text-gray-400">
                              JSON file from candidate
                            </p>
                          </div>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Or Divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-white border-opacity-20"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-2 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-sm text-gray-400">
                            or
                          </span>
                        </div>
                      </div>

                      {/* Manual Input Toggle */}
                      <button
                        onClick={() => setUseManual(true)}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <Search size={18} />
                        Manual Input
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Manual Input */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Paste Proof JSON
                        </label>
                        <textarea
                          value={manualInput}
                          onChange={(e) => setManualInput(e.target.value)}
                          placeholder='Paste proof JSON here...'
                          className="input-field h-32 font-mono text-sm resize-none"
                        />
                      </div>

                      <button
                        onClick={handleManualSubmit}
                        disabled={!manualInput.trim()}
                        className="btn-primary w-full mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verify Proof
                      </button>

                      <button
                        onClick={() => setUseManual(false)}
                        className="btn-secondary w-full"
                      >
                        Back to Upload
                      </button>
                    </>
                  )}
                </>
              )}

              {step === 'verifying' && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 rounded-full border-4 border-green-400 border-t-transparent animate-spin mb-4"></div>
                  <p className="text-gray-300 text-lg font-medium">
                    Verifying on Midnight Network...
                  </p>
                  <p className="text-gray-500 text-sm mt-2">
                    Checking certificate validity and proof
                  </p>
                </div>
              )}

              {step === 'result' && result && (
                <>
                  {result.isValid ? (
                    <div className="success-message mb-6 flex items-start gap-3">
                      <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>✓ Verified</strong>
                        <p className="text-sm mt-1">{result.message}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="error-message mb-6 flex items-start gap-3">
                      <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>✗ Verification Failed</strong>
                        <p className="text-sm mt-1">{result.message}</p>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={reset}
                    className="btn-primary w-full"
                  >
                    Verify Another
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            {step === 'result' && result && (
              <div className="space-y-6 animate-fade-in">
                {/* Verification Summary */}
                <div className="card p-8 border-l-4 border-green-400">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="bg-green-500 bg-opacity-20 p-3 rounded-lg">
                      <CheckCircle2 size={32} className="text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Diploma Verified
                      </h3>
                      <p className="text-green-300 font-medium">
                        This candidate possesses a valid diploma
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white border-opacity-20">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Issued By:</p>
                      <p className="text-white font-medium">{result.employerVerified}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Verified At:</p>
                      <p className="text-white font-medium">
                        {new Date(result.verifiedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* What You Know */}
                <div className="card p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    ✓ What You Can Confirm
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'This person holds a valid diploma',
                      'The diploma is from an authorized institution',
                      'The diploma has not been revoked',
                      'Verification occurred on the Midnight Network',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-400 font-bold flex-shrink-0">
                          ✓
                        </span>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* What You Don't Know */}
                <div className="card p-6 border-l-4 border-cyan-400">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    🔐 What Remains Private
                  </h4>
                  <ul className="space-y-3">
                    {[
                      'Candidate name - Never revealed',
                      'Grades and marks - Completely private',
                      'Academic transcript - Not accessible',
                      'Student ID - Fully protected',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-cyan-400 font-bold flex-shrink-0">
                          🔒
                        </span>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Proof Details */}
                <div className="card p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    📋 Proof Details
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Certificate Hash:</p>
                      <code className="bg-black bg-opacity-50 px-3 py-2 rounded text-xs text-cyan-400 block break-all">
                        {result.diplomaHash}
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step !== 'result' && step !== 'verifying' && (
              <div className="card p-12 text-center">
                <Clock size={48} className="mx-auto text-gray-400 mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Ready to Verify
                </h3>
                <p className="text-gray-400">
                  Upload or paste a proof file from the candidate to begin verification
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Receive Proof',
              description:
                'Candidate provides their zero-knowledge proof (no personal data exposed)',
            },
            {
              step: '2',
              title: 'Verify On-Chain',
              description:
                'Smart contract validates the proof on Midnight Network',
            },
            {
              step: '3',
              title: 'Instant Results',
              description:
                'Know immediately if diploma is valid - that\'s all you need!',
            },
          ].map((item, idx) => (
            <div key={idx} className="card p-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center font-bold text-white mb-4">
                {item.step}
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h4>
              <p className="text-gray-300 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
