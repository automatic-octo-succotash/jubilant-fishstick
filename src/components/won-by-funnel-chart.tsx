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
};

type ChartRow = {
  month: string;
  label: string;
  total: number;
  [pipelineKey: string]: string | number;
};

const PIPELINE_COLORS = [
  "#E8611A",
  "#2E6BA8",
  "#3A7D44",
  "#9B4DCA",
  "#C44F0E",
  "#0F7B72",
  "#B5860D",
  "#1C1E20",
];

export function WonByFunnelChart({ data }: WonByFunnelChartProps) {
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
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        barCategoryGap={10}
        margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          strokeDasharray="4 4"
          vertical={false}
          stroke="rgba(31,40,26,0.1)"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatNumber(v)}
          tick={{ fontSize: 10 }}
          width={64}
        />
        <Tooltip
          formatter={(value, name) => [
            formatCurrency(
              typeof value === "number" ? value : Number(value ?? 0),
            ),
            String(name),
          ]}
          labelFormatter={(label) => `Mês: ${label}`}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(31,40,26,0.12)",
            backgroundColor: "#fffdf6",
            fontSize: "12px",
          }}
        />
        {pipelineOrder.map((pipeline, index) => (
          <Bar
            key={pipeline.id}
            dataKey={pipeline.id}
            name={pipeline.name}
            stackId="won"
            fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]}
            radius={index === pipelineOrder.length - 1 ? [4, 4, 0, 0] : 0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
