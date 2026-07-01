import { useState, useEffect } from "react";
import {
  fetchMockThreats,
  fetchDashboardMetrics,
  fetchThreatsTypeData,
  fetchUnresolvedStatusData,
  fetchThreatsSeverityData,
} from "../mockData";
import type {
  SecurityThreat,
  DashboardMetrics,
  PieChartData,
  BarChartData,
} from "../types";

export function useDashboardData() {
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
    ]).then(
      ([
        threatsRes,
        metricsRes,
        typesDataRes,
        statusDataRes,
        severityDataRes,
      ]) => {
        setThreats(threatsRes);
        setMetrics(metricsRes);
        setThreatsTypeData(typesDataRes);
        setUnresolvedStatusData(statusDataRes);
        setThreatsSeverityData(severityDataRes);
        setLoading(false);
      },
    );
  }, []);

  return {
    threats,
    metrics,
    threatsTypeData,
    unresolvedStatusData,
    threatsSeverityData,
    loading,
  };
}
