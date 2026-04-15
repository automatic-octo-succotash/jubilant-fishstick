import { DashboardShell } from "@/components/dashboard-shell";
import {
  getOngoingBreakdown,
  getPipelineMonthlyBreakdown,
  getPipelines,
  getWonByFunnel,
} from "@/lib/dashboard-api";
import { currentMonthValue } from "@/lib/format";

export default async function Home() {
  const [pipelinesResponse, wonByFunnel] = await Promise.all([
    getPipelines(),
    getWonByFunnel(),
  ]);

  const currentMonth = currentMonthValue();

  const [currentMonthBreakdowns, initialOngoing] = await Promise.all([
    Promise.all(
      pipelinesResponse.items.map((p) =>
        getPipelineMonthlyBreakdown(p.id, currentMonth),
      ),
    ),
    getOngoingBreakdown("stage"),
  ]);

  return (
    <DashboardShell
      pipelines={pipelinesResponse.items}
      wonByFunnel={wonByFunnel}
      currentMonthBreakdowns={currentMonthBreakdowns}
      initialOngoing={initialOngoing}
    />
  );
}
