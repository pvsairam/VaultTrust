import { initFhevm, createInstance } from 'fhevmjs';
import type { FhevmInstance } from 'fhevmjs';

let fhevmInstance: FhevmInstance | null = null;
let isInitialized = false;

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

export async function initFHEVM() {
  if (fhevmInstance && isInitialized) {
    return fhevmInstance;
  }

  try {
    console.log('[FHEVM] Initializing SDK...');
    
    // Step 1: Initialize FHEVM WASM
    await initFhevm();
    console.log('[FHEVM] SDK initialized ✓');
    
    if (!window.ethereum) {
      throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }
    
    // Step 2: Check we're on Sepolia network
    const currentChainId = await window.ethereum.request({ method: 'eth_chainId' }) as string;
    console.log('[FHEVM] Current chain ID:', currentChainId);
    
    if (currentChainId !== SEPOLIA_CHAIN_ID) {
      console.log('[FHEVM] Not on Sepolia, requesting network switch...');
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
        console.log('[FHEVM] Switched to Sepolia ✓');
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          throw new Error('Please add Sepolia network to MetaMask first');
        }
        throw new Error('Please switch to Sepolia network in MetaMask');
      }
    }
    
    // Step 3: Create instance with Sepolia configuration
    console.log('[FHEVM] Creating instance...');
    
    const config = {
      chainId: 11155111,
      networkUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
      gatewayUrl: 'https://gateway.sepolia.zama.ai',
      aclContractAddress: '0x687820221192C5B662b25367F70076A37bc79b6c',
      kmsContractAddress: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
      verifyingContractAddress: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F'
    };
    
    console.log('[FHEVM] Configuration:', {
      chainId: config.chainId,
      networkUrl: config.networkUrl,
      gatewayUrl: config.gatewayUrl,
      aclContract: config.aclContractAddress,
      kmsContract: config.kmsContractAddress,
      verifier: config.verifyingContractAddress
    });
    
    fhevmInstance = await createInstance(config);
    
    isInitialized = true;
    console.log('[FHEVM] Instance created successfully ✓');
    return fhevmInstance;
  } catch (error) {
    console.error('[FHEVM] ❌ Initialization failed:', error);
    throw new Error(`FHEVM initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getFHEVMInstance() {
  if (!fhevmInstance || !isInitialized) {
    return await initFHEVM();
  }
  return fhevmInstance;
}

export async function encryptBalance(
  balanceAmount: bigint,
  contractAddress: string,
  userAddress: string
): Promise<{ handles: Uint8Array[]; inputProof: Uint8Array }> {
  const ZERO = BigInt(0);
  const MAX_UINT64 = BigInt('18446744073709551615');
  
  if (balanceAmount < ZERO) {
    throw new Error('Balance cannot be negative');
  }
  
  if (balanceAmount > MAX_UINT64) {
    throw new Error('Balance exceeds 64-bit maximum');
  }
  
  console.log('[FHEVM] Encrypting balance:', balanceAmount.toString());
  console.log('[FHEVM] Contract:', contractAddress);
  console.log('[FHEVM] User:', userAddress);
  
  const instance = await getFHEVMInstance();
  
  // Create encrypted input - MUST use the exact connected wallet address
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  
  // Add the value to encrypt
  input.add64(balanceAmount);
  
  // Encrypt and generate proof
  console.log('[FHEVM] Calling encryption service...');
  const encryptedData = await input.encrypt();
  
  console.log('[FHEVM] Encryption successful', {
    handlesCount: encryptedData.handles.length,
    proofLength: encryptedData.inputProof.length
  });
  
  return encryptedData;
}

export async function createPermission(
  contractAddress: string,
  userAddress: string,
  signer: any
): Promise<{ publicKey: string; privateKey: string; signature: string }> {
  const instance = await getFHEVMInstance();
  
  console.log('[FHEVM] Creating permission for decryption...');
  console.log('[FHEVM] Contract:', contractAddress);
  console.log('[FHEVM] User:', userAddress);
  
  // Generate ephemeral keypair for reencryption
  const { publicKey, privateKey } = instance.generateKeypair();
  
  // Create EIP712 object for signing
  const eip712 = instance.createEIP712(publicKey, contractAddress);
  
  // Sign with user's wallet
  const signature = await signer.signTypedData(
    eip712.domain,
    { Reencrypt: eip712.types.Reencrypt },
    eip712.message
  );
  
  console.log('[FHEVM] Permission created ✓');
  
  return {
    publicKey,
    privateKey,
    signature
  };
}

export async function reencrypt(
  handle: bigint,
  contractAddress: string,
  userAddress: string,
  publicKey: string,
  privateKey: string,
  signature: string
): Promise<bigint> {
  const instance = await getFHEVMInstance();
  
  console.log('[FHEVM] Reencrypting value...');
  console.log('[FHEVM] Handle:', handle.toString());
  console.log('[FHEVM] Contract:', contractAddress);
  
  // Remove 0x prefix from signature if present
  const cleanSignature = signature.replace('0x', '');
  
  const decrypted = await instance.reencrypt(
    handle,
    privateKey,
    publicKey,
    cleanSignature,
    contractAddress,
    userAddress
  );
  
  console.log('[FHEVM] Reencryption successful ✓');
  return decrypted;
}
