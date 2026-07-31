import {
  getVocabularyItemIds,
  isVocabularyItemId,
  isVocabularyReviewDirection,
  VOCABULARY_REVIEW_DIRECTIONS,
  type VocabularyReviewDirection,
} from "@/src/modules/learning/vocabulary";
import {
  listWordsKnowledge,
  recordStationIntroduction,
  setAllWordsItemsKnown,
  setWordsItemKnown,
} from "@/src/modules/learning/repository";
import { getOrCreateUser } from "@/src/modules/users/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export async function handleWordsIntroduction() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await recordStationIntroduction(user.id, "words");

  return Response.json(
    { recorded: true },
    { headers: privateNoStoreHeaders() },
  );
}

export async function handleWordsKnowledgeGet() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return Response.json(
    { known: await listWordsKnowledge(user.id) },
    { headers: privateNoStoreHeaders() },
  );
}

export async function handleWordsKnowledgePut(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isKnowledgeUpdate(body)) return invalidKnowledge();

  await setWordsItemKnown(
    user.id,
    body.itemId,
    body.direction,
    body.known,
  );
  return Response.json(body, { headers: privateNoStoreHeaders() });
}

export async function handleWordsKnowledgePatch(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isBulkKnowledgeUpdate(body)) return invalidKnowledge();

  await setAllWordsItemsKnown(user.id, body.known);
  return Response.json(
    {
      known: body.known
        ? getVocabularyItemIds().flatMap((itemId) =>
          VOCABULARY_REVIEW_DIRECTIONS.map((direction) => ({
            direction,
            itemId,
          })),
        )
        : [],
    },
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

function isKnowledgeUpdate(value: unknown): value is {
  direction: VocabularyReviewDirection;
  itemId: string;
  known: boolean;
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { direction?: unknown; itemId?: unknown; known?: unknown };
  return isVocabularyItemId(candidate.itemId)
    && isVocabularyReviewDirection(candidate.direction)
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
