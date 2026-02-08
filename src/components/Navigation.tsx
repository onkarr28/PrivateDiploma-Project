import { Menu, LogOut, Shield, Zap } from 'lucide-react'
import { useState } from 'react'

interface NavigationProps {
  currentRole: 'university' | 'student' | 'employer'
  onRoleChange: (role: any) => void
  userAddress: string
  onDisconnect: () => void
}

export default function Navigation({
  currentRole,
  onRoleChange,
  userAddress,
  onDisconnect,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'university':
        return 'University Portal'
      case 'student':
        return 'Student Portal'
      case 'employer':
        return '🏢 Employer Verification'
      default:
        return 'PrivateDiploma'
    }
  }

  const getRoleColor = () => {
    switch (currentRole) {
      case 'university':
        return 'from-blue-500 to-cyan-500'
      case 'student':
        return 'from-purple-500 to-pink-500'
      case 'employer':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-cyan-500 to-blue-500'
    }
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-900 bg-opacity-70 border-b border-slate-700 border-opacity-50 shadow-2xl shadow-cyan-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-all duration-300"
            onClick={() => onRoleChange('landing')}
          >
            <div className={`p-2.5 bg-gradient-to-br ${getRoleColor()} rounded-xl shadow-lg group-hover:shadow-2xl transition-all duration-300`}>
              <Shield className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text font-bold text-lg">
                PrivateDiploma
              </span>
              <span className="text-xs text-slate-400 font-medium">Midnight Network</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Role Badge */}
            <div className={`px-4 py-2 bg-gradient-to-r ${getRoleColor()} bg-opacity-10 rounded-xl border border-opacity-50 border-current backdrop-blur-md`}>
              <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
                {getRoleLabel()}
              </span>
            </div>

            {/* Address */}
            <div className="px-4 py-2 bg-slate-800 bg-opacity-60 rounded-xl border border-slate-700 border-opacity-50 backdrop-blur-md hover:border-opacity-100 transition-all duration-300">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300 text-sm font-mono">
                  {formatAddress(userAddress)}
                </span>
              </div>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={onDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 bg-opacity-20 hover:bg-opacity-40 border border-red-500 border-opacity-50 hover:border-opacity-100 text-red-300 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
            >
              <LogOut size={16} />
              <span className="hidden lg:inline">Disconnect</span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 hover:bg-slate-800 hover:bg-opacity-50 rounded-lg transition-all duration-300 text-cyan-300"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Items */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-700 border-opacity-50 mt-2 space-y-3 animate-fade-in">
            <div className={`px-4 py-3 bg-gradient-to-r ${getRoleColor()} bg-opacity-10 rounded-xl border border-opacity-50 border-current`}>
              <span className="text-sm font-semibold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
                {getRoleLabel()}
              </span>
            </div>

            <div className="px-4 py-3 bg-slate-800 bg-opacity-60 rounded-xl border border-slate-700 border-opacity-50">
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-300 text-sm font-mono">
                  {formatAddress(userAddress)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onDisconnect()
                setIsOpen(false)
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 bg-red-600 bg-opacity-20 hover:bg-opacity-40 border border-red-500 border-opacity-50 text-red-300 rounded-xl font-semibold transition-all duration-300"
            >
              <LogOut size={16} />
              Disconnect
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
