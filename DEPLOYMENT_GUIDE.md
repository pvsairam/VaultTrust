# 🚀 VaultTrust Smart Contract Deployment Guide

## 📖 Contract Overview

### **ProofOfReserves.sol** - Privacy-Preserving Balance Verification

VaultTrust's smart contract leverages **Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine)** to enable exchanges to prove their solvency without revealing sensitive financial data.

---

## 🔐 How It Works

### **1. Encrypted Data Storage**
```solidity
struct Reserve {
    euint64 encryptedBalance;  // FHE-encrypted 64-bit integer
    string tokenSymbol;        // Token identifier (BTC, ETH, USDC)
    string dataType;           // "reserves" or "liabilities"
    uint256 timestamp;         // Submission time
    bool verified;             // Auditor verification status
    address auditor;           // Verifying auditor address
}
```

**Key Innovation:** The `euint64` type is an **encrypted integer** that remains encrypted on-chain. Mathematical operations can be performed directly on encrypted values without ever decrypting them.

---

### **2. Privacy-Preserving Submission Flow**

```solidity
function submitEncryptedReserve(
    bytes calldata encryptedBalance,
    bytes calldata inputProof,
    string calldata tokenSymbol,
    string calldata dataType
) external returns (uint256)
```

**What Happens:**
1. **Frontend Encryption:** User encrypts their balance using `fhevmjs` library
2. **On-Chain Validation:** Smart contract verifies the encryption proof
3. **Access Control:** Grants decryption permissions to:
   - The contract itself
   - The submitting user
   - All authorized auditors
4. **Storage:** Encrypted balance is stored on-chain (visible but unreadable)
5. **Event Emission:** Emits `ReserveSubmitted` event for off-chain tracking

**Privacy Guarantee:** Even blockchain validators cannot see the actual balance values!

---

### **3. Homomorphic Computations**

The contract performs **computations on encrypted data** without decryption:

#### **A. Reserve Comparison** (Who has more reserves?)
```solidity
function requestCompareReserves(
    address user1, uint256 reserveId1,
    address user2, uint256 reserveId2
) external onlyAuditor returns (uint256)
```

**Homomorphic Operation:**
```solidity
euint64 balance1 = userReserves[user1][reserveId1].encryptedBalance;
euint64 balance2 = userReserves[user2][reserveId2].encryptedBalance;
ebool result = TFHE.ge(balance1, balance2);  // Greater-than-or-equal comparison
```

- Compares two encrypted balances **without decrypting them**
- Returns encrypted boolean result
- Only authorized auditor can request decryption via Zama Gateway

#### **B. Total Reserves Calculation** (Sum all reserves)
```solidity
function requestTotalReserve(address user) external onlyAuditor returns (uint256)
```

**Homomorphic Addition:**
```solidity
euint64 total = userReserves[user][0].encryptedBalance;
for (uint256 i = 1; i < userReserves[user].length; i++) {
    total = TFHE.add(total, userReserves[user][i].encryptedBalance);
}
```

- Sums all encrypted reserves for a user
- Result remains encrypted until auditor requests decryption
- Decryption happens off-chain via Zama Gateway

---

### **4. Role-Based Access Control**

```solidity
address public owner;                        // Contract deployer
mapping(address => bool) public authorizedAuditors;  // Approved auditors
```

**Three Roles:**
1. **Owner** (deployer)
   - Add/remove auditors
   - Automatically becomes first auditor
   
2. **Auditors** (authorized addresses)
   - Verify reserves
   - Request decryption of totals/comparisons
   - Access encrypted data
   
3. **Exchanges** (any address)
   - Submit encrypted reserves/liabilities
   - View their own submission history

---

### **5. Decryption Gateway Integration**

Zama's architecture uses a **two-step decryption process**:

```solidity
// Step 1: Request decryption from gateway
uint256 requestId = Gateway.requestDecryption(
    ciphertexts,           // Encrypted values to decrypt
    callbackSelector,      // Function to call with result
    msgValue,              // ETH to send (usually 0)
    maxTimestamp,          // Deadline
    asyncDecrypt           // Use async mode
);

// Step 2: Gateway calls back with decrypted result
function compareReservesCallback(uint256 requestId, bool decryptedResult) 
    public onlyGateway returns (bool)
```

**Why This Design?**
- **Trustless Decryption:** Only Zama Gateway can decrypt using threshold cryptography
- **Selective Disclosure:** Only authorized parties receive decrypted results
- **Audit Trail:** All decryption requests are logged on-chain

---

## 🛠️ Deployment Steps

### **Prerequisites**

1. **Get Sepolia ETH** (for gas fees):
   - https://sepoliafaucet.com
   - https://www.alchemy.com/faucets/ethereum-sepolia
   - Needs: ~0.01 ETH for deployment

