import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { COLL } from "@/lib/queries/collections";
import type { SpeedRecordsResponse, SpeedTestKey } from "@/lib/types";

const VALID_TESTS: SpeedTestKey[] = ["overall", "short", "medium", "long"];

export async function GET(request: NextRequest) {
  try {
    const testParam = request.nextUrl.searchParams.get("test");
    const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "500");
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(1000, limitParam)) : 500;

    let query = adminDb.collection(COLL.speedRecords) as FirebaseFirestore.Query;
    if (testParam && VALID_TESTS.includes(testParam as SpeedTestKey)) {
      query = query.where("testKey", "==", testParam);
    }

    const snapshot = await query.get();
    const records = snapshot.docs
      .map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          modelId: String(d.modelId ?? ""),
          modelSlug: String(d.modelSlug ?? ""),
          modelName: String(d.modelName ?? d.modelSlug ?? ""),
          vendorSlug: String(d.vendorSlug ?? ""),
          vendorName: String(d.vendorName ?? d.vendorSlug ?? ""),
          bestMedianLatencyMs:
            typeof d.bestMedianLatencyMs === "number" ? d.bestMedianLatencyMs : 0,
          testKey: d.testKey as SpeedTestKey,
          updatedAt: String(d.updatedAt ?? ""),
        };
      })
      .filter((item) => item.bestMedianLatencyMs > 0 && VALID_TESTS.includes(item.testKey))
      .sort((a, b) => a.bestMedianLatencyMs - b.bestMedianLatencyMs)
      .slice(0, limit);

    const response: SpeedRecordsResponse = {
      status: "ok",
      records,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("GET /api/speed-tests/records error:", error);
    const response: SpeedRecordsResponse = {
      status: "error",
      message: "Failed to load speed records.",
      records: [],
    };
    return NextResponse.json(response, { status: 500 });
  }
}
