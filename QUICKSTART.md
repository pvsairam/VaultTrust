# 🚀 VaultTrust - Complete Deployment Quick Start

## 📋 What You Need (5 minutes)

1. **MetaMask** installed in browser
2. **Sepolia ETH** (~0.01 ETH) - Get free from: https://sepoliafaucet.com
3. **GitHub Account** (for repository)
4. **Vercel Account** (for deployment)

---

## 🎯 Complete Workflow (3 Steps)

### **Step 1: Clean Up Git & Push to GitHub** (2 minutes)

```bash
# Run the cleanup script
bash cleanup-git.sh

# Verify replit.md is excluded
git status
# Should show: "nothing to commit, working tree clean"
```

**✅ Done!** Your repository is clean and pushed to GitHub.

---

### **Step 2: Deploy Smart Contract via Remix** (3-5 minutes)

1. **Open Remix:** https://remix.ethereum.org

2. **Create New File:** `ProofOfReserves.sol`

3. **Copy contract code from:** `contracts/ProofOfReserves-remix.sol`
   - Open the file in this project
   - Copy ALL the code (it's fully commented and ready to deploy)

4. **Configure Compiler:**
   - Version: `0.8.24`
   - EVM Version: `cancun`
   - Optimization: ✅ Enabled (200 runs)

5. **Connect MetaMask:**
   - Environment: `Injected Provider - MetaMask`
   - Network: Switch to **Sepolia Testnet**

6. **Deploy:**
   - Click orange "Deploy" button
   - Confirm in MetaMask
   - Wait 30 seconds
   - **Copy contract address** when deployed

**✅ Done!** Your smart contract is live on Sepolia.

📖 **Detailed Guide:** See `REMIX_DEPLOYMENT.md` for step-by-step with troubleshooting

---

### **Step 3: Deploy to Vercel** (3 minutes)

1. **Import Project:**
   - Go to: https://vercel.com/new
   - Import: `https://github.com/pvsairam/VaultTrust.git`

2. **Configure Settings:**
   - Framework: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Add Environment Variables:**

```bash
# Database (use your existing Neon/Vercel Postgres)
DATABASE_URL=your_database_url

# Session
SESSION_SECRET=your_random_secret

# Smart Contract (from Step 2)
PROOF_OF_RESERVES_ADDRESS=0xYourContractAddress

# Blockchain
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# FHEVM
VITE_FHEVM_GATEWAY_URL=https://gateway.sepolia.zama.ai/
VITE_KMS_CONTRACT_ADDRESS=0x05fD1D4AE5847832512808d2F666b76F79Bb1C6F
VITE_ACL_CONTRACT_ADDRESS=0x2Fb6f44eB1cbA1372d5Fa506F1171e554Bd5aC1F
```

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes

**✅ Done!** Your VaultTrust app is live!

---

## 🎉 Success Checklist

After all three steps:

- ✅ Repository cleaned and pushed to GitHub
- ✅ Smart contract deployed to Sepolia
- ✅ Contract address saved
- ✅ App deployed to Vercel
- ✅ Environment variables configured
- ✅ App is accessible via Vercel URL

---

## 🔍 Quick Links

| Resource | URL |
|----------|-----|
| GitHub Repo | https://github.com/pvsairam/VaultTrust.git |
| Remix IDE | https://remix.ethereum.org |
| Sepolia Faucet | https://sepoliafaucet.com |
| Sepolia Explorer | https://sepolia.etherscan.io |
| Vercel Dashboard | https://vercel.com/dashboard |

---

## 📚 Documentation

- **Detailed Remix Guide:** `REMIX_DEPLOYMENT.md` (step-by-step with screenshots)
- **Contract Explanation:** `DEPLOYMENT_GUIDE.md` (architecture deep dive)
- **Git Cleanup Script:** `cleanup-git.sh` (automated cleanup)

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Insufficient funds" | Get Sepolia ETH from faucet |
| "Wrong network" | Switch MetaMask to Sepolia |
| "FHEVM imports not found" | Use GitHub imports (see REMIX_DEPLOYMENT.md) |
| "Build fails on Vercel" | Check environment variables are set |
| "App not loading" | Verify DATABASE_URL is correct |

---

## 🎯 What's Next?

After successful deployment:

1. **Test exchange registration** on your live app
2. **Submit encrypted reserves** using the Submit page
3. **View dashboard** showing all submissions
4. **Add more auditors** if needed (as contract owner)
5. **Monitor on Etherscan** at https://sepolia.etherscan.io/address/YOUR_CONTRACT

---

## 💡 Pro Tips

- **Verify Contract:** Makes your code public on Etherscan (builds trust)
- **Save Transaction Hashes:** Keep records of deployment
- **Backup Private Keys:** Never lose your deployer wallet
- **Test Before Production:** Always test on testnet first
- **Monitor Gas Prices:** Deploy during low network activity

---

**Ready? Start with Step 1: Run `bash cleanup-git.sh`** 🚀

Questions? Check the detailed guides in:
- `REMIX_DEPLOYMENT.md` - Complete Remix deployment walkthrough
- `DEPLOYMENT_GUIDE.md` - Contract architecture explanation
