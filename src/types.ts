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