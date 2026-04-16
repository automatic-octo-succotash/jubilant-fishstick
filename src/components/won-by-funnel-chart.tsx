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

// Catppuccin Latte: Red, Green, Yellow, Blue, Pink, Teal
const PIPELINE_COLORS = [
  "#d20f39",
  "#40a02b",
  "#df8e1d",
  "#1e66f5",
  "#ea76cb",
  "#179299",
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
          stroke="#ccd0da"
        />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#6c6f85" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatNumber(v)}
          tick={{ fontSize: 10, fill: "#6c6f85" }}
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
            borderRadius: 0,
            border: "1px solid #ccd0da",
            backgroundColor: "#e6e9ef",
            fontSize: "12px",
            color: "#4c4f69",
          }}
        />
        {pipelineOrder.map((pipeline, index) => (
          <Bar
            key={pipeline.id}
            dataKey={pipeline.id}
            name={pipeline.name}
            stackId="won"
            fill={PIPELINE_COLORS[index % PIPELINE_COLORS.length]}
            radius={0}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
