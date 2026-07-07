export interface DashboardCard {
  id: string;
  type: 'metrics' | 'threatTypePie' | 'unresolvedPie' | 'severityBar' | 'vulnerableApps' | 'devicesByOS';
  title: string;
}

export interface SecurityThreat {
  id: string;
  computerName: string;
  ipAddress: string;
  threatType: 'RDP Exploit' | 'Shadow IT Application' | 'Malware Execution' | 'Unpatched Vulnerability';
  programName: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  detectedTime: string;
  status: 'Active' | 'Mitigated' | 'Suspended';
}
export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface BarChartData {
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'False Positive';
  count: number;
}

export interface DashboardMetrics {
  totalThreats: number;
  criticalCount: number;
  activeAnyDeskInstances: number;
  activeRdpConnections: number;
}

export interface VulnerableAppsData {
  name: string;
  hosts: number;
  severity: string;
}

export interface DevicesByOS {
  name: string;
  value: number;
  color: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  role: 'admin' | 'developer' | 'analyst';
};

export type UserRole = 'admin' | 'developer' | 'analyst';

export interface Profile {
  id: string;
  display_name: string;
  role: UserRole;
}

export interface DashboardCardItem {
  id: string;
  type: string;
  title: string;
}

export type DashboardColumns = Record<string, DashboardCardItem[]>;