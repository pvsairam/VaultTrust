import hre from "hardhat";
const { ethers } = hre;

async function main() {
  console.log("🚀 Starting VaultTrust ProofOfReserves deployment to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("📋 Deployment Details:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");
  console.log("Network: Sepolia Testnet");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (balance === 0n) {
    throw new Error(
      "❌ Insufficient balance! Get Sepolia ETH from:\n" +
      "   - https://sepoliafaucet.com\n" +
      "   - https://www.alchemy.com/faucets/ethereum-sepolia"
    );
  }

  console.log("🔨 Compiling contracts...");
  
  const ProofOfReserves = await ethers.getContractFactory("ProofOfReserves");
  
  console.log("📤 Deploying ProofOfReserves contract...");
  const contract = await ProofOfReserves.deploy();
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("\n✅ Deployment Successful!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📍 Contract Address:", contractAddress);
  console.log("👤 Contract Owner:", deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("📝 Contract Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("• Privacy-preserving Proof of Reserves using Zama FHEVM");
  console.log("• Encrypted balance storage with euint64 type");
  console.log("• Role-based access control (Owner + Auditors)");
  console.log("• Homomorphic operations for encrypted computations");
  console.log("• Decryption gateway for authorized auditors");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🔍 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Update your .env file:");
  console.log(`   PROOF_OF_RESERVES_ADDRESS=${contractAddress}`);
  console.log("\n2. Update Vercel environment variables:");
  console.log(`   PROOF_OF_RESERVES_ADDRESS=${contractAddress}`);
  console.log("\n3. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
  console.log("\n4. View on Sepolia Etherscan:");
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("🎉 VaultTrust is ready for privacy-preserving proof of reserves!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
