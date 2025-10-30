import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { encryptBalance, parseBalance, initFHEVM } from "@/lib/fhevm";
import { PROOF_OF_RESERVES_ADDRESS, PROOF_OF_RESERVES_ABI } from "@/lib/contracts";
import { bytesToHex } from "@/lib/fhevm";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { Exchange } from "@shared/schema";

export default function Submit() {
  const [dataType, setDataType] = useState<string>("");
  const [token, setToken] = useState("");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  
  const { toast} = useToast();
  const { address, isConnected } = useAccount();
  const [, setLocation] = useLocation();
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: exchange, isLoading: isLoadingExchange } = useQuery({
    queryKey: ['/api/exchanges', address],
    queryFn: async () => {
      const response = await fetch(`/api/exchanges/${address}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch exchange');
      }
      return response.json() as Promise<Exchange>;
    },
    enabled: isConnected && !!address,
  });

  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center py-24">
        <GlassCard className="text-center max-w-md">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Please connect your wallet to submit reserves
          </p>
        </GlassCard>
      </div>
    );
  }

  if (isLoadingExchange) {
    return (
      <div className="relative flex min-h-screen items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
      </div>
    );
  }

  if (!exchange || !exchange.verified) {
    return (
      <div className="relative flex min-h-screen items-center justify-center py-24">
        <GlassCard className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-amber-400" />
          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold">
            Registration Required
          </h2>
          <p className="text-muted-foreground mb-6">
            {!exchange 
              ? "You must register your exchange before submitting reserves."
              : "Please verify your exchange email to continue."}
          </p>
          <Button onClick={() => setLocation('/register')} data-testid="button-go-register">
            {!exchange ? "Register Exchange" : "Complete Verification"}
          </Button>
        </GlassCard>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to submit reserves",
        variant: "destructive",
      });
      return;
    }

    if (!dataType || !token || !balanceAmount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsEncrypting(true);
      
      await initFHEVM();
      
      const balanceBigInt = parseBalance(balanceAmount);
      
      const encrypted = await encryptBalance(
        balanceBigInt,
        PROOF_OF_RESERVES_ADDRESS,
        address
      );
      
      setIsEncrypting(false);
      
      toast({
        title: "Encrypting Complete",
        description: "Submitting encrypted balance to blockchain...",
      });
      
      writeContract({
        address: PROOF_OF_RESERVES_ADDRESS as `0x${string}`,
        abi: PROOF_OF_RESERVES_ABI,
        functionName: 'submitEncryptedReserve',
        args: [
          bytesToHex(encrypted.handles[0]) as `0x${string}`,
          bytesToHex(encrypted.inputProof) as `0x${string}`,
          token,
          dataType
        ],
      });
      
    } catch (err: any) {
      setIsEncrypting(false);
      toast({
        title: "Submission Failed",
        description: err.message || "Failed to encrypt or submit balance",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative min-h-screen py-24">
      <div className="absolute right-1/4 top-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-['Space_Grotesk'] text-4xl font-bold md:text-5xl">
                Submit Data
              </h1>
              <p className="mt-2 text-muted-foreground">
                Submit encrypted reserves or liabilities
              </p>
            </div>
          </div>

          <Alert className="mb-8 border-primary/30 bg-primary/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only authorized exchange operators can submit data. Your wallet must
              have the required role on-chain.
            </AlertDescription>
          </Alert>

          <GlassCard>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data-type">Data Type</Label>
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger id="data-type" data-testid="select-data-type">
                      <SelectValue placeholder="Select data type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reserves">Reserves</SelectItem>
                      <SelectItem value="liabilities">Liabilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="token">Token Symbol</Label>
                  <Input
                    id="token"
                    placeholder="e.g., USDT"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    data-testid="input-token"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance-amount">Balance Amount</Label>
                <Input
                  id="balance-amount"
                  type="text"
                  placeholder="e.g., 1000000.50"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  data-testid="input-balance-amount"
                />
                <p className="text-xs text-muted-foreground">
                  Your balance will be encrypted using FHE before submission
                </p>
              </div>

              {isSuccess && (
                <Alert className="border-green-500/30 bg-green-500/10">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    Reserve successfully submitted! Transaction: {hash?.slice(0, 10)}...
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-destructive/30 bg-destructive/10">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {error.message}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={!isConnected || isEncrypting || isPending || isConfirming}
                data-testid="button-submit"
              >
                {isEncrypting && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Encrypting Balance...
                  </>
                )}
                {!isEncrypting && isPending && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirm in Wallet...
                  </>
                )}
                {!isEncrypting && !isPending && isConfirming && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming Transaction...
                  </>
                )}
                {!isEncrypting && !isPending && !isConfirming && (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Submit Encrypted {dataType || "Data"}
                  </>
                )}
              </Button>
            </div>
          </GlassCard>

          <GlassCard className="mt-8">
            <h3 className="mb-4 font-['Space_Grotesk'] text-xl font-bold">
              Encryption Instructions
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                1. Obtain the FHE public key from the contract or use the provided
                SDK
              </p>
              <p>2. Encrypt your numeric balance or liability value (euint64)</p>
              <p>3. Copy the resulting ciphertext and paste it above</p>
              <p>
                4. Include the token symbol and data type before submitting to the
                contract
              </p>
            </div>
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <code className="text-xs">
                const encryptedValue = await fhevmInstance.encrypt64(balance);
              </code>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
