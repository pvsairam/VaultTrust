import { Badge } from "@/components/ui/badge";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { isSepoliaNetwork, SEPOLIA_CHAIN_ID } from "@/lib/web3";
import { sepolia } from "wagmi/chains";
import { useToast } from "@/hooks/use-toast";

export function NetworkBadge() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { toast } = useToast();
  
  const isCorrectNetwork = isSepoliaNetwork(chainId);
  const showBadge = isConnected;

  const handleSwitchNetwork = () => {
    if (!isCorrectNetwork && switchChain) {
      switchChain(
        { chainId: sepolia.id },
        {
          onSuccess: () => {
            toast({
              title: "Network Switched",
              description: "Successfully switched to Sepolia testnet.",
            });
          },
          onError: (error) => {
            toast({
              variant: "destructive",
              title: "Network Switch Failed",
              description: error.message || "Please try switching manually in MetaMask.",
            });
          },
        }
      );
    }
  };

  if (!showBadge) return null;

  return (
    <Badge
      variant="outline"
      className={`gap-2 px-3 py-1 text-xs font-medium ${
        isCorrectNetwork
          ? "border-primary/30 bg-primary/10"
          : "border-orange-500/30 bg-orange-500/10 cursor-pointer"
      }`}
      data-testid="badge-network"
      onClick={!isCorrectNetwork ? handleSwitchNetwork : undefined}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isCorrectNetwork
            ? "bg-green-400 animate-pulse"
            : "bg-orange-400 animate-pulse"
        }`}
      />
      {isCorrectNetwork ? "Sepolia" : "Wrong Network"}
    </Badge>
  );
}
