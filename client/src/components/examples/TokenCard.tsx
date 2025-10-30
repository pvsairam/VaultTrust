import { TokenCard } from "../TokenCard";

export default function TokenCardExample() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TokenCard
          symbol="USDT"
          reserves="1,234,567 USDT"
          liabilities="987,654 USDT"
          coverage={125}
          status="fully-covered"
          trend="up"
        />
        <TokenCard
          symbol="USDC"
          reserves="876,543 USDC"
          liabilities="912,345 USDC"
          coverage={96}
          status="under-collateralized"
          trend="down"
        />
        <TokenCard
          symbol="DAI"
          reserves="0 DAI"
          liabilities="0 DAI"
          coverage={0}
          status="pending"
          trend="up"
        />
      </div>
    </div>
  );
}
