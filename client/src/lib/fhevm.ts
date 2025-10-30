import { initSDK, createInstance } from '@zama-fhe/relayer-sdk/bundle';

let fhevmInstance: any | null = null;
let isInitialized = false;

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

export async function initFHEVM() {
  if (fhevmInstance && isInitialized) {
    return fhevmInstance;
  }

  try {
    console.log('[FHEVM] Initializing SDK...');
    
    // Step 1: Load WASM
    await initSDK();
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
    
    // Step 3: Create instance with window.ethereum (Eip1193Provider)
    console.log('[FHEVM] Creating instance with window.ethereum...');
    
    const { SepoliaConfig } = await import('@zama-fhe/relayer-sdk/bundle');
    
    // Use SepoliaConfig with window.ethereum
    const config = {
      ...SepoliaConfig,
      network: window.ethereum,
    };
    
    console.log('[FHEVM] Configuration:', {
      chainId: config.chainId,
      network: 'window.ethereum (MetaMask)',
      aclContract: config.aclContractAddress,
      kmsContract: config.kmsContractAddress
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
