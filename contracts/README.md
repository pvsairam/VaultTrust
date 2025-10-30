# Proof of Reserves Smart Contract

## Overview
This contract enables privacy-preserving proof of reserves using Zama's FHEVM (Fully Homomorphic Encryption Virtual Machine).

## Features
- **Encrypted Balance Submission**: Users can submit encrypted balance proofs without revealing actual amounts
- **Auditor Verification**: Authorized auditors can verify reserves and perform homomorphic computations
- **Role-Based Access**: Owner can authorize/revoke auditor permissions
- **Homomorphic Operations**: Supports encrypted comparison and summation of reserves

## Contract Functions

### User Functions
- `submitEncryptedReserve(bytes encryptedBalance, bytes inputProof)`: Submit an encrypted balance proof
- `getUserReserveCount(address user)`: Get number of reserves submitted by a user
- `getReserveInfo(address user, uint256 reserveId)`: Get metadata about a specific reserve

### Auditor Functions
- `verifyReserve(address user, uint256 reserveId)`: Mark a reserve as verified
- `compareReserves(...)`: Compare two encrypted reserves (returns encrypted boolean)
- `computeTotalReserve(address user)`: Compute sum of all reserves for a user (encrypted)

### Owner Functions
- `authorizeAuditor(address auditor, bool status)`: Grant/revoke auditor permissions

## Deployment Instructions

### Prerequisites
1. Install Hardhat or Foundry
2. Install FHEVM dependencies:
   ```bash
   npm install fhevm
   ```

### Using Hardhat
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

### Using Foundry
```bash
forge build
forge create --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY \
  contracts/ProofOfReserves.sol:ProofOfReserves
```

## Environment Variables
After deployment, add the contract address to your `.env`:
```
VITE_PROOF_OF_RESERVES_ADDRESS=0x...
```

## Contract Address (Sepolia Testnet)
**Note**: This contract needs to be deployed. Update this section with the actual deployed address.

Current deployment: `TBD - Deploy using instructions above`

## Security Considerations
- Only authorized auditors can perform verification and computations
- Encrypted balances are only accessible to the user who submitted them and auditors
- All homomorphic operations preserve privacy while enabling verification

## Testing
Create test files to verify:
1. Encrypted balance submission
2. Auditor authorization/revocation
3. Reserve verification
4. Homomorphic computations (comparison, summation)
