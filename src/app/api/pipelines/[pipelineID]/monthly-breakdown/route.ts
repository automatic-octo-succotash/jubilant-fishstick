import { NextRequest, NextResponse } from "next/server";

import { getPipelineMonthlyBreakdown } from "@/lib/dashboard-api";

type RouteContext = {
  params: Promise<{
    pipelineID: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { pipelineID } = await context.params;
  const month = request.nextUrl.searchParams.get("month") || undefined;

  try {
    const data = await getPipelineMonthlyBreakdown(pipelineID, month);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load pipeline breakdown" },
      { status: 502 },
    );
  }
}
