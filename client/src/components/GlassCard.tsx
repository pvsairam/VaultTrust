import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function GlassCard({ children, className, animate = true }: GlassCardProps) {
  const Component = animate ? motion.div : "div";

  return (
    <Component
      {...(animate && {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
      })}
      className={cn(
        "rounded-2xl border border-border bg-card/80 p-6 shadow-lg backdrop-blur-sm",
        className
      )}
    >
      {children}
    </Component>
  );
}
