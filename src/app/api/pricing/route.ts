import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { getPricing } from "@/lib/queries/pricing";
import { COLL } from "@/lib/queries/collections";
import type { PricingResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const vendorParam = searchParams.get("vendor");

    const type =
      typeParam === "api" || typeParam === "consumer"
        ? (typeParam as "api" | "consumer")
        : "api";

    const pricing = await getPricing({
      type,
      vendor: vendorParam || undefined,
    });

    const latestSnap = await adminDb
      .collection(COLL.dataSnapshots)
      .orderBy("completedAt", "desc")
      .limit(30)
      .get();

    const latestDoc = latestSnap.docs.find((doc) => {
      const source = doc.data().source as string | undefined;
      return source === "updatePricing" || source === "pricing";
    });

    const latestStatus = latestDoc
      ? (latestDoc.data().status as "completed" | "partial" | "failed")
      : null;

    const response: PricingResponse = {
      status:
        latestStatus === "failed"
          ? "error"
          : latestStatus === "partial"
          ? "partial"
          : "ok",
      message:
        latestStatus === "failed"
          ? "Pricing data source failed in the latest run."
          : latestStatus === "partial"
          ? "Pricing data source completed partially in the latest run."
          : undefined,
      models: pricing.models,
    };

    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected pricing error";
    const response: PricingResponse = {
      status: "error",
      message,
      models: [],
    };
    return NextResponse.json(response, { status: 500 });
  }
}
