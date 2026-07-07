import { supabase } from "../lib/supabaseClient";
import type {
  BarChartData,
  DashboardMetrics,
  DevicesByOS,
  PieChartData,
  SecurityThreat,
  VulnerableAppsData,
} from "../types";

const THREAT_TYPE_COLORS: Record<string, string> = {
  "Malware Execution": "#f472b6",
  "RDP Exploit": "#c084fc",
  "Shadow IT Application": "#a78bfa",
  "Unpatched Vulnerability": "#818cf8",
};

export function computeMetrics(threats: SecurityThreat[]): DashboardMetrics {
  return {
    totalThreats: threats.length,
    criticalCount: threats.filter((t) => t.severity === "Critical").length,
    activeAnyDeskInstances: threats.filter(
      (t) =>
        t.status === "Active" &&
        t.programName.toLocaleLowerCase().includes("anydesk"),
    ).length,
    activeRdpConnections: threats.filter(
      (t) => t.status === "Active" && t.threatType === "RDP Exploit",
    ).length,
  };
}

export function computeThreatTypeData(
  threats: SecurityThreat[],
): PieChartData[] {
  const counts = new Map<string, number>();
  for (const threat of threats) {
    counts.set(threat.threatType, (counts.get(threat.threatType) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([name, value]) => ({
    name,
    value,
    color: THREAT_TYPE_COLORS[name] ?? "var(--soc-gray)",
  }));
}

export function computerUnresolvedStatusData(
  threats: SecurityThreat[],
): PieChartData[] {
  const statusMeta: Record<string, { label: string; color: string }> = {
    Active: { label: "Not Mitigated", color: "var(--soc-red)" },
    Suspended: { label: "Mitigated (Pending)", color: "var(--soc-yellow)" },
    Mitigated: { label: "Resolved", color: "var(--soc-green)" },
  };
  const counts = new Map<string, number>();
  for (const threat of threats) {
    counts.set(threat.status, (counts.get(threat.status) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([status, value]) => ({
    name: statusMeta[status]?.label ?? status,
    value,
    color: statusMeta[status]?.color ?? "var(--soc-gray)",
  }));
}

export function copmuteThreatsSeverityData(
  threats: SecurityThreat[],
): BarChartData[] {
  const order: BarChartData["severity"][] = [
    "Critical",
    "High",
    "Medium",
    "Low",
  ];
  const counts = new Map<string, number>();
  for (const threat of threats) {
    counts.set(threat.severity, (counts.get(threat.severity) ?? 0) + 1);
  }
  return order
    .filter((severity) => counts.has(severity))
    .map((severity) => ({ severity, count: counts.get(severity)! }));
}

interface ThreatRow {
  id: string;
  computer_name: string;
  ip_address: string;
  threat_type: SecurityThreat["threatType"];
  program_name: string;
  severity: SecurityThreat["severity"];
  detected_time: string;
  status: SecurityThreat["status"];
}

function mapThreatRow(row: ThreatRow): SecurityThreat {
  return {
    id: row.id,
    computerName: row.computer_name,
    ipAddress: row.ip_address,
    threatType: row.threat_type,
    programName: row.program_name,
    severity: row.severity,
    detectedTime: row.detected_time,
    status: row.status,
  };
}

export async function fetchThreats(): Promise<SecurityThreat[]> {
  const { data, error } = await supabase
    .from("threats")
    .select("*")
    .order("detected_time", { ascending: false });

  if (error) throw error;
  return (data as ThreatRow[]).map(mapThreatRow);
}

export async function fetchVulnerableAppsData(): Promise<VulnerableAppsData[]> {
  const { data, error } = await supabase
    .from("vulnerable_apps")
    .select("name, hosts, severity")
    .order("hosts", { ascending: false });

  if (error) throw error;
  return data as VulnerableAppsData[];
}

export async function fetchDevicesByOSData(): Promise<DevicesByOS[]> {
    const { data, error } = await supabase
    .from("devices_by_os")
    .select("name, value, color")
    .order("value", { ascending: false });

    if (error) throw error;
    return data as DevicesByOS[];
}