import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useSignMessage } from "wagmi";
import { Shield, Mail, Building2, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Exchange } from "@shared/schema";
import { useLocation } from "wouter";

export default function Register() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [verificationCode, setVerificationCode] = useState("");
  const [displayedCode, setDisplayedCode] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const { data: existingExchange } = useQuery({
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

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; walletAddress: string; signature: string; message: string }) => {
      const response = await fetch('/api/exchanges/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
      }
      return response.json() as Promise<{ testModeCode: string }>;
    },
    onSuccess: (data) => {
      setDisplayedCode(data.testModeCode);
      setStep("verify");
      toast({
        title: "Registration Successful",
        description: "Please enter the verification code displayed below.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register exchange",
        variant: "destructive",
      });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: { walletAddress: string; code: string }) => {
      const response = await fetch('/api/exchanges/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Verification failed');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/exchanges', address] });
      toast({
        title: "Verification Successful",
        description: "Your exchange is now verified! You can submit reserves.",
      });
      setTimeout(() => {
        setLocation('/submit');
      }, 2000);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    },
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    try {
      // Sign a message to prove wallet ownership
      const message = `Register exchange "${formData.name}" with email "${formData.email}" at ${new Date().toISOString()}`;
      const signature = await signMessageAsync({ message });

      registerMutation.mutate({
        name: formData.name,
        email: formData.email,
        walletAddress: address,
        signature,
        message,
      });
    } catch (error: any) {
      toast({
        title: "Signature Required",
        description: "You must sign the message to prove wallet ownership.",
        variant: "destructive",
      });
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    verifyMutation.mutate({
      walletAddress: address,
      code: verificationCode,
    });
  };

  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center py-24">
        <GlassCard className="text-center max-w-md">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Please connect your wallet to register your exchange
          </p>
        </GlassCard>
      </div>
    );
  }

  if (existingExchange?.verified) {
    return (
      <div className="relative flex min-h-screen items-center justify-center py-24">
        <GlassCard className="text-center max-w-md">
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-400" />
          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold">
            Already Registered
          </h2>
          <p className="text-muted-foreground mb-6">
            Your exchange "{existingExchange.name}" is verified and ready to submit reserves.
          </p>
          <Button onClick={() => setLocation('/submit')} data-testid="button-go-submit">
            Go to Submit Page
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-24">
      <div className="absolute left-1/4 top-1/3 -z-10 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-2 font-['Space_Grotesk'] text-4xl font-bold md:text-5xl">
            Exchange Registration
          </h1>
          <p className="mb-12 text-muted-foreground">
            Register your exchange to submit proof of reserves
          </p>
        </motion.div>

        <GlassCard>
          {step === "register" && (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Exchange Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Binance, Coinbase"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-exchange-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Official Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@yourexchange.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  data-testid="input-email"
                />
                <p className="text-xs text-muted-foreground">
                  For production: Use your official domain email (@binance.com, @coinbase.com)
                </p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Wallet Address
                </Label>
                <Input
                  value={address || ""}
                  disabled
                  className="font-mono text-sm"
                  data-testid="input-wallet"
                />
                <p className="text-xs text-muted-foreground">
                  Connected wallet will be linked to your exchange
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={registerMutation.isPending}
                data-testid="button-register"
              >
                {registerMutation.isPending ? "Registering..." : "Register Exchange"}
              </Button>
            </form>
          )}

          {step === "verify" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-400 mb-1">Test Mode</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a test application. In production, this verification code would be sent to your official email address.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center p-6 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-2">Your Verification Code:</p>
                <p className="text-4xl font-bold font-mono tracking-wider text-primary" data-testid="text-verification-code">
                  {displayedCode}
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Enter Verification Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    required
                    className="font-mono text-center text-2xl tracking-wider"
                    data-testid="input-verification-code"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyMutation.isPending}
                  data-testid="button-verify"
                >
                  {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
                </Button>
              </form>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
