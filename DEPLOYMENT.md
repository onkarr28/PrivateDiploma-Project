# 🚀 Production Deployment Guide

## 📋 Overview

This guide helps you deploy PrivateDiploma to production and integrate with real Midnight Network.

---

## Phase 1: Pre-Production Setup

### 1. Environment Variables

Create `.env.production`:

```bash
# Midnight Network
VITE_MIDNIGHT_RPC_URL=https://midnight-mainnet-rpc.example.com
VITE_CONTRACT_ADDRESS=0x...your-contract-address
VITE_NETWORK_ID=midnight-mainnet

# Optional: Analytics
VITE_ANALYTICS_ID=your-analytics-id
VITE_LOG_LEVEL=warn
```

### 2. Update SDK Integration

In `src/index.ts`, replace mock calls with real Midnight SDK:

```typescript
// Remove: import { mockAPI } from './utils/mockBlockchain'
// Add: import { Midnight } from '@midnight-ntwrk/midnight-js-sdk'

// Replace mockTransaction with real SDK calls
class PrivateDiplomaClient {
  private midnight: Midnight
  
  async issueDiploma(...args) {
    // Use real Midnight SDK instead of mockAPI
    const tx = await this.midnight.submitTransaction({
      contractAddress: this.contractAddress,
      functionName: 'issueDiploma',
      arguments: args
    })
    return tx.hash
  }
}
```

### 3. Smart Contract Deployment

```bash
# Compile contract
npm run contract:compile

# Deploy to Midnight Network
npm run contract:deploy

# Copy contract address to .env.production
VITE_CONTRACT_ADDRESS=0x...deployed-address
```

---

## Phase 2: Build & Optimization

### 1. Production Build

```bash
# Build TypeScript and bundle
npm run build

# Output in: dist/
```

### 2. Optimize Images & Assets

```bash
# Minify CSS
npm install -D cssnano

# Minify JavaScript (automatic with Vite)

# Remove unused CSS (Tailwind does this)
```

### 3. Bundle Analysis

```bash
# Install
npm install -D vite-plugin-visualizer

# In vite.config.ts, add:
import { visualizer } from 'vite-plugin-visualizer'

plugins: [
  visualizer()
]

# Build and open dist/stats.html
npm run build
open dist/stats.html
```

---

## Phase 3: Hosting Deployment

### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Auto-deploy on git push
vercel link
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_MIDNIGHT_RPC_URL": "@midnight_rpc_url",
    "VITE_CONTRACT_ADDRESS": "@contract_address"
  }
}
```

### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir dist

# Setup continuous deployment
netlify link
git push
```

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[env]
  VITE_MIDNIGHT_RPC_URL = "https://midnight-rpc.example.com"
  VITE_CONTRACT_ADDRESS = "0x..."
```

### Option C: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket/ --delete

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Option D: Self-Hosted (Docker)

**Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy files
COPY package*.json ./
RUN npm ci

COPY . .

# Build
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3001;
    }
}
```

**Deploy:**
```bash
docker build -t privatediploma .
docker run -d -p 80:80 privatediploma
```

---

## Phase 4: Real Midnight Network Integration

### 1. Install Real SDK

```bash
npm uninstall @midnight-ntwrk/midnight-js-sdk-mock
npm install @midnight-ntwrk/midnight-js-sdk@latest
```

### 2. Update Wallet Connection

In `src/components/WalletConnector.tsx`:

```typescript
import { connectWallet } from '@midnight-ntwrk/midnight-js-sdk'

const handleConnect = async () => {
  try {
    const wallet = await connectWallet()
    const address = wallet.address
    onConnect(address)
  } catch (error) {
    setError('Failed to connect Midnight wallet')
  }
}
```

### 3. Update Contract Calls

In `src/index.ts`:

```typescript
async issueDiploma(...args): Promise<string> {
  const tx = await this.midnight.submitTransaction({
    contract: this.contractAddress,
    method: 'issueDiploma',
    args: args
  })
  
  // Wait for confirmation
  await this.midnight.waitForConfirmation(tx.hash)
  return tx.hash
}
```

### 4. Update Mock Blockchain Calls

Replace all `mockAPI` calls with real SDK calls:

```typescript
// src/pages/UniversityDashboard.tsx
// Remove: import { mockAPI }
// Use: const result = await client.issueDiploma(...)

// src/pages/EmployerVerification.tsx
// Remove: mockBlockchain.verifyDegree()
// Use: const result = await client.verifyDegree(...)
```

---

## Phase 5: Testing in Production

### 1. Testnet Testing

```bash
# Set environment
export VITE_NETWORK_ID=midnight-testnet
npm run build
npm run preview
```

### 2. End-to-End Testing

```bash
# Install test framework
npm install -D playwright @playwright/test

# Create tests/flows.spec.ts
# Test all three workflows
```

### 3. Performance Testing

```bash
# Install
npm install -D lighthouse

# Test
npx lighthouse https://your-domain.com --view
```

