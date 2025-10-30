import { motion } from "framer-motion";
import { TokenCard } from "@/components/TokenCard";
import { GlassCard } from "@/components/GlassCard";
import { TrendingUp, DollarSign, Shield, Activity, Loader2, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import type { Submission, Exchange } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  const { data: exchange } = useQuery({
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

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ['/api/submissions', address],
    queryFn: async () => {
      const response = await fetch(`/api/submissions?userAddress=${address}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      return response.json();
    },
    enabled: isConnected && !!address,
  });

  const tokenGroups = submissions?.reduce((acc, sub) => {
    const key = sub.tokenSymbol;
    if (!acc[key]) {
      acc[key] = { reserves: [], liabilities: [] };
    }
    if (sub.dataType === 'Reserve') {
      acc[key].reserves.push(sub);
    } else if (sub.dataType === 'Liability') {
      acc[key].liabilities.push(sub);
    }
    return acc;
  }, {} as Record<string, { reserves: Submission[], liabilities: Submission[] }>);

  const sortedSubmissions = submissions?.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const tokenCards = tokenGroups ? Object.entries(tokenGroups).map(([symbol, data]) => {
    data.reserves.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    data.liabilities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    const latestReserve = data.reserves[0];
    const latestLiability = data.liabilities[0];
    
    let coverage = 0;
    let status: 'fully-covered' | 'pending' | 'under-collateralized' = 'pending';
    
    if (latestReserve?.decryptedBalance && latestLiability?.decryptedBalance) {
      const reserve = parseFloat(latestReserve.decryptedBalance);
      const liability = parseFloat(latestLiability.decryptedBalance);
      if (!isNaN(reserve) && !isNaN(liability) && liability > 0) {
        coverage = Math.round((reserve / liability) * 100);
        status = coverage >= 100 ? 'fully-covered' : 'under-collateralized';
      }
    }
    
    return {
      symbol,
      reserves: latestReserve ? `${latestReserve.decryptedBalance || 'Encrypted'}` : '0',
      liabilities: latestLiability ? `${latestLiability.decryptedBalance || 'Encrypted'}` : '0',
      coverage,
      status,
      trend: 'up' as 'up' | 'down',
    };
  }) : [];

  const totalSubmissions = sortedSubmissions?.length || 0;
  const verifiedCount = sortedSubmissions?.filter(s => s.verified).length || 0;
  const lastUpdated = sortedSubmissions?.[0]?.timestamp 
    ? formatDistanceToNow(new Date(sortedSubmissions[0].timestamp), { addSuffix: true })
    : 'Never';

  const stats = [
    { label: "Total Submissions", value: totalSubmissions.toString(), icon: TrendingUp, color: "text-green-400" },
    { label: "Unique Tokens", value: Object.keys(tokenGroups || {}).length.toString(), icon: DollarSign, color: "text-blue-400" },
    { label: "Verified", value: verifiedCount.toString(), icon: Shield, color: "text-purple-400" },
    { label: "Last Updated", value: lastUpdated, icon: Activity, color: "text-cyan-400" },
  ];

  if (!isConnected) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <GlassCard className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-['Space_Grotesk'] text-2xl font-bold">
            Connect Your Wallet
          </h2>
          <p className="text-muted-foreground">
            Please connect your wallet to view your reserves dashboard
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen py-24">
      <div className="absolute right-0 top-0 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-['Space_Grotesk'] text-4xl font-bold md:text-5xl">
              Dashboard
            </h1>
            {exchange?.verified && (
              <Badge variant="outline" className="flex items-center gap-1.5 text-sm">
                <Building2 className="h-3.5 w-3.5" />
                {exchange.name}
              </Badge>
            )}
          </div>
          <p className="mb-12 text-muted-foreground">
            Real-time verified proof of reserves
          </p>
        </motion.div>

        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard className="hover-elevate" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                <stat.icon className={`mb-2 h-5 w-5 ${stat.color}`} />
                <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-mono text-2xl font-bold">{stat.value}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loading-spinner" />
          </div>
        )}

        {!isLoading && tokenCards.length === 0 && (
          <GlassCard className="text-center py-12">
            <p className="text-muted-foreground">
              No submissions found. Submit your first reserve on the Submit page.
            </p>
          </GlassCard>
        )}

        {!isLoading && tokenCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {tokenCards.map((token, index) => (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <TokenCard {...token} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
