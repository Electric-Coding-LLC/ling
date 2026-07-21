import { getOrCreateUser } from "@/src/modules/users/repository";
import {
  isKanaExtensionPatternId,
  KANA_EXTENSION_PATTERN_IDS,
} from "@/src/modules/learning/kana-extensions";
import {
  listKnownKanaExtensionPatterns,
  setAllKanaExtensionPatternsKnown,
  setKanaExtensionPatternKnown,
} from "@/src/modules/learning/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return Response.json(
    { known: await listKnownKanaExtensionPatterns(user.id) },
    { headers: privateNoStoreHeaders() },
  );
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidKnowledge();
  }

  if (!isKnowledgeUpdate(body)) return invalidKnowledge();

  await setKanaExtensionPatternKnown(user.id, body.patternId, body.known);
  return Response.json(body, { headers: privateNoStoreHeaders() });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return invalidKnowledge();
  }

  if (!isBulkKnowledgeUpdate(body)) return invalidKnowledge();

  await setAllKanaExtensionPatternsKnown(user.id, body.known);
  return Response.json(
    { known: body.known ? KANA_EXTENSION_PATTERN_IDS : [] },
    { headers: privateNoStoreHeaders() },
  );
}

async function getCurrentUser() {
  const identity = await getCurrentIdentity();
  return identity ? getOrCreateUser(identity) : null;
}

function isKnowledgeUpdate(
  value: unknown,
): value is {
  patternId: Parameters<typeof setKanaExtensionPatternKnown>[1];
  known: boolean;
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { patternId?: unknown; known?: unknown };
  return isKanaExtensionPatternId(candidate.patternId)
    && typeof candidate.known === "boolean";
}

function isBulkKnowledgeUpdate(
  value: unknown,
): value is { known: boolean } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { known?: unknown };
  return typeof candidate.known === "boolean";
}

function unauthorized() {
  return Response.json(
    { error: "unauthorized" },
    { status: 401, headers: privateNoStoreHeaders() },
  );
}

function invalidKnowledge() {
  return Response.json(
    { error: "invalid_kana_extension_knowledge" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
