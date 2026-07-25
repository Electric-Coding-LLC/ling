import { getOrCreateUser } from "@/src/modules/users/repository";
import {
  isMoraTimingReviewId,
  MORA_TIMING_REVIEW_IDS,
} from "@/src/modules/learning/mora-timing";
import {
  listKnownMoraTimingReviews,
  setAllMoraTimingReviewsKnown,
  setMoraTimingReviewKnown,
} from "@/src/modules/learning/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return Response.json(
    { known: await listKnownMoraTimingReviews(user.id) },
    { headers: privateNoStoreHeaders() },
  );
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isKnowledgeUpdate(body)) return invalidKnowledge();

  await setMoraTimingReviewKnown(user.id, body.reviewId, body.known);
  return Response.json(body, { headers: privateNoStoreHeaders() });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isBulkKnowledgeUpdate(body)) return invalidKnowledge();

  await setAllMoraTimingReviewsKnown(user.id, body.known);
  return Response.json(
    { known: body.known ? MORA_TIMING_REVIEW_IDS : [] },
    { headers: privateNoStoreHeaders() },
  );
}

async function getCurrentUser() {
  const identity = await getCurrentIdentity();
  return identity ? getOrCreateUser(identity) : null;
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isKnowledgeUpdate(
  value: unknown,
): value is {
  reviewId: Parameters<typeof setMoraTimingReviewKnown>[1];
  known: boolean;
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { reviewId?: unknown; known?: unknown };
  return isMoraTimingReviewId(candidate.reviewId)
    && typeof candidate.known === "boolean";
}

function isBulkKnowledgeUpdate(
  value: unknown,
): value is { known: boolean } {
  if (!value || typeof value !== "object") return false;
  return typeof (value as { known?: unknown }).known === "boolean";
}

function unauthorized() {
  return Response.json(
    { error: "unauthorized" },
    { status: 401, headers: privateNoStoreHeaders() },
  );
}

function invalidKnowledge() {
  return Response.json(
    { error: "invalid_mora_timing_knowledge" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
