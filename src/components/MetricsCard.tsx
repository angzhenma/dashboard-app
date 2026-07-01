import { Bug, ShieldAlert, Terminal, Activity } from "lucide-react";
import type { DashboardMetrics } from "../types";

interface MetricsCardProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export default function MetricsCard({ metrics, loading }: MetricsCardProps) {
  if (loading) {
    return (
      <div className="text-slate-400 text-center py-8">Loading metrics...</div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
      {/* Total Threats Metric */}
      <div className="bg-[#090d16] border border-slate-700 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-slate-400 font-medium uppercase tracking-wider">
            Total Threats
          </p>
          <Bug size={20} className="text-slate-400" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-white">
          {metrics?.totalThreats}
        </p>
      </div>

      {/* Critical Threats Metric */}
      <div className="bg-[#090d16] border border-slate-700 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-slate-400 font-medium uppercase tracking-wider">
            Critical Threats (Active)
          </p>
          <ShieldAlert size={20} className="text-red-500" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-red-500">
          {metrics?.criticalCount}
        </p>
      </div>

      {/* RDP Connections Metric */}
      <div className="bg-[#090d16] border border-slate-700 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-slate-400 font-medium uppercase tracking-wider">
            RDP Connections
          </p>
          <Terminal size={20} className="text-cyan-500" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-cyan-500">
          {metrics?.criticalCount}
        </p>
      </div>

      {/* AnyDesk Instances Metric */}
      <div className="bg-[#090d16] border border-slate-700 rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <p className="m-0 text-sm text-slate-400 font-medium uppercase tracking-wider">
            AnyDesk Instances
          </p>
          <Activity size={20} className="text-yellow-500" />
        </div>
        <p className="m-0 mt-2 text-3xl font-bold text-yellow-500">
          {metrics?.criticalCount}
        </p>
      </div>
    </div>
  );
}
