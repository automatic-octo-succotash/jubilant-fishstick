export type Pipeline = {
  id: string;
  name: string;
};

export type PipelinesResponse = {
  items: Pipeline[];
};

export type WonByFunnelPoint = {
  month: string;
  month_start: string;
  pipeline_id: string;
  pipeline_name: string;
  won_deals: number;
  won_amount: string;
};

export type WonByFunnelResponse = {
  range_start: string;
  range_end: string;
  items: WonByFunnelPoint[];
};

export type BreakdownSummary = {
  won_deals: number;
  won_amount: string;
};

export type StageBreakdownItem = {
  stage_id: string;
  stage_name: string;
  won_deals: number;
  won_amount: string;
};

export type OwnerBreakdownItem = {
  owner_id: string;
  owner_name: string;
  won_deals: number;
  won_amount: string;
};

export type ProductBreakdownItem = {
  product_id: string;
  product_name: string;
  won_deals: number;
  product_quantity: string;
  product_sales: string;
};

export type OngoingGroupItem = {
  key: string;
  label: string;
  deal_count: number;
  amount: string;
};

export type OngoingPipelineSummary = {
  pipeline_id: string;
  pipeline_name: string;
  deal_count: number;
  amount: string;
  groups: OngoingGroupItem[];
};

export type OngoingBreakdownResponse = {
  group_by: string;
  items: OngoingPipelineSummary[];
};

export type PipelineMonthlyBreakdown = {
  pipeline_id: string;
  pipeline_name: string;
  month: string;
  month_start: string;
  month_end: string;
  summary: BreakdownSummary;
  by_stage: StageBreakdownItem[];
  by_owner: OwnerBreakdownItem[];
  by_product: ProductBreakdownItem[];
  last_synced_at: string | null;
};
