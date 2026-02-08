/**
 * PrivateDiploma - Installation Verification Script
 * Run: npm run verify
 * 
 * This script checks that all dependencies are installed
 * and the project is ready to run.
 */

import fs from 'fs'
import path from 'path'

console.log('\n' + '='.repeat(60))
console.log('  PrivateDiploma - Installation Verification')
console.log('='.repeat(60) + '\n')

const checks = [
  {
    name: 'Node.js',
    check: () => !!process.version,
    value: () => process.version,
  },
  {
    name: 'npm',
    check: () => {
      try {
        require.resolve('npm')
        return true
      } catch {
        return false
      }
    },
  },
  {
    name: 'package.json',
    check: () => fs.existsSync('package.json'),
  },
  {
    name: 'node_modules',
    check: () => fs.existsSync('node_modules'),
  },
  {
    name: 'React',
    check: () => fs.existsSync('node_modules/react'),
  },
  {
    name: 'TypeScript',
    check: () => fs.existsSync('node_modules/typescript'),
  },
  {
    name: 'Vite',
    check: () => fs.existsSync('node_modules/vite'),
  },
  {
    name: 'Tailwind CSS',
    check: () => fs.existsSync('node_modules/tailwindcss'),
  },
  {
    name: 'Lucide React',
    check: () => fs.existsSync('node_modules/lucide-react'),
  },
]

const files = [
  'src/App.tsx',
  'src/main.tsx',
  'src/index.ts',
  'src/pages/Landing.tsx',
  'src/pages/UniversityDashboard.tsx',
  'src/pages/StudentDashboard.tsx',
  'src/pages/EmployerVerification.tsx',
  'src/components/Navigation.tsx',
  'src/components/WalletConnector.tsx',
  'src/components/DiplomaIssuanceForm.tsx',
  'src/components/DiplomaList.tsx',
  'src/components/StudentCredentialCard.tsx',
  'src/components/ZKProofGenerator.tsx',
  'src/styles/globals.css',
  'src/utils/mockBlockchain.ts',
  'contracts/PrivateDiploma.compact',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'index.html',
]

console.log('📦 Checking Dependencies...\n')

let allChecksPassed = true

checks.forEach((check) => {
  const passed = check.check()
  const status = passed ? '✓' : '✗'
  const value = check.value ? ` (${check.value()})` : ''
  console.log(`  ${status} ${check.name}${value}`)
  if (!passed) allChecksPassed = false
})

console.log('\n📁 Checking Source Files...\n')

let allFilesPassed = true

files.forEach((file) => {
  const exists = fs.existsSync(file)
  const status = exists ? '✓' : '✗'
  console.log(`  ${status} ${file}`)
  if (!exists) allFilesPassed = false
})

console.log('\n' + '='.repeat(60))

if (allChecksPassed && allFilesPassed) {
  console.log('✅ All checks passed! Ready to run.\n')
  console.log('Next step:')
  console.log('  npm run dev\n')
  process.exit(0)
} else {
  console.log('❌ Some checks failed. Please run:\n')
  console.log('  npm install\n')
  process.exit(1)
}
