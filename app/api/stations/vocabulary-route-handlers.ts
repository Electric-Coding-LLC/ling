import {
  getVocabularyItemIds,
  isVocabularyItemId,
  type VocabularyStationId,
} from "@/src/modules/learning/vocabulary";
import {
  listKnownVocabularyItems,
  recordStationIntroduction,
  setAllVocabularyItemsKnown,
  setVocabularyItemKnown,
} from "@/src/modules/learning/repository";
import { getOrCreateUser } from "@/src/modules/users/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export async function handleVocabularyIntroduction(
  stationId: VocabularyStationId,
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await recordStationIntroduction(user.id, stationId);

  return Response.json(
    { recorded: true },
    { headers: privateNoStoreHeaders() },
  );
}

export async function handleVocabularyKnowledgeGet(
  stationId: VocabularyStationId,
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return Response.json(
    { known: await listKnownVocabularyItems(user.id, stationId) },
    { headers: privateNoStoreHeaders() },
  );
}

export async function handleVocabularyKnowledgePut(
  stationId: VocabularyStationId,
  request: Request,
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isKnowledgeUpdate(stationId, body)) return invalidKnowledge();

  await setVocabularyItemKnown(user.id, stationId, body.itemId, body.known);
  return Response.json(body, { headers: privateNoStoreHeaders() });
}

export async function handleVocabularyKnowledgePatch(
  stationId: VocabularyStationId,
  request: Request,
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isBulkKnowledgeUpdate(body)) return invalidKnowledge();

  await setAllVocabularyItemsKnown(user.id, stationId, body.known);
  return Response.json(
    { known: body.known ? getVocabularyItemIds(stationId) : [] },
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
  stationId: VocabularyStationId,
  value: unknown,
): value is { itemId: string; known: boolean } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { itemId?: unknown; known?: unknown };
  return isVocabularyItemId(stationId, candidate.itemId)
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
    { error: "invalid_vocabulary_knowledge" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
