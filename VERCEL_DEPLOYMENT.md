# 🚀 VaultTrust - Complete Vercel Deployment Guide

## ✅ Smart Contract Deployed!

**Contract Address:** `0x367328B4B7A5C56D762C2Ed465889aBe24a6a9A8`

**Sepolia Etherscan:** https://sepolia.etherscan.io/address/0x367328B4B7A5C56D762C2Ed465889aBe24a6a9A8

---

## 📋 Step-by-Step Vercel Deployment

### **Step 1: Clean Git Repository** (1 minute)

Run the cleanup script to remove Replit files:

```bash
bash cleanup-git.sh
```

This will:
- Remove old git history
- Exclude replit.md and Replit-specific files
- Create clean commit
- Force push to GitHub

**Verify:**
```bash
git status
# Should show: "nothing to commit, working tree clean"
```

---

### **Step 2: Import to Vercel** (2 minutes)

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select: `pvsairam/VaultTrust`
4. Click **"Import"**

---

### **Step 3: Configure Build Settings** (1 minute)

Vercel should auto-detect these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `.` (leave as root) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

**Leave all as detected - don't change!**

---

### **Step 4: Add Environment Variables** (3 minutes)

Click **"Environment Variables"** and add these:

#### **Required Variables:**

```bash
# Database (use your existing Neon/Vercel Postgres)
DATABASE_URL=your_postgresql_connection_string

# PostgreSQL Connection Details
PGHOST=your_pg_host
PGPORT=5432
PGDATABASE=your_database_name
PGUSER=your_username
PGPASSWORD=your_password

# Session Secret (generate new one)
SESSION_SECRET=your_random_secret_min_32_chars

# Smart Contract (DEPLOYED!)
PROOF_OF_RESERVES_ADDRESS=0x367328B4B7A5C56D762C2Ed465889aBe24a6a9A8

# Blockchain RPC
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# FHEVM Configuration (Zama)
VITE_FHEVM_GATEWAY_URL=https://gateway.sepolia.zama.ai/
VITE_KMS_CONTRACT_ADDRESS=0x05fD1D4AE5847832512808d2F666b76F79Bb1C6F
VITE_ACL_CONTRACT_ADDRESS=0x2Fb6f44eB1cbA1372d5Fa506F1171e554Bd5aC1F
```

#### **How to Generate SESSION_SECRET:**

```bash
# On Mac/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

#### **Where to Get DATABASE_URL:**

**Option A: Use Existing Replit Database**
- Copy from Replit Secrets → `DATABASE_URL`

**Option B: Create New Vercel Postgres**
```bash
# In Vercel project:
1. Go to "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Database URL automatically added to env vars
```

**Option C: Use Neon (Free)**
1. Go to: https://neon.tech
2. Create free database
3. Copy connection string

---

### **Step 5: Deploy!** (2 minutes)

1. Click **"Deploy"** button
2. Wait 2-3 minutes
3. Vercel builds and deploys your app

**Expected:** ✅ Deployment successful!

---

### **Step 6: Run Database Migration** (1 minute)

After first deployment, push your schema to production database:

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Pull environment variables
vercel env pull .env.production

# Run migration
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2) npm run db:push
```

**Option B: Manually**
```bash
# Set DATABASE_URL from Vercel dashboard
export DATABASE_URL="your_vercel_postgres_url"

# Push schema
npm run db:push
```

---

### **Step 7: Test Deployment** (2 minutes)

1. Open your Vercel URL (e.g., `https://vault-trust.vercel.app`)
2. **Test these features:**
   - ✅ Home page loads
   - ✅ Dashboard shows "0 submissions"
   - ✅ Register page appears
   - ✅ Connect MetaMask works
   - ✅ Exchange registration works
   - ✅ Submit page allows reserve submission

---

## ✅ Deployment Checklist

After successful deployment:

- ✅ Git repository cleaned (no Replit files)
- ✅ Smart contract deployed to Sepolia
- ✅ Contract address configured in Vercel
- ✅ Database created and migrated
- ✅ Environment variables configured
- ✅ App deployed and accessible
- ✅ All features working

---

## 🔍 Verify Smart Contract Integration

### **Test Contract Connection:**

1. Open browser console (F12)
2. Navigate to Submit page
3. Look for logs showing contract address
4. Should see: `0x367328B4B7A5C56D762C2Ed465889aBe24a6a9A8`

### **Test Reserve Submission:**

1. Register as an exchange
2. Go to Submit page
3. Enter reserve data:
   - Token: `BTC`
   - Type: `Reserves`
   - Balance: `100`
4. Click Submit
5. MetaMask popup → Confirm transaction
6. Wait for confirmation
7. Check Dashboard → Should show 1 submission

---

## 🐛 Troubleshooting

### **Problem: Build Fails**

**Solution:**
- Check all environment variables are set
- Verify DATABASE_URL is correct
- Check build logs for specific error

### **Problem: App Loads but Features Don't Work**

**Solution:**
- Verify PROOF_OF_RESERVES_ADDRESS is set correctly
- Check browser console for errors
- Ensure MetaMask is on Sepolia network

### **Problem: Database Connection Error**

**Solution:**
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
- Run `npm run db:push` to create tables
- Check database exists in Vercel/Neon dashboard

### **Problem: Contract Calls Fail**

**Solution:**
- Verify contract address: `0x367328B4B7A5C56D762C2Ed465889aBe24a6a9A8`
- Check wallet is on Sepolia network
- Ensure you have Sepolia ETH

---

## 📊 Production Checklist

Before going live:

- [ ] Test exchange registration flow
- [ ] Test reserve submission with real MetaMask
- [ ] Verify encrypted data is stored
- [ ] Test auditor verification (if applicable)
- [ ] Check dashboard displays correctly
- [ ] Verify contract events are captured
- [ ] Test on mobile devices
- [ ] Check performance/loading times

---

## 🎯 Important Links

| Resource | URL |
|----------|-----|
| **Your Vercel App** | `https://your-app.vercel.app` |
| **GitHub Repo** | https://github.com/pvsairam/VaultTrust.git |
| **Smart Contract** | https://sepolia.etherscan.io/address/0x367328B4B7A5C56D762C2Ed465889aBe24a6a9A8 |
| **Vercel Dashboard** | https://vercel.com/dashboard |
| **Sepolia Faucet** | https://sepoliafaucet.com |

---

## 🎉 Success!

Your VaultTrust application is now:

✅ **Deployed** on Vercel with automatic CI/CD  
✅ **Connected** to deployed smart contract on Sepolia  
✅ **Database** configured and migrated  
✅ **FHEVM** enabled for privacy-preserving operations  
✅ **Production-ready** for testing on Sepolia testnet  

---

## 📝 Next Steps

1. **Test thoroughly** on Sepolia
2. **Gather feedback** from users
3. **Monitor performance** in Vercel dashboard
4. **Plan mainnet deployment** when ready
5. **Consider contract verification** on Etherscan for transparency

---

**Congratulations on deploying VaultTrust!** 🚀

Your privacy-preserving proof of reserves dApp is now live and ready for testing!
