# Production Deployment Guide - Private Diploma on Midnight Network

## 🚀 Deployment Steps

### Phase 1: Smart Contract Deployment

#### 1.1 Prepare Contract
```bash
# Navigate to contracts directory
cd contracts/

# Compile PrivateDiploma contract
midnight-cli compile PrivateDiploma.compact

# Test contract locally
midnight-cli test PrivateDiploma
```

#### 1.2 Deploy to Testnet
```bash
# Get testnet tokens from faucet
midnight-cli faucet request your-address

# Deploy contract
midnight-cli deploy PrivateDiploma \
  --network testnet \
  --wallet lace \
  --gas-limit 500000

# Save the deployed contract address (you'll need it!)
# Example: CONTRACT_ADDRESS=mn_contract_abc123...
```

#### 1.3 Verify Deployment
```bash
# Check contract is deployed
midnight-cli contract info mn_contract_abc123...

# Test contract call
midnight-cli contract call mn_contract_abc123... issueDiploma \
  --student-id STU-001 \
  --commitment 0x...
```

---

### Phase 2: Application Configuration

#### 2.1 Set Environment Variables
```bash
# Copy example configuration
cp .env.example .env.local

# Edit .env.local with your values
VITE_CONTRACT_ADDRESS=mn_contract_abc123def456...
VITE_RPC_URL=https://testnet-rpc.midnight.network
VITE_NETWORK_ID=0
VITE_ENABLE_BLOCKCHAIN=true
```

#### 2.2 Install Dependencies
```bash
npm install

# Ensure Midnight SDK packages are available
npm list @midnight-network/sdk
```

#### 2.3 Build Application
```bash
npm run build

# Test production build locally
npm run preview
```

---

### Phase 3: Testing

#### 3.1 Local Testing
```bash
# Start dev server with production config
npm run dev

# Test wallet connection with real wallet
# Visit http://localhost:3002

# Test diploma issuance (real transaction)
# - Connect Lace wallet
# - Issue diploma
# - Check transaction in block explorer
```

#### 3.2 Blockchain Verification
```bash
# Query diploma on blockchain
midnight-cli contract call mn_contract_abc123... \
  getDiploma \
  --certificate-hash 0x...

# Check transaction receipt
midnight-cli transaction info tx_hash_here
```

---

### Phase 4: Deployment to Production

#### 4.1 Production Mainnet (if available)
```bash
# Update environment for mainnet
VITE_NETWORK_ID=1
VITE_RPC_URL=https://mainnet-rpc.midnight.network
VITE_ENABLE_BLOCKCHAIN=true

# Re-deploy contract to mainnet
midnight-cli deploy PrivateDiploma \
  --network mainnet \
  --wallet lace \
  --gas-limit 500000

# Update VITE_CONTRACT_ADDRESS with mainnet address
```

#### 4.2 Hosting
```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting:
# - Vercel: vercel deploy
# - Netlify: netlify deploy
# - AWS: aws s3 sync dist/ s3://your-bucket/
# - Docker: docker build -t midnight-diploma . && docker run ...
```

---

## 📋 Configuration Checklist

### Required for Production:

- [ ] Contract deployed to testnet/mainnet
- [ ] Contract address in `.env.local` (VITE_CONTRACT_ADDRESS)
- [ ] RPC endpoint configured (VITE_RPC_URL)
- [ ] Network ID set correctly (VITE_NETWORK_ID)
- [ ] VITE_ENABLE_BLOCKCHAIN=true
- [ ] Wallet extension installed (Lace)
- [ ] Testnet/mainnet tokens available
- [ ] SSL certificate for HTTPS (for production)
- [ ] Verified blockchain connection

### Optional for Production:

- [ ] Custom verification API (VITE_VERIFICATION_API)
- [ ] Gas price multiplier configured
- [ ] Transaction logging enabled
- [ ] Error monitoring (Sentry/similar)
- [ ] Analytics integration

---

## 🔍 Verification Commands

### Check Wallet Connection
```bash
# In browser console:
window.cardano.lace.getAddress().then(addr => console.log('Connected:', addr))
```

### Check Contract Status
```bash
midnight-cli contract info mn_contract_abc123...
```

### Query Issued Diplomas
```bash
midnight-cli contract call mn_contract_abc123... \
  getDiplomasByIssuer \
  --issuer-address your_address_here
```

### Check Transaction
```bash
midnight-cli transaction info your_tx_hash_here
```

---

## 🚨 Troubleshooting

### "Contract address not configured"
- Set VITE_CONTRACT_ADDRESS in .env.local
- Use correct address format (mn_contract_...)

### Transaction fails with "insufficient balance"
- Request more testnet tokens from faucet
- Or switch to demo mode (VITE_ENABLE_BLOCKCHAIN=false)

### Wallet not detected
- Install Lace wallet extension
- Enable extension
- Refresh page

### RPC connection timeout
- Check VITE_RPC_URL is correct
- Verify network connectivity
- Try different RPC endpoint

---

## 📊 Monitoring

### Real-time Transaction Tracking
```bash
# Watch for new transactions on contract
midnight-cli contract watch mn_contract_abc123... issueDiploma
```

### Block Explorer
- Testnet: https://testnet-explorer.midnight.network
- Mainnet: https://explorer.midnight.network

---

## 🔒 Security Notes

1. **Private Keys**: Never commit .env.local with real credentials
2. **RPC Endpoints**: Consider using private RPC for production
3. **Rate Limiting**: Implement on your verification API
4. **Input Validation**: All diploma data is validated on-chain
5. **ZK Proofs**: Only commitment is stored, witness is private

---

## 📞 Support

- Midnight Network Docs: https://docs.midnight.network
- Midnight Network Discord: https://discord.gg/midnight-network
- Issue Tracker: https://github.com/midnight-network/...

---

**Last Updated**: February 2026
**Status**: Production Ready ✅
