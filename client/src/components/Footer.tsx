import { Shield, Github, Twitter } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-['Space_Grotesk'] font-bold">VaultTrust</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Privacy-preserving Proof of Reserves using Fully Homomorphic Encryption
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <a
                  href="https://docs.zama.ai/fhevm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Zama FHEVM Docs
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/zama-ai/fhevm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide">
              Connect
            </h3>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-8 text-center text-sm text-muted-foreground">
          build with &lt;3 by{" "}
          <a
            href="https://x.com/xtestnet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            xtestnet
          </a>
        </div>
      </div>
    </footer>
  );
}
