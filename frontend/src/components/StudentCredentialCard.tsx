import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface Credential {
  id: string
  degree: string
  issuer: string
  certificateHash: string
  issuanceDate: string
  expiryDate: string
  status: 'valid' | 'revoked'
}

interface StudentCredentialCardProps {
  credential: Credential
  isSelected: boolean
  onSelect: () => void
}

export default function StudentCredentialCard({
  credential,
  isSelected,
  onSelect,
}: StudentCredentialCardProps) {
  const getStatusIcon = () => {
    switch (credential.status) {
      case 'valid':
        return <CheckCircle size={20} className="text-green-400" />
      case 'revoked':
        return <XCircle size={20} className="text-red-400" />
      default:
        return <Clock size={20} className="text-yellow-400" />
    }
  }

  const isExpired = new Date(credential.expiryDate) < new Date()

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected
          ? 'bg-white bg-opacity-20 border-cyan-400'
          : 'bg-white bg-opacity-5 border-white border-opacity-20 hover:bg-opacity-10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white mb-1 truncate">
            {credential.degree}
          </h4>
          <p className="text-sm text-gray-400 mb-2">{credential.issuer}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              {credential.issuanceDate.split('-').reverse().join('/')}
            </span>
            {isExpired && (
              <span className="text-red-400">
                (Expired {credential.expiryDate.split('-').reverse().join('/')})
              </span>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {getStatusIcon()}
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-white border-opacity-20">
          <p className="text-xs text-cyan-300">✓ Selected</p>
        </div>
      )}
    </button>
  )
}
