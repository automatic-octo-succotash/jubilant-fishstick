import { NextResponse } from "next/server";

import { getPipelines } from "@/lib/dashboard-api";

export async function GET() {
  try {
    const data = await getPipelines();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load pipelines" },
      { status: 502 },
    );
  }
}
