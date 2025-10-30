import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const SEPOLIA_CHAIN_ID = 11155111;

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected({ target: 'metaMask' }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
  ssr: false,
});

export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isSepoliaNetwork(chainId: number | undefined): boolean {
  return chainId === SEPOLIA_CHAIN_ID;
}
