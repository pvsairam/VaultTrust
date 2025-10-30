#!/bin/bash
# VaultTrust Git History Cleanup Script
# This script removes Replit-specific files and creates a clean commit history

echo "🧹 Starting VaultTrust repository cleanup..."
echo ""

# Remove existing git history
echo "📦 Removing old git history..."
rm -rf .git

# Initialize fresh repository
echo "🆕 Initializing fresh git repository..."
git init

# Add all files (respecting .gitignore which excludes replit.md)
echo "➕ Adding files to git (replit.md excluded via .gitignore)..."
git add .

# Create initial commit
echo "💾 Creating clean initial commit..."
git commit -m "Initial commit: VaultTrust - Privacy-Preserving Proof of Reserves dApp

Features:
- Privacy-preserving balance verification using Zama FHEVM
- Encrypted reserves/liabilities submission
- Role-based access control for auditors
- Homomorphic computations on encrypted data
- Exchange registration with wallet signature verification
- Glassmorphism UI with real-time data visualization
- PostgreSQL database with Drizzle ORM
- Express + Vite full-stack architecture
- Configured for Vercel deployment"

# Add GitHub remote
echo "🔗 Adding GitHub remote..."
git remote add origin https://github.com/pvsairam/VaultTrust.git

# Set main branch
echo "🌿 Setting up main branch..."
git branch -M main

# Force push to GitHub (overwrites existing history)
echo "🚀 Force pushing to GitHub..."
git push -f origin main

echo ""
echo "✅ Repository cleanup complete!"
echo ""
echo "📋 Summary:"
echo "   ✓ Old commit history removed"
echo "   ✓ replit.md excluded from git"
echo "   ✓ Clean initial commit created"
echo "   ✓ Pushed to https://github.com/pvsairam/VaultTrust.git"
echo ""
echo "🎯 Next steps:"
echo "   1. Deploy smart contract using Remix IDE (see REMIX_DEPLOYMENT.md)"
echo "   2. Import project to Vercel"
echo "   3. Configure environment variables"
echo "   4. Deploy!"
echo ""
