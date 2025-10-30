import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Zap } from "lucide-react";
import { Link } from "wouter";
import { EncryptDecryptFlow } from "@/components/EncryptDecryptFlow";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative flex items-center justify-center overflow-hidden py-20">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />
        <div className="absolute left-1/4 top-1/3 -z-10 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-blue-500/15 blur-3xl" />

        <div className="relative z-20 mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-sm font-medium text-primary">
                Powered by Zama FHEVM
              </span>
            </div>

            <h1 className="mb-6 font-['Space_Grotesk'] text-6xl font-bold tracking-tight md:text-7xl">
              VaultTrust
            </h1>

            <p className="mb-8 font-['Space_Grotesk'] text-2xl text-foreground md:text-3xl">
              Private Proof of Reserves
            </p>

            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Verify exchange reserves without revealing sensitive data using Fully
              Homomorphic Encryption on Sepolia testnet
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  data-testid="button-view-dashboard"
                >
                  View Dashboard
                </Button>
              </Link>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="outline"
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-30">
        <div className="mx-auto max-w-7xl px-6 pb-16 pt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 flex items-center justify-center gap-4">
              <div className="h-px w-20 bg-gradient-to-r from-transparent to-primary/50" />
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="h-px w-20 bg-gradient-to-l from-transparent to-primary/50" />
            </div>
            <h2 className="mb-3 text-center font-['Space_Grotesk'] text-4xl font-bold md:text-5xl">
              How It Works
            </h2>
            <p className="mb-10 text-center text-muted-foreground">
              Three steps to privacy-preserving proof of reserves
            </p>
            <EncryptDecryptFlow />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-3"
          >
            <div className="rounded-2xl border border-border bg-card p-6">
              <Shield className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-['Space_Grotesk'] text-xl font-bold">
                Privacy First
              </h3>
              <p className="text-sm text-muted-foreground">
                Sensitive balance data never leaves encryption. Computation happens
                on encrypted values only.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <Lock className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-['Space_Grotesk'] text-xl font-bold">
                Fully Encrypted
              </h3>
              <p className="text-sm text-muted-foreground">
                Using Zama's FHEVM, all operations preserve encryption end-to-end
                on-chain.
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6">
              <Zap className="mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 font-['Space_Grotesk'] text-xl font-bold">
                Live Verification
              </h3>
              <p className="text-sm text-muted-foreground">
                Real-time on-chain verification with transparent proof publication.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
