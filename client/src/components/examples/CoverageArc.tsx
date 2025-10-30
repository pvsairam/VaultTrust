import { CoverageArc } from "../CoverageArc";

export default function CoverageArcExample() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <CoverageArc percentage={87} />
    </div>
  );
}
