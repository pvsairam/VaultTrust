import { createPublicClient, http, parseAbiItem, type Log } from 'viem';
import { sepolia } from 'viem/chains';
import { storage } from './storage';
import type { InsertSubmission } from '@shared/schema';

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org';
const PROOF_OF_RESERVES_ADDRESS = process.env.PROOF_OF_RESERVES_ADDRESS || '0x0000000000000000000000000000000000000000';

const PROOF_OF_RESERVES_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "reserveId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ReserveSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "reserveId",
        "type": "uint256"
      }
    ],
    "name": "getReserveInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "tokenSymbol",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "dataType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "verified",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "auditor",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(SEPOLIA_RPC_URL),
});

let isListening = false;

export async function startEventListener() {
  if (isListening) {
    console.log('[EventListener] Already listening to contract events');
    return;
  }

  console.log('[EventListener] Starting to listen for ReserveSubmitted events...');
  console.log('[EventListener] Contract address:', PROOF_OF_RESERVES_ADDRESS);

  try {
    const unwatch = publicClient.watchContractEvent({
      address: PROOF_OF_RESERVES_ADDRESS as `0x${string}`,
      abi: PROOF_OF_RESERVES_ABI,
      eventName: 'ReserveSubmitted',
      onLogs: async (logs) => {
        for (const log of logs) {
          await handleReserveSubmitted(log);
        }
      },
    });

    isListening = true;
    console.log('[EventListener] Successfully started listening');

    process.on('SIGINT', () => {
      console.log('[EventListener] Stopping event listener...');
      unwatch();
      isListening = false;
    });
  } catch (error) {
    console.error('[EventListener] Failed to start:', error);
  }
}

async function handleReserveSubmitted(log: any) {
  try {
    console.log('[EventListener] New ReserveSubmitted event:', {
      user: log.args.user,
      reserveId: log.args.reserveId,
      timestamp: log.args.timestamp,
      blockNumber: log.blockNumber,
      transactionHash: log.transactionHash,
    });

    const userAddress = log.args.user as string;
    const reserveId = Number(log.args.reserveId);
    
    const reserveInfo = await publicClient.readContract({
      address: PROOF_OF_RESERVES_ADDRESS as `0x${string}`,
      abi: PROOF_OF_RESERVES_ABI,
      functionName: 'getReserveInfo',
      args: [userAddress, BigInt(reserveId)],
    }) as [string, string, bigint, boolean, string];

    const [tokenSymbol, dataType, timestamp, verified, auditor] = reserveInfo;

    const submission: InsertSubmission = {
      userAddress,
      reserveId,
      tokenSymbol,
      dataType,
      encryptedBalance: 'ENCRYPTED_ON_CHAIN',
      transactionHash: log.transactionHash as string,
      blockNumber: Number(log.blockNumber),
      timestamp: new Date(Number(timestamp) * 1000),
      verified,
      verifiedBy: verified ? auditor : null,
      verifiedAt: verified ? new Date() : null,
    };

    await storage.createSubmission(submission);

    await storage.createAuditLog({
      action: 'RESERVE_SUBMITTED',
      performedBy: userAddress,
      targetAddress: PROOF_OF_RESERVES_ADDRESS,
      details: JSON.stringify({
        reserveId,
        tokenSymbol,
        dataType,
        transactionHash: log.transactionHash,
      }),
    });

    console.log('[EventListener] Submission stored in database');
  } catch (error) {
    console.error('[EventListener] Error handling ReserveSubmitted event:', error);
  }
}
