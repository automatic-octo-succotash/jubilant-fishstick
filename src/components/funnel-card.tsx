import {
  OngoingPipelineSummary,
  Pipeline,
  PipelineMonthlyBreakdown,
} from "@/lib/dashboard-types";
import { formatCurrency, formatNumber } from "@/lib/format";

type FunnelCardProps = {
  pipeline: Pipeline;
  breakdown: PipelineMonthlyBreakdown | null;
  ongoing: OngoingPipelineSummary | null;
};

export function FunnelCard({ pipeline, breakdown, ongoing }: FunnelCardProps) {
  const wonDeals = breakdown?.summary.won_deals ?? 0;
  const wonAmount = breakdown?.summary.won_amount ?? "0";
  const ongoingCount = ongoing?.deal_count ?? 0;
  const groups = ongoing?.groups ?? [];

  return (
    <div className="funnel-card">
      <div className="funnel-card-header">
        <p className="funnel-card-name">{pipeline.name}</p>
      </div>
      <div className="funnel-card-body">
        <div className="won-section">
          <p className="won-label">Ganhos no mês</p>
          <div className="won-stats">
            <span className="won-count">{formatNumber(wonDeals)}</span>
            <span className="won-amount">{formatCurrency(wonAmount)}</span>
          </div>
        </div>
        <div className="ongoing-section">
          <p className="ongoing-label">
            Em andamento · {formatNumber(ongoingCount)}
          </p>
          <div className="ongoing-list">
            {groups.length === 0 ? (
              <p className="ongoing-empty">Nenhum negócio em andamento.</p>
            ) : (
              groups.map((group) => (
                <div
                  key={`${group.key}-${group.label}`}
                  className="ongoing-row"
                >
                  <span className="ongoing-row-label">{group.label}</span>
                  <span className="ongoing-row-count">
                    {formatNumber(group.deal_count)}
                  </span>
                  <span className="ongoing-row-amount">
                    {formatCurrency(group.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
