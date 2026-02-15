import { useState, useEffect } from 'react'
import { Download, Share2, Lock, Zap, Loader, AlertCircle } from 'lucide-react'
import { useMidnightSDK } from '../utils/MidnightProvider'
import ZKProofGenerator from '../components/ZKProofGenerator'
import StudentCredentialCard from '../components/StudentCredentialCard'

interface StudentDashboardProps {
  userAddress: string
}

interface StudentCredential {
  id: string
  degree: string
  issuer: string
  certificateHash: string
  issuanceDate: string
  expiryDate: string
  status: 'valid' | 'revoked'
}

export default function StudentDashboard({ userAddress }: StudentDashboardProps) {
  const { 
    generateZKProof, 
    isLoading: sdkLoading, 
    error: sdkError,
    ledgerDiplomas,
    getLedgerDiplomasByIssuer,
  } = useMidnightSDK()
  
  const [credentials, setCredentials] = useState<StudentCredential[]>([])

  // Load credentials from ledger state commitment
  useEffect(() => {
    console.log('📚 Student Dashboard loaded for:', userAddress)
    
    // Load diplomas from ledger for this student
    if (ledgerDiplomas && ledgerDiplomas.length > 0) {
      const studentDiplomas = ledgerDiplomas.map((diploma: any, idx: number) => ({
        id: `cred_${idx}`,
        degree: diploma.degreeType || 'Bachelor of Science',
        issuer: diploma.universityAddress || 'University of Midnight',
        certificateHash: diploma.certificateHash || `cert_${Date.now()}_${idx}`,
        issuanceDate: diploma.issuanceDate || new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0],
        status: diploma.status || 'valid' as const,
      }));
      
      setCredentials(studentDiplomas);
      console.log('✓ Loaded credentials from ledger:', studentDiplomas);
    }
  }, [userAddress, ledgerDiplomas])

  const [selectedCredential, setSelectedCredential] = useState<StudentCredential | null>(
    null
  )
  const [showProofGenerator, setShowProofGenerator] = useState(false)
  const [proofError, setProofError] = useState<string | null>(null)
  const [proofSuccess, setProofSuccess] = useState<string | null>(null)
  const [generatedProof, setGeneratedProof] = useState<any>(null)
  const [proofLoading, setProofLoading] = useState(false)
  
  const [studentData] = useState({
    name: 'John Daniel Doe',
    email: 'john.doe@example.com',
    studentId: 'STU-2026-001',
    marks: {
      'Data Structures': 95,
      'Algorithms': 98,
      'Machine Learning': 96,
      'Databases': 92,
      'Computer Networks': 90,
    },
  })

  /**
   * Generate Zero-Knowledge Proof for selected credential
   */
  const handleGenerateProof = async () => {
    try {
      if (!selectedCredential) return
      
      setProofLoading(true)
      setProofError(null)
      setProofSuccess(null)
      setGeneratedProof(null)

      console.log('🔐 Generating ZK Proof for credential:', selectedCredential.id)
      
      const proof = await generateZKProof({
        name: studentData.name,
        id: studentData.studentId,
        grade: 'A+',
      })

      // Normalized proof payload that employers can verify directly.
      // Includes the on-ledger certificate hash plus a commitment and proof string.
      setGeneratedProof({
        credentialId: selectedCredential.id,
        degree: selectedCredential.degree,
        issuer: selectedCredential.issuer,
        certificateHash: selectedCredential.certificateHash,
        studentDataCommitment: Array.isArray(proof.publicInputs) ? proof.publicInputs[0] : '',
        proofData: proof.proof,
        timestamp: new Date().toISOString(),
        status: 'ready_to_share',
      })

      setProofSuccess('✅ Zero-Knowledge Proof generated successfully!')
      setShowProofGenerator(false)
      console.log('✅ ZK Proof generated:', proof)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate proof'
      setProofError(errorMessage)
      console.error('❌ Error generating proof:', error)
    } finally {
      setProofLoading(false)
    }
  }

  /**
   * Download the generated proof as JSON
   */
  const handleDownloadProof = () => {
    if (!generatedProof) return
    
    const dataStr = JSON.stringify(generatedProof, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `zk-proof-${generatedProof.credentialId}-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  /**
   * Copy proof to clipboard for sharing
   */
  const handleShareProof = () => {
    if (!generatedProof) return
    
    const proofData = JSON.stringify(generatedProof)
    navigator.clipboard.writeText(proofData).then(() => {
      setProofSuccess('✅ Proof copied to clipboard! Ready to share with employer.')
      setTimeout(() => setProofSuccess(null), 3000)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Error Messages */}
        {(proofError || sdkError) && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
            <div>
              <p className="text-red-200 font-semibold">Error</p>
              <p className="text-red-300 text-sm">{proofError || sdkError}</p>
            </div>
          </div>
        )}

        {/* Success Messages */}
        {proofSuccess && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg">
            <p className="text-green-200">{proofSuccess}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Your Credentials
          </h1>
          <p className="text-gray-300">
            Manage your educational credentials with complete privacy
          </p>
        </div>

        {/* Privacy Info Banner */}
        <div className="card p-6 mb-8 border-l-4 border-cyan-400">
          <div className="flex items-start gap-4">
            <Lock size={24} className="text-cyan-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">
                🔐 Your Privacy is Protected
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Your credentials on this dashboard are your local copy. When you generate
                a Zero-Knowledge Proof, employers can verify your diploma without ever
                seeing your actual name, grades, or personal information.
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                <li>✓ Names never shared with employers</li>
                <li>✓ Grades always remain private</li>
                <li>✓ Proof verified on-chain</li>
                <li>✓ Zero personal data exposure</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Credentials List */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-2xl font-bold text-white mb-6">
                📚 My Credentials
              </h3>

              {credentials.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-2">No credentials found</p>
                  <p className="text-sm text-gray-500">
                    Your issued credentials will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {credentials.map((cred) => (
                    <StudentCredentialCard
                      key={cred.id}
                      credential={cred}
                      isSelected={selectedCredential?.id === cred.id}
                      onSelect={() => setSelectedCredential(cred)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Generated Proof Display */}
            {generatedProof && (
              <div className="mt-8 card p-6 border-l-4 border-green-400">
                <h3 className="text-xl font-bold text-white mb-4">
                  Zero-Knowledge Proof Generated
                </h3>
                <div className="bg-gray-800 rounded p-4 mb-4 text-sm text-gray-300">
                  <p className="mb-2"><strong>Credential:</strong> {generatedProof.degree}</p>
                  <p className="mb-2"><strong>Issuer:</strong> {generatedProof.issuer}</p>
                  <p className="mb-2"><strong>Generated:</strong> {new Date(generatedProof.timestamp).toLocaleString()}</p>
                  <p className="text-green-400"><strong>Status:</strong> Ready to Share</p>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  🔐 This proof proves you have a valid diploma without revealing your name, grades, or personal data.
                </p>
                <div className="flex gap-3">
                  <button onClick={handleShareProof} className="btn-primary flex-1 text-sm">
                    Copy to Share
                  </button>
                  <button onClick={handleDownloadProof} className="btn-secondary flex-1 text-sm">
                    Download JSON
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {selectedCredential && (
                <>
                  {/* Credential Details */}
                  <div className="card p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">
                      Selected Credential
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-gray-500">Degree:</p>
                        <p className="text-white font-medium">
                          {selectedCredential.degree}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Issuer:</p>
                        <p className="text-white break-all text-xs md:text-sm font-mono">
                          {selectedCredential.issuer}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Issued:</p>
                        <p className="text-white">
                          {selectedCredential.issuanceDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status:</p>
                        <p
                          className={
                            selectedCredential.status === 'valid'
                              ? 'text-green-400'
                              : 'text-red-400'
                          }
                        >
                          {selectedCredential.status.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <button
                    onClick={handleGenerateProof}
                    disabled={proofLoading || sdkLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {proofLoading ? (
                      <>
                        <Loader size={20} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap size={20} />
                        Generate ZK Proof
                      </>
                    )}
                  </button>

                  {generatedProof && (
                    <>
                      <button 
                        onClick={handleShareProof}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <Share2 size={20} />
                        Copy Proof to Share
                      </button>

                      <button 
                        onClick={handleDownloadProof}
                        className="btn-secondary w-full flex items-center justify-center gap-2"
                      >
                        <Download size={20} />
                        Download Proof
                      </button>
                    </>
                  )}
                </>
              )}

              {!selectedCredential && credentials.length > 0 && (
                <div className="card p-6 text-center">
                  <p className="text-gray-400">
                    👆 Select a credential to generate a proof
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ZK Proof Generator */}
        {showProofGenerator && selectedCredential && (
          <ZKProofGenerator
            credential={selectedCredential}
            studentData={studentData}
            onClose={() => setShowProofGenerator(false)}
          />
        )}

        {/* How It Works */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '1',
              title: 'Generate Proof',
              description:
                'Select a credential and generate a zero-knowledge proof using your private data',
            },
            {
              step: '2',
              title: 'Share Proof',
              description:
                'Send the proof to an employer without revealing your name or grades',
            },
            {
              step: '3',
              title: 'Verification',
              description:
                'Employer verifies the proof on the blockchain. Diploma is valid!',
            },
          ].map((item, idx) => (
            <div key={idx} className="card p-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 flex items-center justify-center font-bold text-white mb-4">
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
