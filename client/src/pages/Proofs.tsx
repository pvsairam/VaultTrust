import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle2, Copy, Loader2, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Submission } from "@shared/schema";
import { format } from "date-fns";

export default function Proofs() {
  const { toast } = useToast();
  const { address, isConnected } = useAccount();

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ['/api/submissions', address],
    queryFn: async () => {
      const response = await fetch(`/api/submissions?userAddress=${address}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      const data = await response.json();
      return data.sort((a: Submission, b: Submission) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    enabled: isConnected && !!address,
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Transaction hash copied to clipboard",
    });
  };

  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <GlassCard className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view your proofs
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-24">
      <div className="absolute left-1/4 top-1/3 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-2 font-['Space_Grotesk'] text-4xl font-bold md:text-5xl">
            Published Proofs
          </h1>
          <p className="mb-12 text-muted-foreground">
            Verified proof of reserves with on-chain transaction links
          </p>
        </motion.div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
          </div>
        )}

        {!isLoading && (!submissions || submissions.length === 0) && (
          <GlassCard className="text-center py-12">
            <p className="text-muted-foreground">
              No submissions found. Submit your first reserve on the Submit page.
            </p>
          </GlassCard>
        )}

        {!isLoading && submissions && submissions.length > 0 && (
          <GlassCard>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="pb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Timestamp
                    </th>
                    <th className="pb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Token
                    </th>
                    <th className="pb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Type
                    </th>
                    <th className="pb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Balance
                    </th>
                    <th className="pb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </th>
                    <th className="pb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission, index) => (
                    <motion.tr
                      key={submission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="border-b border-white/5 hover-elevate"
                      data-testid={`row-proof-${submission.id}`}
                    >
                      <td className="py-4 text-sm">
                        {format(new Date(submission.timestamp), 'MMM dd, yyyy HH:mm')}
                      </td>
                      <td className="py-4">
                        <Badge variant="outline" className="font-mono">
                          {submission.tokenSymbol}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">
                          {submission.dataType}
                        </Badge>
                      </td>
                      <td className="py-4 font-mono text-sm">
                        {submission.decryptedBalance || 'Encrypted'}
                      </td>
                      <td className="py-4">
                        {submission.verified ? (
                          <Badge
                            variant="outline"
                            className="gap-1 border-green-500/30 bg-green-500/10 text-green-400"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(submission.transactionHash)}
                            data-testid={`button-copy-${submission.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            data-testid={`button-etherscan-${submission.id}`}
                          >
                            <a
                              href={`https://sepolia.etherscan.io/tx/${submission.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
