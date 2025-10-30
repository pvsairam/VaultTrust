import { initSDK, createInstance, type SepoliaConfig as ZamaSepoliaConfig } from '@zama-fhe/relayer-sdk/bundle';

export const SEPOLIA_GATEWAY_URL = import.meta.env.VITE_FHEVM_GATEWAY_URL || 'https://gateway.sepolia.zama.ai';
export const KMS_CONTRACT_ADDRESS = import.meta.env.VITE_KMS_CONTRACT_ADDRESS || '0x05fD1D4AE5847832512808d2F666b76F79Bb1C6F';
export const ACL_CONTRACT_ADDRESS = import.meta.env.VITE_ACL_CONTRACT_ADDRESS || '0x2Fb6f44eB1cbA1372d5Fa506F1171e554Bd5aC1F';

let fhevmInstance: any | null = null;
let isInitialized = false;

export async function initFHEVM() {
  if (fhevmInstance && isInitialized) {
    return fhevmInstance;
  }

  try {
    console.log('[FHEVM] Initializing SDK...');
    
    // Step 1: Load WASM
    await initSDK();
    console.log('[FHEVM] SDK initialized');
    
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }
    
    // Step 2: Create instance using window.ethereum (as per Zama docs)
    console.log('[FHEVM] Creating instance with window.ethereum...');
    
    // Import SepoliaConfig and override network
    const { SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');
    
    const config = {
      ...SepoliaConfig,
      network: window.ethereum, // ✅ Use wallet provider instead of RPC URL
    };
    
    console.log('[FHEVM] Config:', {
      ...config,
      network: 'window.ethereum'
    });
    
    fhevmInstance = await createInstance(config);
    
    isInitialized = true;
    console.log('[FHEVM] Instance created successfully');
    return fhevmInstance;
  } catch (error) {
    console.error('[FHEVM] Initialization failed:', error);
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
  const instance = await getFHEVMInstance();
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  
  input.add64(balanceAmount);
  
  const encryptedData = await input.encrypt();
  console.log('[FHEVM] Encryption successful');
  return encryptedData;
}

export async function createEncryptedInput(
  contractAddress: string,
  userAddress: string
) {
  const instance = await getFHEVMInstance();
  return instance.createEncryptedInput(contractAddress, userAddress);
}

export function hexToBytes(hex: string): Uint8Array {
  if (hex.startsWith('0x')) {
    hex = hex.slice(2);
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

export function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function parseBalance(balanceString: string, decimals: number = 9): bigint {
  const cleanedString = balanceString.replace(/[^0-9.]/g, '');
  
  if (!cleanedString || cleanedString === '.') {
    throw new Error('Invalid balance format');
  }
  
  const parts = cleanedString.split('.');
  const integerPart = parts[0] || '0';
  const fractionalPart = (parts[1] || '').padEnd(decimals, '0').slice(0, decimals);
  
  const wholeNumber = integerPart + fractionalPart;
  
  try {
    const value = BigInt(wholeNumber);
    const MAX_UINT64 = BigInt('18446744073709551615');
    if (value > MAX_UINT64) {
      throw new Error('Balance too large - maximum is ~18.4 billion tokens');
    }
    return value;
  } catch (error: any) {
    throw new Error(error.message || 'Invalid number format');
  }
}
