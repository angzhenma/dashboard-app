import { Bug, ShieldAlert, Terminal, Activity } from "lucide-react";
import type { DashboardMetrics } from "../types";

interface MetricsCardProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export default function MetricsCard({ metrics, loading }: MetricsCardProps) {
  if (loading) {
    return (
      <div className="text-[var(--soc-subtext)] text-center py-8">
        Loading metrics...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 my-4">
      {/* Total Threats Metric */}
      <div className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-[var(--soc-subtext)] font-medium uppercase tracking-wider">
            Total Threats
          </p>
          <Bug size={20} className="text-[var(--soc-subtext)]" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-[var(--soc-text)]">
          {metrics?.totalThreats}
        </p>
      </div>

      {/* Critical Threats Metric */}
      <div className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-[var(--soc-subtext)] font-medium uppercase tracking-wider">
            Critical Threats (Active)
          </p>
          <ShieldAlert size={20} className="text-[var(--soc-red)]" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-[var(--soc-red)]">
          {metrics?.criticalCount}
        </p>
      </div>

      {/* RDP Connections Metric */}
      <div className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-[var(--soc-subtext)] font-medium uppercase tracking-wider">
            RDP Connections
          </p>
          <Terminal size={20} className="text-[var(--soc-light-blue)]" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-[var(--soc-light-blue)]">
          {metrics?.activeRdpConnections}
        </p>
      </div>

      {/* AnyDesk Instances Metric */}
      <div className="bg-[var(--soc-card)] border border-[var(--soc-border)] rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-[var(--soc-subtext)] font-medium uppercase tracking-wider">
            AnyDesk Instances
          </p>
          <Activity size={20} className="text-[var(--soc-yellow)]" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-[var(--soc-yellow)]">
          {metrics?.activeAnyDeskInstances}
        </p>
      </div>
    </div>
  );
}
