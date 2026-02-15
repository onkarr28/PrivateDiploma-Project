import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import UniversityDashboard from './pages/UniversityDashboard'
import StudentDashboard from './pages/StudentDashboard'
import EmployerVerification from './pages/EmployerVerification'
import Navigation from './components/Navigation'
import { MidnightProvider, useMidnightSDK } from './utils/MidnightProvider'
import { MidnightConfig } from './utils/midnightSDKIntegration'

type UserRole = 'landing' | 'university' | 'student' | 'employer'

// Midnight Network Configuration
const midnightConfig: MidnightConfig = {
  rpcUrl: import.meta.env.VITE_MIDNIGHT_RPC_URL || 'https://midnight-testnet.example.com',
  contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || '',
  networkId: 'midnight-testnet',
}

function AppContent() {
  const [currentRole, setCurrentRole] = useState<UserRole>('landing')
  const [userInfo, setUserInfo] = useState({
    address: '',
    isConnected: false,
  })
  
  const { initializeSDK, connected } = useMidnightSDK()

  // Auto-initialize SDK when wallet connects
  useEffect(() => {
    if (userInfo.isConnected && userInfo.address && !connected) {
      console.log('🔗 Wallet connected, initializing SDK...')
      initializeSDK({
        rpcUrl: 'http://localhost:9944',
        contractAddress: import.meta.env.VITE_CONTRACT_ADDRESS || 'contract_81aac1479224e8896ff26cf220354553e382701d',
        networkId: 'midnight-local'
      }, userInfo.address).catch(err => {
        console.warn('SDK initialization failed (will use Local Ledger Provider):', err)
      })
    }
  }, [userInfo.isConnected, userInfo.address, connected, initializeSDK])

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role)
  }

  const handleConnect = (address: string) => {
    setUserInfo({
      address,
      isConnected: true,
    })
  }

  const handleDisconnect = () => {
    setUserInfo({
      address: '',
      isConnected: false,
    })
    setCurrentRole('landing')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900">
      {currentRole !== 'landing' && (
        <Navigation 
          currentRole={currentRole} 
          onRoleChange={handleRoleChange}
          userAddress={userInfo.address}
          onDisconnect={handleDisconnect}
        />
      )}
      
      {currentRole === 'landing' && (
        <Landing onRoleChange={handleRoleChange} onConnect={handleConnect} />
      )}
      
      {currentRole === 'university' && userInfo.isConnected && (
        <UniversityDashboard userAddress={userInfo.address} />
      )}
      
      {currentRole === 'student' && userInfo.isConnected && (
        <StudentDashboard userAddress={userInfo.address} />
      )}
      
      {currentRole === 'employer' && userInfo.isConnected && (
        <EmployerVerification userAddress={userInfo.address} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <MidnightProvider config={midnightConfig}>
      <AppContent />
    </MidnightProvider>
  )
}
