import { Link, useLocation } from "wouter";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { NetworkBadge } from "./NetworkBadge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortenAddress } from "@/lib/web3";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/submit", label: "Submit" },
  { href: "/proofs", label: "Proofs" },
  { href: "/docs", label: "Docs" },
];

export function Navbar() {
  const [location] = useLocation();
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();

  const handleWalletAction = () => {
    if (isConnected) {
      disconnect();
      toast({
        title: "Wallet Disconnected",
        description: "Your wallet has been disconnected.",
      });
    } else {
      const metamaskConnector = connectors.find(c => c.name === 'MetaMask');
      if (metamaskConnector) {
        connect(
          { connector: metamaskConnector },
          {
            onSuccess: () => {
              toast({
                title: "Wallet Connected",
                description: "Successfully connected to MetaMask.",
              });
            },
            onError: (error) => {
              toast({
                variant: "destructive",
                title: "Connection Failed",
                description: error.message || "Please make sure MetaMask is installed and unlocked.",
              });
            },
          }
        );
      } else {
        toast({
          variant: "destructive",
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
        });
      }
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
      data-testid="navbar"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-['Space_Grotesk'] text-xl font-bold">
            VaultTrust
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "relative",
                  location === link.href && "text-primary"
                )}
                data-testid={`link-${link.label.toLowerCase()}`}
              >
                {link.label}
                {location === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Button>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <NetworkBadge />
          <Button
            variant={isConnected ? "default" : "outline"}
            size="sm"
            className="hidden md:inline-flex"
            data-testid="button-connect-wallet"
            onClick={handleWalletAction}
          >
            {isConnected && address ? shortenAddress(address) : "Connect Wallet"}
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
}
