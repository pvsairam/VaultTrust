# 🎯 Deploy VaultTrust Smart Contract Using Remix IDE

## Why Remix IDE?

**Remix IDE** is a browser-based Solidity development environment that:
- ✅ Requires **zero installation** or setup
- ✅ Works with **any Node.js version** (it's browser-based!)
- ✅ Supports **FHEVM/Zama contracts** perfectly
- ✅ Connects directly to **MetaMask** for deployment
- ✅ Provides **instant verification** on Etherscan

---

## 📋 Prerequisites

Before starting, ensure you have:

1. **MetaMask Extension** installed in your browser
2. **Sepolia ETH** in your wallet (~0.01 ETH for gas)
   - Get free Sepolia ETH: https://sepoliafaucet.com
3. **Network Added to MetaMask:**
   - Network Name: Sepolia Testnet
   - RPC URL: `https://ethereum-sepolia-rpc.publicnode.com`
   - Chain ID: `11155111`
   - Currency Symbol: `ETH`
   - Block Explorer: `https://sepolia.etherscan.io`

---

## 🚀 Step-by-Step Deployment Guide

### **Step 1: Open Remix IDE**

Go to: **https://remix.ethereum.org**

You'll see the Remix interface with:
- File Explorer (left sidebar)
- Code Editor (center)
- Compiler and Deploy tabs (right sidebar)

---

### **Step 2: Create New File**

1. In the **File Explorer**, click the 📄 icon to create a new file
2. Name it: `ProofOfReserves.sol`
3. Paste the complete contract code (provided below)

---

### **Step 3: Install FHEVM Plugin**

Since your contract uses Zama's FHEVM library, you need to configure Remix:

1. Click **Settings** (⚙️ icon at bottom of left sidebar)
2. Under **"Solidity Compiler"**, set:
   - **Compiler Version:** `0.8.24+commit...` (any 0.8.24 version)
   - **EVM Version:** `cancun`
   - **Enable Optimization:** ✅ (check this box)
   - **Runs:** `200`

3. Click **"Advanced Configurations"** and add:
   ```
   Optimizer: Enabled
   Runs: 200
   ```

---

### **Step 4: Add FHEVM Dependencies**

Remix needs to know where to find the FHEVM imports. Your contract imports:
```solidity
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";
```

**Two options:**

#### **Option A: Use GitHub Import (Recommended)**

Replace the import statements in your contract with:

```solidity
import "https://github.com/zama-ai/fhevm/blob/main/lib/TFHE.sol";
import "https://github.com/zama-ai/fhevm/blob/main/gateway/GatewayCaller.sol";
```

#### **Option B: Flatten Contract Locally**

If you have the contracts locally, flatten them:

```bash
npx hardhat flatten contracts/ProofOfReserves.sol > ProofOfReserves-flattened.sol
```

Then paste the flattened version into Remix.

---

### **Step 5: Compile Contract**

1. Click the **"Solidity Compiler"** tab (left sidebar, icon looks like a document)
2. Make sure your settings match:
   - Compiler: `0.8.24`
   - EVM Version: `cancun`
   - Optimization: Enabled with 200 runs
3. Click **"Compile ProofOfReserves.sol"** button
4. Wait for compilation (green checkmark appears when done)

**If you see errors:**
- Check that FHEVM imports are accessible
- Verify compiler version is exactly `0.8.24`
- Check that all syntax is correct

---

### **Step 6: Connect MetaMask**

1. Click **"Deploy & Run Transactions"** tab (left sidebar, Ethereum icon)
2. Under **"Environment"**, select: `Injected Provider - MetaMask`
3. MetaMask popup appears → Click **"Connect"**
4. MetaMask should show:
   - Network: **Sepolia Testnet**
   - Your account address
   - Your balance

**⚠️ Important:** Make sure MetaMask is on **Sepolia**, not Mainnet!

---

### **Step 7: Deploy Contract**

1. In the **"Deploy & Run Transactions"** tab:
   - **Contract:** Should show `ProofOfReserves` (auto-selected)
   - **Gas Limit:** Leave as default
   - **Value:** `0` (no ETH needed in constructor)

2. Click the orange **"Deploy"** button

3. MetaMask popup appears showing gas fee:
   - Review the transaction
   - Gas fee should be ~0.003-0.01 ETH
   - Click **"Confirm"**

4. Wait 15-30 seconds for deployment

5. When deployed, you'll see:
   - Green checkmark in console
   - Contract address in **"Deployed Contracts"** section
   - Transaction hash in console

---

### **Step 8: Copy Contract Address**

1. In **"Deployed Contracts"** section, you'll see your contract
2. Click the 📋 icon next to the address to copy it
3. **Save this address!** You'll need it for:
   - Your `.env` file
   - Vercel environment variables
   - Frontend configuration

**Example address:**
```
0xa439BbabCb49EA18072262ce8bd79a1455361d48
```

---

### **Step 9: Verify Contract on Etherscan (Optional but Recommended)**

1. Go to **Sepolia Etherscan:** https://sepolia.etherscan.io
2. Paste your contract address in search bar
3. Click **"Contract"** tab
4. Click **"Verify and Publish"**
5. Fill in details:
   - **Compiler Type:** Solidity (Single file)
   - **Compiler Version:** `v0.8.24+commit...` (match exactly what you used)
   - **License:** MIT
6. Click **"Continue"**
7. Paste your contract code (from Remix)
8. Under **"Constructor Arguments"**: Leave empty (no constructor args)
9. Click **"Verify and Publish"**

**Benefits of verification:**
- Makes your contract source code public
- Users can read the code on Etherscan
- Builds trust and transparency

---

## 🔍 Testing Your Deployed Contract

### **Quick Test in Remix**

After deployment, Remix shows your contract with all functions. Try these:

1. **Check Owner** (view function):
   - Click `owner` button
   - Should return your wallet address

2. **Check Total Submissions**:
   - Click `totalSubmissions`
   - Should return `0` (no submissions yet)

3. **Check If You're Auditor**:
   - Click `isAuditor`
   - Enter your wallet address
   - Click "call"
   - Should return `true` (you're auto-approved as first auditor)

---

## 📝 Update Your Application Configuration

### **1. Update Local .env**

```bash
PROOF_OF_RESERVES_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
```

### **2. Update Vercel Environment Variables**

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   ```
   Key: PROOF_OF_RESERVES_ADDRESS
   Value: 0xYOUR_DEPLOYED_CONTRACT_ADDRESS
   ```
3. Click **"Save"**
4. Redeploy your app: `vercel --prod`

### **3. Test Frontend Integration**

Your frontend should now be able to:
- Submit encrypted reserves
- View submission history
- Verify reserves (if you're an auditor)

---

## 🎉 Success Checklist

After deployment, verify:

- ✅ Contract deployed to Sepolia
- ✅ Contract address saved
- ✅ Contract verified on Etherscan (optional)
- ✅ You're listed as owner and auditor
- ✅ `.env` updated with contract address
- ✅ Vercel env vars updated
- ✅ Frontend can connect to contract

---

## 🐛 Troubleshooting

### **Problem: "FHEVM imports not found"**

**Solution:** Use GitHub imports or flatten contract:
```solidity
import "https://github.com/zama-ai/fhevm/blob/main/lib/TFHE.sol";
```

### **Problem: "Insufficient funds for gas"**

**Solution:** Get more Sepolia ETH from faucet:
- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia

### **Problem: "Wrong network"**

**Solution:** In MetaMask, switch to Sepolia Testnet (top network dropdown)

### **Problem: "Transaction failed"**

**Solution:**
1. Check gas limit isn't too low
2. Ensure you have enough Sepolia ETH
3. Try increasing gas price in MetaMask

### **Problem: "Compilation errors"**

**Solution:**
1. Verify compiler version is exactly `0.8.24`
2. Check EVM version is `cancun`
3. Ensure optimization is enabled
4. Verify FHEVM imports are accessible

---

## 📚 Additional Resources

- **Remix Documentation:** https://remix-ide.readthedocs.io
- **Zama FHEVM Docs:** https://docs.zama.ai/fhevm
- **MetaMask Guide:** https://metamask.io/faqs
- **Sepolia Etherscan:** https://sepolia.etherscan.io
- **Sepolia Faucet:** https://sepoliafaucet.com

---

## 💡 Pro Tips

1. **Save Transaction Hash:** Keep the deployment transaction hash for your records
2. **Test Before Production:** Always test on Sepolia before deploying to mainnet
3. **Backup Private Keys:** Never lose your deployer wallet private key
4. **Document Address:** Add contract address to your project documentation
5. **Monitor Gas Prices:** Deploy during low network activity to save on gas

---

## 🎯 What Happens Next?

After successful deployment:

1. **Your Contract is Live** on Sepolia testnet
2. **Exchanges Can Submit** encrypted reserves/liabilities
3. **Auditors Can Verify** without seeing actual amounts
4. **You Control Access** as the contract owner
5. **All Data is Private** thanks to FHEVM encryption

---

**🎉 Congratulations! Your VaultTrust smart contract is now deployed and ready for privacy-preserving proof of reserves!**

Need help? Check the troubleshooting section or refer to the Zama FHEVM documentation.
