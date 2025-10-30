import { GlassCard } from "../GlassCard";

export default function GlassCardExample() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <GlassCard>
        <h3 className="mb-2 text-xl font-semibold">Glass Card Example</h3>
        <p className="text-sm text-muted-foreground">
          This is a glassmorphism card with backdrop blur and subtle transparency.
        </p>
      </GlassCard>
    </div>
  );
}
