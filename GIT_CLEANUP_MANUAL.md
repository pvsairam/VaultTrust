# 🧹 Manual Git Cleanup Guide

Replit prevents automated git operations for safety. Here's how to clean your repository manually:

---

## Option 1: Clean on GitHub Directly (Easiest)

### **Step 1: Download Clean Repository**
1. Go to: https://github.com/pvsairam/VaultTrust
2. Click **Code** → **Download ZIP**
3. Extract to a new folder

### **Step 2: Remove Replit Files**
Delete these files/folders from the extracted folder:
```
replit.md
.replit
replit.nix
```

### **Step 3: Create New Repository**
```bash
cd VaultTrust-folder
git init
git add .
git commit -m "Initial commit - VaultTrust production ready"
```

### **Step 4: Update GitHub**
```bash
git remote add origin https://github.com/pvsairam/VaultTrust.git
git branch -M main
git push -f origin main
```

---

## Option 2: Clean Locally on Your Computer

### **Step 1: Clone Repository**
```bash
git clone https://github.com/pvsairam/VaultTrust.git
cd VaultTrust
```

### **Step 2: Run Cleanup**
```bash
# Make script executable
chmod +x cleanup-git.sh

# Run cleanup
./cleanup-git.sh
```

This will:
- Remove old git history
- Exclude replit.md and Replit files
- Create clean commit
- Push to GitHub

---

## Option 3: Manual Cleanup Commands

If the script doesn't work, run these commands manually:

```bash
cd VaultTrust

# Remove Replit files
rm -f replit.md .replit replit.nix

# Remove old git history
rm -rf .git

# Initialize new repository
git init
git add .
git commit -m "VaultTrust - Production Ready

- Smart contract deployed to Sepolia: 0x367328B4B7A5C56D762C2Ed465889aBe24a6a9A8
- Privacy-preserving proof of reserves using Zama FHEVM
- Exchange registration with email verification
- Encrypted balance submission and verification
- Full-stack TypeScript with React + Express
- PostgreSQL database with Drizzle ORM
- Ready for Vercel deployment
"

# Connect to GitHub
git remote add origin https://github.com/pvsairam/VaultTrust.git
git branch -M main

# Force push clean history
git push -f origin main
```

---

## ✅ Verify Cleanup

After cleanup, check:

```bash
# List files
git ls-files

# Should NOT include:
# - replit.md
# - .replit
# - replit.nix

# Should include everything else
```

---

## 🚀 Next: Deploy to Vercel

Once git is clean:

1. Go to: https://vercel.com/new
2. Import: `pvsairam/VaultTrust`
3. Add environment variables (see VERCEL_DEPLOYMENT.md)
4. Deploy!

---

## 📝 .gitignore Configuration

Your `.gitignore` already excludes Replit files:

```gitignore
# Replit
replit.md
.replit
replit.nix
```

This ensures future commits won't include them.

---

**Choose the option that works best for you, then proceed to Vercel deployment!** 🚀
