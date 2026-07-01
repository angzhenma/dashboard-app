import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import type { BarChartData } from "../types";

interface SeverityBarChartProps {
  threatsSeverityData: BarChartData[];
  loading: boolean;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "Critical":
      return "var(--soc-red)";
    case "High":
      return "var(--soc-yellow)";
    case "Medium":
      return "var(--soc-blue)";
    case "Low":
      return "var(--soc-green)";
    default:
      return "var(--soc-gray)";
  }
};

export default function SeverityBarChart({
  threatsSeverityData,
  loading,
}: SeverityBarChartProps) {
  if (loading) {
    return (
      <div className="text-slate-400 text-center py-8">Loading chart...</div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={threatsSeverityData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--soc-border)"
            vertical={false}
          />
          <XAxis
            dataKey="severity"
            stroke="var(--soc-gray)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="var(--soc-gray)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
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
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {threatsSeverityData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getSeverityColor(entry.severity)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
