import { NextResponse } from "next/server";

import { getWonByFunnel } from "@/lib/dashboard-api";

export async function GET() {
  try {
    const data = await getWonByFunnel();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load dashboard chart" },
      { status: 502 },
    );
  }
}
