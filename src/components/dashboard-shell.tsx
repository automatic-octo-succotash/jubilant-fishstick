"use client";

import { useState, useTransition } from "react";

import {
  OngoingBreakdownResponse,
  Pipeline,
  PipelineMonthlyBreakdown,
  WonByFunnelResponse,
} from "@/lib/dashboard-types";
import { formatMonthLong } from "@/lib/format";
import { WonByFunnelChart } from "@/components/won-by-funnel-chart";
import { FunnelCard } from "@/components/funnel-card";

type DashboardShellProps = {
  pipelines: Pipeline[];
  wonByFunnel: WonByFunnelResponse;
  currentMonthBreakdowns: PipelineMonthlyBreakdown[];
  initialOngoing: OngoingBreakdownResponse;
};

type GroupBy = "stage" | "owner" | "product";

const GROUP_LABELS: Record<GroupBy, string> = {
  stage: "Por etapa",
  owner: "Por responsável",
  product: "Por produto",
};

export function DashboardShell({
  pipelines,
  wonByFunnel,
  currentMonthBreakdowns,
  initialOngoing,
}: DashboardShellProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("stage");
  const [ongoing, setOngoing] = useState(initialOngoing);
  const [isPending, startTransition] = useTransition();

  const currentMonth = currentMonthBreakdowns[0]?.month ?? "";

  function handleGroupByChange(next: GroupBy) {
    if (next === groupBy) return;
    setGroupBy(next);
    startTransition(async () => {
      const res = await fetch(
        `/api/dashboard/ongoing-breakdown?group_by=${encodeURIComponent(next)}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        setOngoing((await res.json()) as OngoingBreakdownResponse);
      }
    });
  }

  const breakdownMap = new Map(
    currentMonthBreakdowns.map((b) => [b.pipeline_id, b]),
  );
  const ongoingMap = new Map(
    ongoing.items.map((item) => [item.pipeline_id, item]),
  );

  const lastSynced = currentMonthBreakdowns.find((b) => b.last_synced_at)
    ?.last_synced_at;

  return (
    <div className="dashboard">
      <div className="top-bar">
        <span className="top-bar-title">MLC Logística — Dashboard de Vendas</span>
        {lastSynced ? (
          <span className="top-bar-meta">
            Atualizado{" "}
            {new Intl.DateTimeFormat("pt-BR", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(lastSynced))}
          </span>
        ) : null}
      </div>

      <div className="panel chart-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Histórico</p>
            <p className="section-title">
              Receita ganha por funil — últimos 12 meses fechados
            </p>
          </div>
          <span className="section-meta">
            {wonByFunnel.range_start} → {wonByFunnel.range_end}
          </span>
        </div>
        <div className="chart-wrap">
          <WonByFunnelChart data={wonByFunnel} />
        </div>
      </div>

      <div className="live-section">
        <div className="toggle-row">
          <span className="toggle-label">Em andamento</span>
          <div className="toggle-group" role="group" aria-label="Agrupar por">
            {(["stage", "owner", "product"] as GroupBy[]).map((opt) => (
              <button
                key={opt}
                type="button"
                className={`toggle-btn${groupBy === opt ? " active" : ""}`}
                onClick={() => handleGroupByChange(opt)}
              >
                {GROUP_LABELS[opt]}
              </button>
            ))}
          </div>
          {isPending ? (
            <span className="toggle-updating">Atualizando…</span>
          ) : null}
          {currentMonth ? (
            <span className="toggle-month">{formatMonthLong(currentMonth)}</span>
          ) : null}
        </div>

        <div
          className={`funnel-row${isPending ? " updating" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${pipelines.length}, minmax(0, 1fr))`,
          }}
        >
          {pipelines.map((pipeline) => (
            <FunnelCard
              key={pipeline.id}
              pipeline={pipeline}
              breakdown={breakdownMap.get(pipeline.id) ?? null}
              ongoing={ongoingMap.get(pipeline.id) ?? null}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
