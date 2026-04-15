"use client";

import { useEffect, useState, useTransition } from "react";

import {
  Pipeline,
  PipelineMonthlyBreakdown,
  WonByFunnelResponse,
} from "@/lib/dashboard-types";
import {
  currentMonthValue,
  formatCurrency,
  formatMonthLong,
  formatNumber,
} from "@/lib/format";
import { WonByFunnelChart } from "@/components/won-by-funnel-chart";

type DashboardShellProps = {
  pipelines: Pipeline[];
  wonByFunnel: WonByFunnelResponse;
  initialBreakdown: PipelineMonthlyBreakdown | null;
};

export function DashboardShell({
  pipelines,
  wonByFunnel,
  initialBreakdown,
}: DashboardShellProps) {
  const initialMonth = initialBreakdown?.month ?? currentMonthValue();
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [selectedPipelineID, setSelectedPipelineID] = useState(
    initialBreakdown?.pipeline_id ?? pipelines[0]?.id ?? "",
  );
  const [breakdown, setBreakdown] = useState<PipelineMonthlyBreakdown | null>(
    initialBreakdown,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedPipelineID) {
      return;
    }

    startTransition(async () => {
      try {
        setError(null);

        const response = await fetch(
          `/api/pipelines/${encodeURIComponent(selectedPipelineID)}/monthly-breakdown?month=${encodeURIComponent(selectedMonth)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Request failed");
        }

        const nextBreakdown =
          (await response.json()) as PipelineMonthlyBreakdown;
        setBreakdown(nextBreakdown);
      } catch {
        setError("Failed to load the selected funnel view.");
      }
    });
  }, [selectedMonth, selectedPipelineID]);

  const selectedPipeline =
    pipelines.find((item) => item.id === selectedPipelineID) ?? pipelines[0] ?? null;

  return (
    <main className="dashboard-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Client Revenue Dashboard</p>
          <h1>Won deals, month by month, without forcing the sales team through a BI maze.</h1>
          <p className="hero-text">
            Start with the last 12 fully closed months, then pivot into a single
            funnel and inspect the month by stage, owner, and product.
          </p>
        </div>
        <div className="hero-meta">
          <div className="metric-chip">
            <span>Window</span>
            <strong>
              {wonByFunnel.range_start} to {wonByFunnel.range_end}
            </strong>
          </div>
          <div className="metric-chip accent">
            <span>Active month</span>
            <strong>{formatMonthLong(selectedMonth)}</strong>
          </div>
        </div>
      </section>

      <WonByFunnelChart
        data={wonByFunnel}
        onSelectMonth={setSelectedMonth}
        selectedMonth={selectedMonth}
      />

      <section className="control-row">
        <div className="control-card">
          <label htmlFor="pipeline-select">Sales funnel</label>
          <select
            id="pipeline-select"
            value={selectedPipelineID}
            onChange={(event) => setSelectedPipelineID(event.target.value)}
          >
            {pipelines.map((pipeline) => (
              <option key={pipeline.id} value={pipeline.id}>
                {pipeline.name}
              </option>
            ))}
          </select>
        </div>

        <div className="control-card">
          <label htmlFor="month-select">Month</label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
          >
            {Array.from(new Set(wonByFunnel.items.map((item) => item.month))).map((month) => (
              <option key={month} value={month}>
                {formatMonthLong(month)}
              </option>
            ))}
            {!wonByFunnel.items.find((item) => item.month === currentMonthValue()) ? (
              <option value={currentMonthValue()}>{formatMonthLong(currentMonthValue())}</option>
            ) : null}
          </select>
        </div>
      </section>

      {error ? <p className="error-banner">{error}</p> : null}

      <section className="summary-row">
        <article className="summary-card warm">
          <span>Selected funnel</span>
          <strong>{selectedPipeline?.name ?? "No funnel selected"}</strong>
        </article>
        <article className="summary-card">
          <span>Won deals</span>
          <strong>{formatNumber(breakdown?.summary.won_deals ?? 0)}</strong>
        </article>
        <article className="summary-card">
          <span>Won revenue</span>
          <strong>{formatCurrency(breakdown?.summary.won_amount ?? 0)}</strong>
        </article>
        <article className="summary-card">
          <span>Data freshness</span>
          <strong>{breakdown?.last_synced_at ? relativeStamp(breakdown.last_synced_at) : "Unknown"}</strong>
        </article>
      </section>

      <section className="grid-panels">
        <BreakdownPanel
          title="By stage"
          subtitle="How won deals landed inside this funnel"
          loading={isPending}
          empty={!breakdown || breakdown.by_stage.length === 0}
          columns={["Stage", "Deals", "Revenue"]}
          rows={(breakdown?.by_stage ?? []).map((item) => [
            item.stage_name,
            formatNumber(item.won_deals),
            formatCurrency(item.won_amount),
          ])}
        />

        <BreakdownPanel
          title="By owner"
          subtitle="Who closed the selected funnel in the selected month"
          loading={isPending}
          empty={!breakdown || breakdown.by_owner.length === 0}
          columns={["Owner", "Deals", "Revenue"]}
          rows={(breakdown?.by_owner ?? []).map((item) => [
            item.owner_name,
            formatNumber(item.won_deals),
            formatCurrency(item.won_amount),
          ])}
        />

        <BreakdownPanel
          title="By product"
          subtitle="Product mix across the month’s won deals"
          loading={isPending}
          empty={!breakdown || breakdown.by_product.length === 0}
          columns={["Product", "Deals", "Units", "Sales"]}
          rows={(breakdown?.by_product ?? []).map((item) => [
            item.product_name,
            formatNumber(item.won_deals),
            formatNumber(item.product_quantity),
            formatCurrency(item.product_sales),
          ])}
        />
      </section>
    </main>
  );
}

type BreakdownPanelProps = {
  title: string;
  subtitle: string;
  loading: boolean;
  empty: boolean;
  columns: string[];
  rows: string[][];
};

function BreakdownPanel({
  title,
  subtitle,
  loading,
  empty,
  columns,
  rows,
}: BreakdownPanelProps) {
  return (
    <article className="breakdown-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{title}</p>
          <h2>{subtitle}</h2>
        </div>
        {loading ? <span className="loading-pill">Updating</span> : null}
      </div>

      {empty ? (
        <div className="empty-panel">
          <p>No won deals matched this funnel and month.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${index}`}>
                  {row.map((value) => (
                    <td key={`${title}-${index}-${value}`}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}

function relativeStamp(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
