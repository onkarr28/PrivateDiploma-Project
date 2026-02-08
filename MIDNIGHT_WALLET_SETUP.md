# 🚀 Midnight Network Real Wallet Integration

## Setting Up Real Midnight Wallet

This guide explains how to connect your PrivateDiploma app to the **real Midnight Network wallet**.

---

## 📋 Prerequisites

### 1. **Install Midnight Wallet Extension**

You need to install the official Midnight wallet extension:

- **Chrome/Chromium**: [Midnight Extension (Coming Soon)](https://midnight.network)
- **Firefox**: [Midnight Extension (Coming Soon)](https://midnight.network)

### 2. **Create a Midnight Wallet Account**

1. Click the Midnight extension icon
2. Select "Create New Wallet"
3. Create a strong password
4. Save your seed phrase (keep it safe!)
5. Confirm seed phrase

### 3. **Get Testnet Tokens**

To test the app, you need testnet tokens:

1. Go to [Midnight Testnet Faucet](https://midnight.network/faucet)
2. Enter your wallet address
3. Request testnet tokens (₳)
4. Wait for confirmation (~5 minutes)

---

## 🔧 Configuration

### Auto-Detection

The wallet is **automatically detected** when you run the app:

```bash
npm run dev
```

The app will:
- ✅ Check if Midnight wallet extension is installed
- ✅ Auto-connect if you've previously connected
- ✅ Provide option to connect on first load

### Manual Connection

In the app:

1. Open PrivateDiploma at `http://localhost:3000`
2. Select your role (University, Student, or Employer)
3. Choose **"Real Midnight Wallet"** option
4. Click **"Connect Real Wallet"**
5. Approve the connection in your wallet extension
6. Done! ✓

---

## 💻 Development Features

### Real Wallet Functions

The app supports full functionality:

```typescript
// Connect wallet
await midnightWalletManager.connectWallet()

// Send transactions
await midnightWalletManager.sendTransaction(to, amount)

// Sign messages
await midnightWalletManager.signMessage(message)

// Get account info
const account = midnightWalletManager.getAccount()

// Listen to changes
midnightWalletManager.onAccountChange((account) => {
  console.log('Account changed:', account)
})
```

### Demo Wallet Fallback

If Midnight wallet is not installed, you can use the **Demo Wallet** option:

- No wallet extension needed
- Full testing capability
- Perfect for development
- Shows mock data for testing

---

## 🔄 Transaction Flow

### 1. **Diploma Issuance** (University)

```
University connects wallet
    ↓
Issues diploma with ZK commitment
    ↓
Transaction sent to Midnight Network
    ↓
Diploma hash stored on-chain
    ↓
Student can verify ownership
```

### 2. **Proof Generation** (Student)

```
Student connects wallet
    ↓
Selects diploma to prove
    ↓
Generates local ZK proof
    ↓
Proof never exposed on-chain
    ↓
Student shares proof with employer
```

### 3. **Verification** (Employer)

```
Employer receives proof from student
    ↓
Uploads proof to app
    ↓
App verifies against on-chain hash
    ↓
Result: ✓ Valid or ✗ Invalid
    ↓
Student information remains private
```

---

## 🔐 Security & Privacy

### What's On-Chain
- ✓ Diploma hash
- ✓ Issuance timestamp
- ✓ University address
- ✓ Revocation status

### What's NOT On-Chain
- ✗ Student name
- ✗ Student grades
- ✗ Student ID
- ✗ Student personal data

**Privacy Guarantee**: Personal data stays local, only zero-knowledge proofs verify ownership.

---

## 🧪 Testing the Real Wallet

### Test Scenarios

#### 1. Issue a Diploma
```
1. Connect as University
2. Fill in diploma details
3. Click "Issue Diploma"
4. Approve transaction in wallet
5. Wait for confirmation
6. ✓ Diploma stored on-chain
```

#### 2. Generate Proof
```
1. Connect as Student
2. View your diploma
3. Click "Generate Proof"
4. Proof generated locally
5. Download or copy proof file
6. ✓ Proof ready to share
```

#### 3. Verify Credential
```
1. Connect as Employer
2. Upload proof file
3. Click "Verify"
4. App checks against on-chain hash
5. Result shown
6. ✓ Privacy maintained
```

---

## 📊 Debugging

### Check Wallet Connection

```javascript
// In browser console
import { midnightWalletManager } from './src/utils/midnightWallet'

// Check if wallet is available
midnightWalletManager.constructor.isWalletAvailable()

// Get current account
midnightWalletManager.getAccount()

// Get network
midnightWalletManager.getNetwork()
```

### View Transactions

The app logs all transactions. Check:
1. Browser console (F12)
2. Application tab → Local Storage → `midnightWalletConnected`
3. Midnight wallet extension history

---

## 🚨 Common Issues

### Issue: "Midnight wallet not found"

**Solution:**
- Install Midnight wallet extension
- Or use "Demo Wallet" for testing
- Restart browser after installation

### Issue: "No addresses found"

**Solution:**
- Open Midnight wallet extension
- Create a new account
- Lock and unlock the wallet
- Try connecting again

### Issue: "Transaction failed"

**Solution:**
- Check you have testnet tokens (₳)
- Request more from [Testnet Faucet](https://midnight.network/faucet)
- Check transaction fee
- Try again after a few seconds

### Issue: "Extension not responding"

**Solution:**
- Close and reopen wallet extension
- Restart browser
- Reinstall wallet extension
- Check browser console for errors

---

## 📚 Documentation Links

- **Midnight Network Docs**: https://midnight.network/docs
- **Wallet Extension Guide**: https://midnight.network/docs/wallet
- **Testnet Faucet**: https://midnight.network/faucet
- **Community Support**: https://midnight.network/discord

---

## 🎓 Educational Value

This integration demonstrates:

- ✅ Real blockchain wallet integration
- ✅ Transaction signing & verification
- ✅ On-chain storage with privacy
- ✅ Zero-Knowledge Proof application
- ✅ Real-world dApp development
- ✅ Secure credential management

---

## 🎯 Next Steps

1. **Install Midnight Wallet** - Get the extension
2. **Create Account** - Set up your wallet
3. **Get Testnet Tokens** - Request from faucet
4. **Connect App** - Open http://localhost:3000
5. **Test Workflows** - Try all roles

**Happy testing!** 🚀

---

## 📞 Support

For issues:
1. Check the debugging section above
2. Review browser console errors
3. Check Midnight wallet extension status
4. Visit [Midnight.network](https://midnight.network)

---

**Status**: ✅ Real Midnight Wallet Integration Enabled
