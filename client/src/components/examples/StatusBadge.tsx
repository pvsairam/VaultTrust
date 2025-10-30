import { StatusBadge } from "../StatusBadge";

export default function StatusBadgeExample() {
  return (
    <div className="flex min-h-screen items-center justify-center gap-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <StatusBadge status="fully-covered" />
      <StatusBadge status="under-collateralized" />
      <StatusBadge status="pending" />
    </div>
  );
}
