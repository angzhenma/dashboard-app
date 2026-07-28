import { withSupabase } from "@supabase/server";

const SENTINELONE_API_TOKEN = Deno.env.get("SENTINELONE_API_TOKEN");
const SENTINELONE_BASE_URL = Deno.env.get("SENTINELONE_BASE_URL");
const PAGE_LIMIT = 100;

interface S1Threat {
  id: string;
  threatInfo?: {
    classification?: string;
    confidenceLevel?: string;
    mitigationStatus?: string;
    threatName?: string;
    originatorProcess?: string;
    identifiedAt?: string;
    createdAt?: string;
  };
  agentRealtimeInfo?: {
    agentComputerName?: string;
    agentIpV4?: string;
  };
}

interface ThreatRow {
  id: string;
  computer_name: string;
  ip_address: string;
  threat_type: string;
  program_name: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  deteceted_time: string;
  status: "Active" | "Mitigated" | "Suspended";
}

// Normalization Layer

function mapConfidenceToSeverity(
  confidenceLevel: string | undefined,
): ThreatRow["severity"] {
  switch (confidenceLevel?.toLowerCase()) {
    case "malicious":
      return "Critical";
    case "suspicious":
      return "Medium";
    default:
      return "Low";
  }
}

function mapMitigationStatusToStatus(
  mitigationStatus: string | undefined,
): ThreatRow["status"] {
  const status = mitigationStatus?.toLowerCase() ?? "";
  if (
    status.includes("mitigat") ||
    status.includes("quarantin") ||
    status.includes("block")
  ) {
    return "Mitigated";
  }
  if (status.includes("active")) {
    return "Active";
  }
  return "Suspended";
}

function mapThreatToRow(threat: S1Threat): ThreatRow {
  const info = threat.threatInfo ?? {};
  const agent = threat.agentRealtimeInfo ?? {};

  return {
    id: threat.id,
    computer_name: agent.agentComputerName ?? "Unknown",
    ip_address: agent.agentIpV4 ?? "0.0.0.0",
    threat_type: info.classification ?? "Unclassified",
    program_name: info.threatName ?? info.originatorProcess ?? "Unknown",
    severity: mapConfidenceToSeverity(info.confidenceLevel),
    deteceted_time:
      info.identifiedAt ?? info.createdAt ?? new Date().toISOString(),
    status: mapMitigationStatusToStatus(info.mitigationStatus),
  };
}

// SentinelOne fetch, with cursor pagination

async function fetchAllThreats(): Promise<S1Threat[]> {
  if (!SENTINELONE_API_TOKEN || !SENTINELONE_BASE_URL) {
    throw new Error("SENTINELONE_API_TOKEN or SENTINELONE_BASE_URL is not set");
  }

  const all: S1Threat[] = [];
  let cursor: string | null = null;

  do {
    const url = new URL(`${SENTINELONE_BASE_URL}/web/api/v2.1/threats`);
    url.searchParams.set("limit", String(PAGE_LIMIT));
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `ApiToken ${SENTINELONE_API_TOKEN}` },
    });

    if (!res.ok) {
      throw new Error(
        `SentinelOne API error: ${res.status} ${await res.text()}`,
      );
    }

    const body = await res.json();
    all.push(...(body.data ?? []));
    cursor = body.pagination?.nextCursor ?? null;
  } while (cursor);

  return all;
}

export default {
  fetch: withSupabase({ auth: "secret:automations" }, async (_req, ctx) => {
    try {
      const threats = await fetchAllThreats();
      const rows = threats.map(mapThreatToRow);

      if (rows.length === 0) {
        return Response.json({ synced: 0 }, { status: 200 });
      }

      const { error } = await ctx.supabaseAdmin
        .from("threats")
        .upsert(rows as never);

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ synced: rows.length }, { status: 200 });
    } catch (err) {
      return Response.json(
        { error: err instanceof Error ? err.message : "Unknown sync error" },
        { status: 500 },
      );
    }
  }),
};
