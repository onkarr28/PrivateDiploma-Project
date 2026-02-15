import { useState } from 'react'
import { Trash2, Eye, Copy, CheckCircle, Clock, XCircle } from 'lucide-react'

interface Diploma {
  id: string
  studentName: string
  studentId: string
  certificateHash: string
  degreeType: string
  issuanceDate: string
  status: 'valid' | 'revoked' | 'pending'
  studentDataCommitment: string
}

interface DiplomaListProps {
  diplomas: Diploma[]
  onRevoke: (id: string) => void
  userRole: 'university' | 'student' | 'employer'
}

export default function DiplomaList({
  diplomas,
  onRevoke,
  userRole,
}: DiplomaListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(id)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-green-400'
      case 'revoked':
        return 'text-red-400'
      case 'pending':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle size={18} />
      case 'revoked':
        return <XCircle size={18} />
      case 'pending':
        return <Clock size={18} />
      default:
        return null
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">
          📋 Issued Diplomas
        </h3>
        <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm text-white">
          {diplomas.length} diplomas
        </span>
      </div>

      {diplomas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-2">No diplomas yet</p>
          <p className="text-sm text-gray-500">
            Start issuing diplomas to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {diplomas.map((diploma) => (
            <div
              key={diploma.id}
              className="bg-white bg-opacity-5 border border-white border-opacity-20 rounded-lg p-4 hover:bg-opacity-10 transition"
            >
              {/* Main Info */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-white">
                      {diploma.studentId}
                    </h4>
                    <span className={`flex items-center gap-1 ${getStatusColor(diploma.status)}`}>
                      {getStatusIcon(diploma.status)}
                      <span className="text-xs capitalize">{diploma.status}</span>
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-1">
                    {diploma.degreeType}
                  </p>
                  <p className="text-xs text-gray-500">
                    Issued: {diploma.issuanceDate}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setExpandedId(
                        expandedId === diploma.id ? null : diploma.id
                      )
                    }
                    className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition"
                    title="View details"
                  >
                    <Eye size={18} className="text-cyan-400" />
                  </button>
                  {userRole === 'university' && diploma.status === 'valid' && (
                    <button
                      onClick={() => onRevoke(diploma.id)}
                      className="p-2 hover:bg-red-500 hover:bg-opacity-20 rounded-lg transition"
                      title="Revoke diploma"
                    >
                      <Trash2 size={18} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === diploma.id && (
                <div className="mt-4 pt-4 border-t border-white border-opacity-20 space-y-3 animate-fade-in">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Certificate Hash:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-black bg-opacity-50 px-3 py-2 rounded text-xs text-cyan-400 break-all">
                        {diploma.certificateHash}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(diploma.certificateHash, diploma.id)
                        }
                        className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition"
                      >
                        <Copy
                          size={16}
                          className={
                            copiedHash === diploma.id
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Student Data Commitment:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-black bg-opacity-50 px-3 py-2 rounded text-xs text-purple-400 break-all">
                        {diploma.studentDataCommitment}
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            diploma.studentDataCommitment,
                            diploma.id + '-commitment'
                          )
                        }
                        className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition"
                      >
                        <Copy
                          size={16}
                          className={
                            copiedHash === diploma.id + '-commitment'
                              ? 'text-green-400'
                              : 'text-gray-400'
                          }
                        />
                      </button>
                    </div>
                  </div>

                  {userRole === 'university' && (
                    <div className="info-message text-xs">
                      ⚠️ Only the issuer can revoke this diploma. Once revoked, it cannot be
                      verified.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
