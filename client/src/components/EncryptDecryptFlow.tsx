import { motion } from "framer-motion";
import { Lock, Cpu, Unlock, ArrowRight } from "lucide-react";
import { GlassCard } from "./GlassCard";

const steps = [
  {
    icon: Lock,
    title: "Encrypt",
    description: "Exchange operators encrypt wallet balances and liabilities using FHE public key",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Cpu,
    title: "Compute",
    description: "Smart contracts perform homomorphic sum and comparison operations on encrypted data",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Unlock,
    title: "Decrypt",
    description: "Only final verified totals are decrypted by the auditor and published",
    color: "from-green-500 to-emerald-500",
  },
];

export function EncryptDecryptFlow() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {steps.map((step, index) => (
        <div key={step.title} className="flex items-center gap-4">
          <GlassCard className="flex-1">
            <div
              className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color}`}
            >
              <step.icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="mb-2 font-['Space_Grotesk'] text-xl font-bold">
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {step.description}
            </p>
          </GlassCard>
          {index < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.2 }}
              className="hidden md:block"
            >
              <ArrowRight className="h-6 w-6 text-primary" />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
}
