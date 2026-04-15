"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";

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

type GroupBy = "stage" | "owner" | "product" | "source" | "campaign" | "organization" | "contact";

const GROUP_OPTIONS: GroupBy[] = [
  "stage",
  "owner",
  "product",
  "source",
  "campaign",
  "organization",
  "contact",
];

const GROUP_LABELS: Record<GroupBy, string> = {
  stage:        "Etapa",
  owner:        "Responsável",
  product:      "Produto",
  source:       "Origem",
  campaign:     "Campanha",
  organization: "Empresa",
  contact:      "Contato",
};

// Auto-rotation: divide the worker refresh period evenly across all toggles.
const REFRESH_RATE_MS = 5 * 60 * 1000;
const ROTATION_INTERVAL_MS = Math.floor(REFRESH_RATE_MS / GROUP_OPTIONS.length);

export function DashboardShell({
  pipelines,
  wonByFunnel,
  currentMonthBreakdowns,
  initialOngoing,
}: DashboardShellProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>("stage");
  const [ongoing, setOngoing] = useState(initialOngoing);
  const [isPending, startTransition] = useTransition();

  const isFirstRender = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentMonth = currentMonthBreakdowns[0]?.month ?? "";

  // Fetch whenever groupBy changes, but skip the initial mount (data already loaded server-side).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    startTransition(async () => {
      const res = await fetch(
        `/api/dashboard/ongoing-breakdown?group_by=${encodeURIComponent(groupBy)}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        setOngoing((await res.json()) as OngoingBreakdownResponse);
      }
    });
  }, [groupBy]);

  // Auto-rotation: advance through toggles, reset timer on manual interaction.
  function startRotation() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setGroupBy((prev) => {
        const idx = GROUP_OPTIONS.indexOf(prev);
        return GROUP_OPTIONS[(idx + 1) % GROUP_OPTIONS.length];
      });
    }, ROTATION_INTERVAL_MS);
  }

  useEffect(() => {
    startRotation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleGroupByChange(next: GroupBy) {
    if (next === groupBy) return;
    setGroupBy(next);
    startRotation(); // reset rotation timer on manual click
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
        <div className="top-bar-logo">
          <Image
            src="/logo.png"
            alt="MLC Logística"
            width={82}
            height={36}
            priority
            style={{ objectFit: "contain" }}
          />
        </div>
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
            {GROUP_OPTIONS.map((opt) => (
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