---

## Phase 6: Security

### 1. HTTPS Enforcement

- ✅ All hosting providers handle this
- ✅ Enable HSTS header
- ✅ Use CSP headers

### 2. Smart Contract Security

```bash
# Audit contract
# Consider professional audit for mainnet

# Test coverage
npm install -D midnight-test-framework
npm run test:contract
```

### 3. Frontend Security

```typescript
// Content Security Policy
meta: [
  {
    httpEquiv: 'Content-Security-Policy',
    content: "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'"
  }
]
```

### 4. Wallet Security

- ✅ Use secure connection (HTTPS)
- ✅ Never expose private keys
- ✅ Sign contracts with wallet
- ✅ Validate contract addresses

---

## Phase 7: Monitoring & Analytics

### 1. Error Tracking

```bash
npm install @sentry/react

// In src/App.tsx
import * as Sentry from "@sentry/react"

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV
})
```

### 2. Analytics

```bash
npm install @segment/analytics-next

// Track user flows
analytics.track('diploma_issued', { issuer, timestamp })
analytics.track('proof_generated', { student })
analytics.track('proof_verified', { verified })
```

### 3. Monitoring

- Use Vercel Analytics
- Monitor contract gas usage
- Track transaction success rates
- Monitor wallet connections

---

## Phase 8: Maintenance

### 1. Regular Updates

```bash
# Update dependencies monthly
npm update
npm audit fix

# Update Midnight SDK
npm update @midnight-ntwrk/midnight-js-sdk
```

### 2. Contract Upgrades

- Deploy new contract version
- Migrate data if needed
- Update environment variables

### 3. Performance Tuning

- Optimize bundle size
- Lazy load components
- Cache optimization
- CDN caching

---

## ✅ Production Checklist

- [ ] Environment variables set
- [ ] Smart contract deployed
- [ ] Real Midnight SDK integrated
- [ ] Wallet connection working
- [ ] All SDK calls updated
- [ ] Mock blockchain removed
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] All workflows tested
- [ ] Security headers configured
- [ ] HTTPS enabled
- [ ] Analytics integrated
- [ ] Error tracking enabled
- [ ] Database backup plan
- [ ] Disaster recovery plan
- [ ] Documentation updated

---

## 🚀 Quick Deployment Checklist

```bash
# 1. Set environment
export NODE_ENV=production

# 2. Build
npm run build

# 3. Test build
npm run preview

# 4. Deploy to Vercel
vercel --prod

# 5. Test live site
curl https://your-domain.com

# 6. Monitor
# Check analytics, error tracking, etc.
```

---

## 📊 Deployment Checklist by Provider

### Vercel
```bash
vercel link
vercel env add VITE_MIDNIGHT_RPC_URL
vercel env add VITE_CONTRACT_ADDRESS
vercel --prod
```

### Netlify
```bash
netlify link
netlify deploy -p
# Configure env in Netlify UI
netlify deploy -p --prod
```

### AWS
```bash
aws s3 mb s3://privatediploma
aws s3 sync dist/ s3://privatediploma/
aws cloudfront create-distribution \
  --origin-domain-name privatediploma.s3.amazonaws.com
```

### Docker
```bash
docker build -t privatediploma .
docker tag privatediploma:latest myregistry/privatediploma:latest
docker push myregistry/privatediploma:latest
# Deploy to Kubernetes
kubectl apply -f deployment.yaml
```

---

## 🔧 Troubleshooting

### Build Fails
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Contract Not Found
```bash
# Check environment variables
echo $VITE_CONTRACT_ADDRESS

# Verify contract deployed
midnight query contract $VITE_CONTRACT_ADDRESS
```

### Wallet Connection Fails
```bash
# Check network
echo $VITE_NETWORK_ID

# Verify RPC endpoint
curl $VITE_MIDNIGHT_RPC_URL/health
```

### Slow Performance
```bash
# Analyze bundle
npm run build
npx vite-plugin-visualizer

# Optimize
npm install -D vite-compression-plugin
```

---

## 📈 Post-Deployment

### Monitor
- Transaction success rate
- User onboarding flow
- Error rates
- Performance metrics

### Optimize
- Cache diplomas
- Batch verifications
- Optimize contract calls
- Reduce gas usage

### Scale
- Load test
- Consider sharding
- Batch processing
- Off-chain storage

---

## 🎉 Success Indicators

✅ All pages load quickly  
✅ Transactions succeed  
✅ No console errors  
✅ Analytics working  
✅ Error tracking active  
✅ Users can connect wallets  
✅ Diplomas issue correctly  
✅ Proofs verify on-chain  
✅ HTTPS works  
✅ Mobile responsive  

---

## 📞 Production Support

- Monitor uptime: UptimeRobot
- Track errors: Sentry
- Analyze traffic: Google Analytics
- Monitor blockchain: Midnight Explorer

---

**Ready to go live! 🚀**

Start with Vercel for easiest deployment, then migrate to self-hosted if needed.
