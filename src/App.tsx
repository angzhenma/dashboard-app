import React, { useEffect, useState } from "react";
import {
  fetchMockThreats,
  fetchThreatsTypeData,
  fetchUnresolvedStatusData,
  fetchThreatsSeverityData,
  fetchDashboardMetrics,
} from "./mockData";
import type {
  SecurityThreat,
  PieChartData,
  BarChartData,
  DashboardMetrics,
} from "./types";
import {
  ShieldAlert,
  Terminal,
  Bug,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function App() {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [threatsTypeData, setThreatsTypeData] = useState<PieChartData[]>([]);
  const [unresolvedStatusData, setUnresolvedStatusData] = useState<
    PieChartData[]
  >([]);
  const [threatsSeverityData, setThreatsSeverityData] = useState<
    BarChartData[]
  >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMockThreats(),
      fetchDashboardMetrics(),
      fetchThreatsTypeData(),
      fetchUnresolvedStatusData(),
      fetchThreatsSeverityData(),
    ]).then(([threats, metrics, typesData, statusData, severityData]) => {
      setThreats(threats);
      setMetrics(metrics);
      setThreatsTypeData(typesData);
      setUnresolvedStatusData(statusData);
      setThreatsSeverityData(severityData);
      setLoading(false);
    });
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "var(--soc-red)";
      case "High":
        return "var(--soc-yellow)";
      case "Medium":
        return "#38BDF8"; // Blue
      case "Low":
        return "var(--soc-green)";
      default:
        return "#64748B"; // Grey for False Positive
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* HEADER BAR */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          paddingBottom: "24px",
          marginBottom: "32px",
          borderBottom: "1px solid var(--soc-border)",
        }}
      >
        <ShieldAlert size={36} color="var(--soc-red)" />
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "24px",
              fontWeight: "bold",
              color: "#FFF",
            }}
          >
            SME Security Dashboard
          </h1>
          <p
            style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#64748B" }}
          >
            Prototype with Simulated Threat Data Feed
          </p>
        </div>
      </header>

      {/* METRIC SUMMARIES */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        <div style={cardStyle}>
          <div style={metricHeaderStyle}>
            <p style={metricLabelStyle}>Total Threats</p>
            <Bug size={20} color="#64748B" />
          </div>
          <p style={{ ...metricValueStyle, color: "#FFF" }}>
            {loading ? "..." : metrics?.totalThreats}
          </p>
        </div>
        <div style={cardStyle}>
          <div style={metricHeaderStyle}>
            <p style={metricLabelStyle}>Critical Threats (Active)</p>
            <ShieldAlert size={20} color="var(--soc-red)" />
          </div>
          <p style={{ ...metricValueStyle, color: "var(--soc-red)" }}>
            {loading ? "..." : metrics?.criticalCount}
          </p>
        </div>
        <div style={cardStyle}>
          <div style={metricHeaderStyle}>
            <p style={metricLabelStyle}>RDP Connections</p>
            <Terminal size={20} color="#38BDF8" />
          </div>
          <p style={{ ...metricValueStyle, color: "#38BDF8" }}>
            {loading ? "..." : metrics?.activeRdpConnections}
          </p>
        </div>
        <div style={cardStyle}>
          <div style={metricHeaderStyle}>
            <p style={metricLabelStyle}>AnyDesk Instances</p>
            <Activity size={20} color="var(--soc-yellow)" />
          </div>
          <p style={{ ...metricValueStyle, color: "var(--soc-yellow)" }}>
            {loading ? "..." : metrics?.activeAnyDeskInstances}
          </p>
        </div>
      </section>

      {/* CHARTS SECTION */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {/* Threat Types Pie Chart */}
        <div style={cardStyle}>
          <h2 style={chartTitleStyle}>Threats by Type</h2>
          <div style={{ height: "300px" }}>
            {loading ? (
              <p
                style={{
                  color: "#64748B",
                  textAlign: "center",
                  paddingTop: "100px",
                }}
              >
                Loading chart...
              </p>
            ) : (
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
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Unresolved Threats Pie Chart */}
        <div style={cardStyle}>
          <h2 style={chartTitleStyle}>Unresolved Threats</h2>
          <div style={{ height: "300px" }}>
            {loading ? (
              <p
                style={{
                  color: "#64748B",
                  textAlign: "center",
                  paddingTop: "100px",
                }}
              >
                Loading chart...
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={unresolvedStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {unresolvedStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Threat Count Bar Chart */}
        <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
          {" "}
          {/* Spans full width */}
          <h2 style={chartTitleStyle}>Threats by Severity</h2>
          <div style={{ height: "300px" }}>
            {loading ? (
              <p
                style={{
                  color: "#64748B",
                  textAlign: "center",
                  paddingTop: "100px",
                }}
              >
                Loading chart...
              </p>
            ) : (
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
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="var(--soc-blue)"
                    radius={[4, 4, 0, 0]}
                  >
                    {threatsSeverityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getSeverityColor(entry.severity)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>

      {/* THREAT DATA FEED */}
      {loading ? (
        <p style={{ color: "#64748B" }}>Inverting telemetry pipelines...</p>
      ) : (
        <div
          style={{ display: "grid", gap: "16px", gridTemplateColumns: "1fr" }}
        >
          <h2 style={{ fontSize: "18px", color: "#FFF", marginBottom: "4px" }}>
            Real-time Incident Feed
          </h2>
          {threats.map((threat) => (
            <div
              key={threat.id}
              style={{
                ...cardStyle,
                borderLeft: `4px solid ${threat.severity === "Critical" ? "var(--soc-red)" : "var(--soc-yellow)"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    color: "#FFF",
                    fontWeight: 600,
                  }}
                >
                  <Terminal size={16} color="#64748B" />
                  {threat.computerName}{" "}
                  <span style={{ color: "#64748B", fontWeight: 400 }}>
                    ({threat.ipAddress})
                  </span>
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    padding: "4px 10px",
                    borderRadius: "12px",
                    backgroundColor:
                      threat.severity === "Critical"
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(245, 158, 11, 0.1)",
                    color:
                      threat.severity === "Critical"
                        ? "var(--soc-red)"
                        : "var(--soc-yellow)",
                    border: `1px solid ${threat.severity === "Critical" ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)"}`,
                  }}
                >
                  {threat.severity.toUpperCase()}
                </span>
              </div>
              <p
                style={{
                  margin: "0 0 4px 0",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: "#F1F5F9",
                }}
              >
                {threat.threatType}
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "#94A3B8" }}>
                Flagged Object:{" "}
                <code
                  style={{
                    backgroundColor: "#1E293B",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {threat.programName}
                </code>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* REUSABLE OBJECT STYLES */
const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--soc-card)",
  border: "1px solid var(--soc-border)",
  borderRadius: "12px",
  padding: "20px",
};

const metricLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "13px",
  color: "#94A3B8",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const metricValueStyle: React.CSSProperties = {
  margin: "8px 0 0 0",
  fontSize: "32px",
  fontWeight: "bold",
};

const metricHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "8px",
};

const chartTitleStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#FFF",
  marginBottom: "20px",
};

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "var(--soc-card)",
  border: "1px solid var(--soc-border)",
  color: "#FFF",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "12px",
};
