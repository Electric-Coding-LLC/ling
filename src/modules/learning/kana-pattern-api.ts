import { getOrCreateUser } from "@/src/modules/users/repository";
import {
  listKnownKanaExtensionPatterns,
  setKanaExtensionPatternKnown,
  setKanaExtensionPatternsKnown,
} from "./repository";
import {
  isKanaExtensionPatternId,
  type KanaExtensionPatternId,
} from "./kana-extensions";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export async function getKanaPatternKnowledge(
  patternIds: readonly KanaExtensionPatternId[],
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const allowed = new Set(patternIds);
  const known = (await listKnownKanaExtensionPatterns(user.id))
    .filter((patternId) => allowed.has(patternId));
  return Response.json({ known }, { headers: privateNoStoreHeaders() });
}

export async function updateKanaPatternKnowledge(
  request: Request,
  patternIds: readonly KanaExtensionPatternId[],
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isKnowledgeUpdate(body) || !patternIds.includes(body.patternId)) {
    return invalidKnowledge();
  }

  await setKanaExtensionPatternKnown(user.id, body.patternId, body.known);
  return Response.json(body, { headers: privateNoStoreHeaders() });
}

export async function updateAllKanaPatternKnowledge(
  request: Request,
  patternIds: readonly KanaExtensionPatternId[],
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isBulkKnowledgeUpdate(body)) return invalidKnowledge();

  await setKanaExtensionPatternsKnown(user.id, patternIds, body.known);
  return Response.json(
    { known: body.known ? patternIds : [] },
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
): value is { patternId: KanaExtensionPatternId; known: boolean } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { patternId?: unknown; known?: unknown };
  return isKanaExtensionPatternId(candidate.patternId)
    && typeof candidate.known === "boolean";
}

function isBulkKnowledgeUpdate(value: unknown): value is { known: boolean } {
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
    { error: "invalid_kana_pattern_knowledge" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
