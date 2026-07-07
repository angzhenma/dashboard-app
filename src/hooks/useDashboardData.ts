import { useState, useEffect } from "react";
// import {
//   fetchMockThreats,
//   fetchDashboardMetrics,
//   fetchThreatsTypeData,
//   fetchUnresolvedStatusData,
//   fetchThreatsSeverityData,
// } from "../mockData";
import {
  fetchThreats,
  computeMetrics,
  computeThreatsTypeData,
  computeUnresolvedStatusData,
  computeThreatsSeverityData,
} from "../api/dashboardApi";
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchThreats()
      .then((threatsRes) => {
        if (cancelled) return;
        setThreats(threatsRes);
        setMetrics(computeMetrics(threatsRes));
        setThreatsTypeData(computeThreatsTypeData(threatsRes));
        setUnresolvedStatusData(computeUnresolvedStatusData(threatsRes));
        setThreatsSeverityData(computeThreatsSeverityData(threatsRes));
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load dashboard data:", err);
        setError(
          err instanceof Error ? err.message : "failed to load dashboard data.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    threats,
    metrics,
    threatsTypeData,
    unresolvedStatusData,
    threatsSeverityData,
    loading,
    error,
  };
}
