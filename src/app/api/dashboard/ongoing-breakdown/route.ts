import { type NextRequest, NextResponse } from "next/server";

import { getOngoingBreakdown } from "@/lib/dashboard-api";

export async function GET(request: NextRequest) {
  const groupBy = request.nextUrl.searchParams.get("group_by") ?? "stage";

  try {
    const data = await getOngoingBreakdown(groupBy);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load ongoing breakdown" },
      { status: 502 },
    );
  }
}
