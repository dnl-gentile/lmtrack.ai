import { NextRequest, NextResponse } from "next/server";
import { getModels } from "@/lib/queries/models";
import type { Modality } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendor = searchParams.get("vendor") ?? undefined;
    const modality = (searchParams.get("modality") as Modality | null) ?? undefined;
    const activeParam = searchParams.get("active");
    const active =
      activeParam === null || activeParam === ""
        ? undefined
        : activeParam === "true";
    const search = searchParams.get("search") ?? undefined;

    const filters =
      vendor != null ||
      modality != null ||
      active !== undefined ||
      (search != null && search !== "")
        ? { vendor, modality, active, search }
        : undefined;

    const models = await getModels(filters);
    return NextResponse.json(models);
  } catch (error) {
    console.error("GET /api/models error:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
