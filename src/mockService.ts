import type { SecurityThreat } from './types';

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