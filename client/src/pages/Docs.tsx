import { motion } from "framer-motion";
import { GlassCard } from "@/components/GlassCard";
import { EncryptDecryptFlow } from "@/components/EncryptDecryptFlow";
import { ExternalLink, BookOpen, Github, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Docs() {
  return (
    <div className="relative min-h-screen py-24">
      <div className="absolute right-0 top-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-2 font-['Space_Grotesk'] text-4xl font-bold md:text-5xl">
            Documentation
          </h1>
          <p className="mb-12 text-muted-foreground">
            Learn how VaultTrust implements privacy-preserving proof of reserves
          </p>
        </motion.div>

        <div className="mb-16">
          <h2 className="mb-8 text-center font-['Space_Grotesk'] text-3xl font-bold">
            Data Flow
          </h2>
          <EncryptDecryptFlow />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <GlassCard>
            <BookOpen className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-4 font-['Space_Grotesk'] text-2xl font-bold">
              Technical Overview
            </h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                VaultTrust uses <strong>Fully Homomorphic Encryption (FHE)</strong>{" "}
                to enable privacy-preserving proof of reserves verification.
              </p>
              <p>
                Exchange operators encrypt their wallet balances and liabilities
                using the FHE public key. This encrypted data is submitted to smart
                contracts deployed on Sepolia testnet.
              </p>
              <p>
                The smart contracts perform homomorphic operations (addition,
                comparison) on the encrypted data without ever decrypting it.
                Only the final aggregated results are decrypted by an authorized
                auditor.
              </p>
              <p>
                This ensures that sensitive balance information remains private
                while still enabling transparent verification of reserve coverage.
              </p>
            </div>
          </GlassCard>

          <GlassCard>
            <Code className="mb-4 h-8 w-8 text-primary" />
            <h3 className="mb-4 font-['Space_Grotesk'] text-2xl font-bold">
              Smart Contract Functions
            </h3>
            <div className="space-y-3 text-sm">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <code className="text-xs">submitEncryptedReserves()</code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Submit encrypted reserve balances for a token
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <code className="text-xs">submitEncryptedLiabilities()</code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Submit encrypted liability values for a token
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <code className="text-xs">computeCoverage()</code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Homomorphically compute coverage ratio (reserves / liabilities)
                </p>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <code className="text-xs">publishProof()</code>
                <p className="mt-2 text-xs text-muted-foreground">
                  Re-encrypt results for auditor decryption and publish proof
                </p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="mt-8">
          <h3 className="mb-6 font-['Space_Grotesk'] text-2xl font-bold">
            External Resources
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Button
              variant="outline"
              className="justify-start gap-3 border-primary/30"
              asChild
            >
              <a
                href="https://docs.zama.ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-zama-docs"
              >
                <BookOpen className="h-5 w-5" />
                <span>Zama FHEVM Documentation</span>
                <ExternalLink className="ml-auto h-4 w-4" />
              </a>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3 border-primary/30"
              asChild
            >
              <a
                href="https://github.com/zama-ai/fhevm"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-zama-github"
              >
                <Github className="h-5 w-5" />
                <span>Zama FHEVM GitHub</span>
                <ExternalLink className="ml-auto h-4 w-4" />
              </a>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3 border-primary/30"
              asChild
            >
              <a
                href="https://github.com/zama-ai/fhevm-hardhat-template"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-hardhat-template"
              >
                <Code className="h-5 w-5" />
                <span>Hardhat Template</span>
                <ExternalLink className="ml-auto h-4 w-4" />
              </a>
            </Button>

            <Button
              variant="outline"
              className="justify-start gap-3 border-primary/30"
              asChild
            >
              <a
                href="https://docs.zama.ai/tfhe-rs"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="link-tfhe-docs"
              >
                <BookOpen className="h-5 w-5" />
                <span>TFHE-rs Library</span>
                <ExternalLink className="ml-auto h-4 w-4" />
              </a>
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="mt-8">
          <h3 className="mb-4 font-['Space_Grotesk'] text-2xl font-bold">
            Security Considerations
          </h3>
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>FHE private keys are never stored on-chain or in the frontend</li>
            <li>Only the auditor holds the decryption key for final results</li>
            <li>All intermediate computations remain encrypted</li>
            <li>
              Access control ensures only authorized operators can submit data
            </li>
            <li>
              Proofs are signed and published with on-chain transaction references
            </li>
            <li>This is a testnet deployment for demonstration purposes only</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}
