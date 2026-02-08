import { useState } from 'react'
import { Briefcase, BookOpen, ShieldCheck, Zap, Lock, GitBranch } from 'lucide-react'
import WalletConnector from '../components/WalletConnector'

interface LandingProps {
  onRoleChange: (role: any) => void
  onConnect: (address: string) => void
}

export default function Landing({ onRoleChange, onConnect }: LandingProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const handleConnect = (address: string) => {
    onConnect(address)
    if (selectedRole) {
      onRoleChange(selectedRole)
    }
  }

  const roles = [
    {
      id: 'university',
      icon: BookOpen,
      title: '🎓 University',
      description: 'Issue digital diplomas with privacy preservation',
      features: [
        'Issue diplomas to students',
        'Manage credentials',
        'Revoke diplomas if needed',
        'Track issued certificates',
      ],
      gradient: 'from-blue-500 to-cyan-500',
      glowColor: 'shadow-blue-500/50',
    },
    {
      id: 'student',
      icon: Zap,
      title: '👨‍🎓 Student',
      description: 'Manage your credentials and generate proofs',
      features: [
        'View your diplomas',
        'Generate ZK proofs',
        'Share with employers',
        'Privacy guaranteed',
      ],
      gradient: 'from-purple-500 to-pink-500',
      glowColor: 'shadow-purple-500/50',
    },
    {
      id: 'employer',
      icon: Briefcase,
      title: '🏢 Employer',
      description: 'Verify candidate credentials privately',
      features: [
        'Verify diploma proofs',
        'Check validity',
        'No personal data access',
        'Instant verification',
      ],
      gradient: 'from-orange-500 to-red-500',
      glowColor: 'shadow-orange-500/50',
    },
  ]

  return (
    <div className="min-h-screen bg-black py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-2xl shadow-xl">
              <ShieldCheck size={40} className="text-gray-300" />
            </div>
            <h1 className="text-6xl lg:text-7xl font-black text-white">
              PrivateDiploma
            </h1>
            <div className="p-3 bg-gray-800 border border-gray-600 rounded-2xl shadow-xl">
              <Lock size={40} className="text-gray-300" />
            </div>
          </div>
          <p className="text-2xl text-gray-200 mb-4 font-semibold">
            Privacy-Preserving Educational Credentials
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto text-lg">
            Secure digital diploma system with zero-knowledge proofs and complete privacy protection
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-2xl mx-auto">
            <div className="card p-4">
              <div className="text-3xl font-bold text-white">100%</div>
              <p className="text-sm text-slate-400">Private</p>
            </div>
            <div className="card p-4">
              <div className="text-3xl font-bold text-white">ZK</div>
              <p className="text-sm text-slate-400">Verified</p>
            </div>
            <div className="card p-4">
              <div className="text-3xl font-bold text-white">On-Chain</div>
              <p className="text-sm text-slate-400">Immutable</p>
            </div>
          </div>
        </div>

        {/* Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => (
            <div
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`group relative card-hover cursor-pointer overflow-hidden transition-all duration-500 ${
                selectedRole === role.id
                  ? 'card-premium ring-2 ring-gray-500 scale-105 shadow-2xl'
                  : 'card hover:shadow-2xl'
              }`}
            >
              {/* Gray Overlay */}
              <div className="absolute inset-0 bg-gray-800 opacity-0 group-hover:opacity-5 transition-all duration-500" />

              <div className="relative z-10 p-8">
                {/* Icon */}
                <div className="inline-flex p-4 rounded-2xl bg-gray-800 border border-gray-600 shadow-lg mb-6 transform group-hover:scale-110 transition-all duration-300">
                  <role.icon size={28} className="text-gray-300" />
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold text-white mb-3">
                  {role.title}
                </h3>
                <p className="text-slate-400 text-sm mb-6">{role.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-6">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-slate-300 flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gray-500" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Select Button */}
                <button
                  className={`w-full py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                    selectedRole === role.id
                      ? 'bg-gray-700 text-white shadow-lg border border-gray-600'
                      : 'bg-slate-800 bg-opacity-50 text-slate-300 hover:bg-opacity-70 border border-slate-700'
                  }`}
                >
                  {selectedRole === role.id ? '✓ Selected' : 'Select Role'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Wallet Connection Modal */}
        {selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="max-w-md w-full">
              <WalletConnector
                selectedRole={selectedRole}
                onConnect={handleConnect}
                onCancel={() => setSelectedRole(null)}
              />
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 mb-16">
          <div className="card-premium p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-800 border border-gray-600 rounded-xl shadow-lg">
                <Lock size={24} className="text-gray-300" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">
                  True Privacy
                </h4>
                <p className="text-slate-400 text-sm">
                  Student names, grades, and personal data remain completely private. Only cryptographic hashes are stored on-chain.
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-800 border border-gray-600 rounded-xl shadow-lg">
                <ShieldCheck size={24} className="text-gray-300" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">
                  ZK Proofs
                </h4>
                <p className="text-slate-400 text-sm">
                  Prove diploma validity without revealing sensitive information. Cryptographically secure and battle-tested.
                </p>
              </div>
            </div>
          </div>

          <div className="card-premium p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-800 border border-gray-600 rounded-xl shadow-lg">
                <GitBranch size={24} className="text-gray-300" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">
                  Revocation
                </h4>
                <p className="text-slate-400 text-sm">
                  Universities can revoke diplomas when needed. Prevents fraud while maintaining privacy-preserving verification.
                </p>
              </div>
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
