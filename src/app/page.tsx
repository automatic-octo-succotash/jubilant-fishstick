import { DashboardShell } from "@/components/dashboard-shell";
import {
  getPipelineMonthlyBreakdown,
  getPipelines,
  getWonByFunnel,
} from "@/lib/dashboard-api";

export default async function Home() {
  const [pipelinesResponse, wonByFunnel] = await Promise.all([
    getPipelines(),
    getWonByFunnel(),
  ]);

  const initialPipeline = pipelinesResponse.items[0] ?? null;
  const initialBreakdown = initialPipeline
    ? await getPipelineMonthlyBreakdown(initialPipeline.id)
    : null;

  return (
    <DashboardShell
      pipelines={pipelinesResponse.items}
      wonByFunnel={wonByFunnel}
      initialBreakdown={initialBreakdown}
    />
  );
}
