import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { COLL } from "@/lib/queries/collections";
import type { ArenaVoteRequest, ArenaVoteResponse } from "@/lib/types";

const VALID_VOTES = new Set(["A", "B", "both_good", "both_bad"]);

interface StoredPairModel {
  modelSlug: string;
  modelName: string;
  vendorName: string;
}

function getIpHash(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || "unknown";
  const salt = process.env.SPEED_IP_HASH_SALT || "track-default-salt";
  return createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}

async function getOptionalUser(request: Request): Promise<{ uid: string } | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return { uid: decoded.uid };
  } catch {
    return null;
  }
}

function getStoredPairModel(input: unknown): StoredPairModel | null {
  if (!input || typeof input !== "object") return null;
  const item = input as {
    modelSlug?: unknown;
    modelName?: unknown;
    vendorName?: unknown;
  };

  if (
    typeof item.modelSlug !== "string" ||
    typeof item.modelName !== "string" ||
    typeof item.vendorName !== "string"
  ) {
    return null;
  }

  return {
    modelSlug: item.modelSlug,
    modelName: item.modelName,
    vendorName: item.vendorName,
  };
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<ArenaVoteRequest>;

  const roundId = typeof body.roundId === "string" ? body.roundId.trim() : "";
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  const vote = typeof body.vote === "string" ? body.vote : "";

  if (!roundId || !sessionId || !VALID_VOTES.has(vote)) {
    return NextResponse.json(
      { status: "error", message: "Invalid vote payload." },
      { status: 400 }
    );
  }

  const roundRef = adminDb.collection(COLL.speedArenaRounds).doc(roundId);
  const roundSnapshot = await roundRef.get();

  if (!roundSnapshot.exists) {
    return NextResponse.json(
      { status: "error", message: "Round not found." },
      { status: 404 }
    );
  }

  const roundData = roundSnapshot.data() as {
    sessionId?: unknown;
    mode?: unknown;
    pair?: { A?: unknown; B?: unknown };
  };

  if (roundData.sessionId !== sessionId) {
    return NextResponse.json(
      { status: "error", message: "Session mismatch for this round." },
      { status: 400 }
    );
  }

  if (roundData.mode !== "battle" && roundData.mode !== "side_by_side") {
    return NextResponse.json(
      { status: "error", message: "Voting is only available for comparison rounds." },
      { status: 400 }
    );
  }

  const pairA = getStoredPairModel(roundData.pair?.A);
  const pairB = getStoredPairModel(roundData.pair?.B);

  if (!pairA || !pairB) {
    return NextResponse.json(
      { status: "error", message: "Round model metadata is missing." },
      { status: 500 }
    );
  }

  const runSnapshot = await adminDb
    .collection(COLL.speedArenaRuns)
    .where("roundId", "==", roundId)
    .get();

  const runBySlot = new Map<"A" | "B", { latencyMs: number | null }>();

  for (const doc of runSnapshot.docs) {
    const data = doc.data();
    const slot = data.slot;
    if (slot !== "A" && slot !== "B") continue;

    runBySlot.set(slot, {
      latencyMs: typeof data.latencyMs === "number" ? data.latencyMs : null,
    });
  }

  const reveal: ArenaVoteResponse["reveal"] = {
    A: {
      modelSlug: pairA.modelSlug,
      modelName: pairA.modelName,
      vendorName: pairA.vendorName,
      latencyMs: runBySlot.get("A")?.latencyMs ?? null,
    },
    B: {
      modelSlug: pairB.modelSlug,
      modelName: pairB.modelName,
      vendorName: pairB.vendorName,
      latencyMs: runBySlot.get("B")?.latencyMs ?? null,
    },
  };

  const user = await getOptionalUser(request);
  const ipHash = getIpHash(request);
  const createdAt = new Date().toISOString();

  const voteDocId = `${roundId}_${sessionId}`;

  await Promise.all([
    adminDb.collection(COLL.speedArenaVotes).doc(voteDocId).set(
      {
        id: voteDocId,
        roundId,
        sessionId,
        vote,
        reveal,
        ipHash,
        userId: user?.uid ?? null,
        createdAt,
      },
      { merge: true }
    ),
    roundRef.set(
      {
        vote,
        reveal,
        votedAt: createdAt,
      },
      { merge: true }
    ),
  ]);

  const response: ArenaVoteResponse = {
    status: "ok",
    reveal,
  };

  return NextResponse.json(response);
}
