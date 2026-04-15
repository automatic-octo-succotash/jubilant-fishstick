import {
  OngoingBreakdownResponse,
  PipelineMonthlyBreakdown,
  PipelinesResponse,
  WonByFunnelResponse,
} from "@/lib/dashboard-types";

const DEFAULT_API_BASE_URL = "http://dashboard-api.app.svc.cluster.local:8080";

function apiBaseUrl() {
  return process.env.DASHBOARD_API_BASE_URL || DEFAULT_API_BASE_URL;
}

async function fetchJSON<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Dashboard API request failed: ${response.status} ${path}`);
  }

  return (await response.json()) as T;
}

export function getPipelines() {
  return fetchJSON<PipelinesResponse>("/api/v1/pipelines");
}

export function getWonByFunnel() {
  return fetchJSON<WonByFunnelResponse>("/api/v1/dashboard/won-by-funnel");
}

export function getPipelineMonthlyBreakdown(pipelineID: string, month?: string) {
  const monthQuery = month ? `?month=${encodeURIComponent(month)}` : "";
  return fetchJSON<PipelineMonthlyBreakdown>(
    `/api/v1/pipelines/${encodeURIComponent(pipelineID)}/monthly-breakdown${monthQuery}`,
  );
}

export function getOngoingBreakdown(groupBy: string = "stage") {
  return fetchJSON<OngoingBreakdownResponse>(
    `/api/v1/dashboard/ongoing-breakdown?group_by=${encodeURIComponent(groupBy)}`,
  );
}
