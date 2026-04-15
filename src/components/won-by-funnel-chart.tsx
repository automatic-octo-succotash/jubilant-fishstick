"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { WonByFunnelResponse } from "@/lib/dashboard-types";
import { formatCurrency, formatMonthLabel, formatNumber } from "@/lib/format";

type WonByFunnelChartProps = {
  data: WonByFunnelResponse;
  onSelectMonth: (month: string) => void;
  selectedMonth: string;
};

type ChartRow = {
  month: string;
  label: string;
  total: number;
  [pipelineKey: string]: string | number;
};

const PIPELINE_COLORS = [
  "#1f6feb",
  "#fa8c16",
  "#1a7f37",
  "#e85aad",
  "#c2410c",
  "#0f766e",
  "#7c3aed",
  "#b91c1c",
];

export function WonByFunnelChart({
  data,
  onSelectMonth,
  selectedMonth,
}: WonByFunnelChartProps) {
  const pipelineOrder = Array.from(
    new Map(data.items.map((item) => [item.pipeline_id, item.pipeline_name])),
  ).map(([id, name]) => ({ id, name }));

  const rows = data.items.reduce<Map<string, ChartRow>>((acc, item) => {
    const current = acc.get(item.month) ?? {
      month: item.month,
      label: formatMonthLabel(item.month),
      total: 0,
    };

    const numericAmount = Number(item.won_amount);
    current[item.pipeline_id] = numericAmount;
    current.total += Number.isFinite(numericAmount) ? numericAmount : 0;
    acc.set(item.month, current);

    return acc;
  }, new Map());

  const chartData = Array.from(rows.values());

  return (
    <div className="chart-shell">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Won Revenue by Month</p>
          <h2>Last 12 closed months by sales funnel</h2>
        </div>
        <p className="section-note">
          Select a month from the chart to update the funnel drill-down panels.
        </p>
      </div>

      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={chartData} barCategoryGap={16}>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d4d9d1" />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              formatter={(value, name) => [
                formatCurrency(typeof value === "number" ? value : Number(value ?? 0)),
                String(name),
              ]}
              labelFormatter={(label) => `Month: ${label}`}
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #d9d7cd",
                backgroundColor: "#fffdf6",
              }}
            />
            {pipelineOrder.map((pipeline, index) => (
              <Bar
                key={pipeline.id}
                dataKey={pipeline.id}
                name={pipeline.name}
                stackId="won"
                fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]}
                radius={index === pipelineOrder.length - 1 ? [6, 6, 0, 0] : 0}
                onClick={(state) => {
                  if (state?.payload?.month) {
                    onSelectMonth(String(state.payload.month));
                  }
                }}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="month-pills" role="tablist" aria-label="Months">
        {chartData.map((row) => {
          const isActive = row.month === selectedMonth;

          return (
            <button
              key={row.month}
              className={isActive ? "month-pill active" : "month-pill"}
              onClick={() => onSelectMonth(row.month)}
              type="button"
            >
              <span>{row.label}</span>
              <strong>{formatCurrency(row.total)}</strong>
            </button>
          );
        })}
      </div>
    </div>
  );
}
