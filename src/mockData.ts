import type { SecurityThreat, PieChartData, BarChartData, DashboardMetrics } from './types';

export const fetchMockThreats = (): Promise<SecurityThreat[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: "TR-9021",
          computerName: "FINANCE-LAPTOP-04",
          ipAddress: "192.168.1.45",
          threatType: "Shadow IT Application",
          programName: "AnyDesk.exe",
          severity: "High",
          detectedTime: "2026-06-27T14:22:00Z",
          status: "Active"
        },
        {
          id: "TR-4412",
          computerName: "DEV-WORKSTATION-12",
          ipAddress: "192.168.2.110",
          threatType: "RDP Exploit",
          programName: "Port 3389 Inbound",
          severity: "Critical",
          detectedTime: "2026-06-27T15:01:14Z",
          status: "Active"
        },
        {
          id: "TR-1104",
          computerName: "HR-PC-01",
          ipAddress: "192.168.1.12",
          threatType: "Unpatched Vulnerability",
          programName: "CVE-2024-38077 (Remote Code Execution)",
          severity: "Critical",
          detectedTime: "2026-06-26T09:15:30Z",
          status: "Active"
        }
      ]);
    }, 500);
  });
};

export const fetchThreatsTypeData = (): Promise<PieChartData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Malware', value: 35, color: '#F472B6' },
        { name: 'Ransomware', value: 15, color: '#E879F9' },
        { name: 'RDP Exploit', value: 25, color: '#C084FC' },
        { name: 'Shadow IT', value: 10, color: '#A78BFA' },
        { name: 'Phishing', value: 15, color: '#818CF8' }
      ]);
    }, 600);
  });
};

export const fetchUnresolvedStatusData = (): Promise<PieChartData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { name: 'Not Mitigated', value: 45, color: 'var(--soc-red)' },
        { name: 'Mitigated (Pending)', value: 35, color: 'var(--soc-yellow)' },
        { name: 'Under Investigation', value: 20, color: '#38BDF8' }
      ]);
    }, 600);
  });
};

export const fetchThreatsSeverityData = (): Promise<BarChartData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { severity: 'Critical', count: 12 },
        { severity: 'High', count: 28 },
        { severity: 'Medium', count: 45 },
        { severity: 'Low', count: 32 },
        { severity: 'False Positive', count: 18 }
      ]);
    }, 700);
  });
};

export const fetchDashboardMetrics = (): Promise<DashboardMetrics> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                totalThreats: 135,
                criticalCount: 12,
                activeAnyDeskInstances: 8,
                activeRdpConnections: 15
            });
        }, 500);
    });
};