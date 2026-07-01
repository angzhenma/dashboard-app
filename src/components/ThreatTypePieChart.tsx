import {
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import type { PieChartData } from "../types";

interface ThreatTypePieChartProps {
  threatsTypeData: PieChartData[];
  loading: boolean;
}

export default function ThreatTypePieChart({
  threatsTypeData,
  loading,
}: ThreatTypePieChartProps) {
  if (loading) {
    return (
      <div className="text-slate-400 text-center py-8">Loading chart...</div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={threatsTypeData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {threatsTypeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              backgroundColor: "var(--soc-card)",
              border: "1px solid var(--soc-border)",
              color: "#FFF",
              padding: "10px",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
          />

          <Legend
            iconType="circle"
            wrapperStyle={{
              fontSize: "12px",
              color: "#94a3b8",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