2. **Get Sepolia RPC URL**:
   - **Free Option:** `https://ethereum-sepolia-rpc.publicnode.com`
   - **Infura:** https://infura.io (free tier available)
   - **Alchemy:** https://alchemy.com (free tier available)

3. **Export Private Key** (from MetaMask):
   - Open MetaMask → Account Details → Export Private Key
   - ⚠️ **NEVER commit this to git!**

---

### **Step 1: Set Environment Variables**

Create a `.env.local` file in your project root:

```bash
# Deployment Configuration
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
DEPLOYER_PRIVATE_KEY=your_private_key_without_0x_prefix

# Optional: For contract verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Load environment variables:**
```bash
# In terminal
export $(cat .env.local | xargs)
```

---

### **Step 2: Deploy Contract**

```bash
# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.ts --network sepolia
```

**Expected Output:**
```
🚀 Starting VaultTrust ProofOfReserves deployment to Sepolia...

📋 Deployment Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Deploying with account: 0xYourAddress...
Account balance: 0.05 ETH
Network: Sepolia Testnet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Deployment Successful!
📍 Contract Address: 0xa439BbabCb49EA18072262ce8bd79a1455361d48
```

---

### **Step 3: Verify Contract on Etherscan (Optional)**

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

This makes your contract source code public on Etherscan for transparency.

---

### **Step 4: Update Application Configuration**

**Local Development (.env):**
```bash
PROOF_OF_RESERVES_ADDRESS=0xYourDeployedContractAddress
```

**Vercel (Production):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   ```
   PROOF_OF_RESERVES_ADDRESS=0xYourDeployedContractAddress
   ```
3. Redeploy: `vercel --prod`

---

## 🧪 Testing the Contract

### **1. View on Sepolia Etherscan**
```
https://sepolia.etherscan.io/address/<YOUR_CONTRACT_ADDRESS>
```

### **2. Check Owner and Initial State**
```bash
npx hardhat console --network sepolia
```
```javascript
const contract = await ethers.getContractAt("ProofOfReserves", "0xYourAddress");
await contract.owner();           // Should be your deployer address
await contract.totalSubmissions(); // Should be 0
await contract.isAuditor("0xYourAddress"); // Should be true
```

### **3. Submit Test Reserve (from frontend)**
Your deployed app will handle this automatically when exchanges submit balances.

---

## 🔍 Contract Architecture Deep Dive

### **FHEVM Primitives Used**

| Type | Purpose | Example |
|------|---------|---------|
| `euint64` | Encrypted 64-bit unsigned integer | Balance amounts |
| `ebool` | Encrypted boolean | Comparison results |
| `TFHE.asEuint64()` | Convert encrypted input to euint64 | User-submitted balances |
| `TFHE.allow()` | Grant decryption permission | Allow auditor to decrypt |
| `TFHE.add()` | Homomorphic addition | Sum reserves |
| `TFHE.ge()` | Greater-or-equal comparison | Compare reserves |

---

### **Gas Costs (Approximate)**

| Operation | Gas Cost (Sepolia) |
|-----------|-------------------|
| Contract Deployment | ~2,500,000 gas |
| Submit Reserve | ~500,000 gas |
| Verify Reserve | ~50,000 gas |
| Request Total | ~300,000 gas |
| Authorize Auditor | ~60,000 gas |

---

## 🛡️ Security Considerations

### **✅ What's Secure**
- **Encrypted Storage:** Balances never visible on-chain
- **Access Control:** Only authorized auditors can request decryption
- **Homomorphic Operations:** Computations preserve privacy
- **Immutable Submissions:** Reserves can't be modified after submission

### **⚠️ Important Notes**
- **Gateway Trust:** Decryption relies on Zama's threshold cryptography
- **Auditor Authorization:** Owner must carefully manage auditor list
- **Testnet Limitations:** Sepolia for testing only; mainnet TBD
- **Gas Costs:** FHE operations are expensive (normal for current tech)

---

## 📚 Additional Resources

- **Zama Docs:** https://docs.zama.ai/fhevm
- **FHEVM GitHub:** https://github.com/zama-ai/fhevm
- **Sepolia Etherscan:** https://sepolia.etherscan.io
- **Hardhat Docs:** https://hardhat.org/docs

---

## 🎯 Quick Reference

### **Deploy Command**
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### **Verify Command**
```bash
npx hardhat verify --network sepolia <ADDRESS>
```

### **Test RPC Connection**
```bash
npx hardhat accounts --network sepolia
```

---

**🎉 Your VaultTrust smart contract is now live on Sepolia testnet, enabling privacy-preserving proof of reserves for cryptocurrency exchanges!**
