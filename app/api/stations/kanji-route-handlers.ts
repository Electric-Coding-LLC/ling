import {
  getKanjiItemIds,
  getKanjiStation,
  isKanjiReviewDirection,
  KANJI_REVIEW_DIRECTIONS,
  type KanjiReviewDirection,
  type KanjiStationId,
} from "@/src/modules/learning/kanji";
import {
  listKanjiKnowledge,
  recordStationIntroduction,
  setKanjiItemKnown,
  setKanjiItemsKnown,
} from "@/src/modules/learning/repository";
import { getOrCreateUser } from "@/src/modules/users/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export async function handleKanjiIntroduction(stationId: KanjiStationId) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  await recordStationIntroduction(user.id, stationId);
  return Response.json(
    { recorded: true },
    { headers: privateNoStoreHeaders() },
  );
}

export async function handleKanjiKnowledgeGet(stationId: KanjiStationId) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const itemIds = new Set(getKanjiItemIds(stationId));
  const known = (await listKanjiKnowledge(user.id))
    .filter((knowledge) => itemIds.has(knowledge.itemId));
  return Response.json({ known }, { headers: privateNoStoreHeaders() });
}

export async function handleKanjiKnowledgePut(
  request: Request,
  stationId: KanjiStationId,
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isKnowledgeUpdate(body, stationId)) return invalidKnowledge();

  await setKanjiItemKnown(user.id, body.itemId, body.direction, body.known);
  return Response.json(body, { headers: privateNoStoreHeaders() });
}

export async function handleKanjiKnowledgePatch(
  request: Request,
  stationId: KanjiStationId,
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isBulkKnowledgeUpdate(body)) return invalidKnowledge();

  const itemIds = getKanjiItemIds(stationId);
  await setKanjiItemsKnown(user.id, itemIds, body.known);
  return Response.json(
    {
      known: body.known
        ? itemIds.flatMap((itemId) =>
          KANJI_REVIEW_DIRECTIONS.map((direction) => ({ direction, itemId })),
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

function isKnowledgeUpdate(
  value: unknown,
  stationId: KanjiStationId,
): value is {
  direction: KanjiReviewDirection;
  itemId: string;
  known: boolean;
} {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { direction?: unknown; itemId?: unknown; known?: unknown };
  return typeof candidate.itemId === "string"
    && getKanjiStation(stationId).items.some((item) => item.id === candidate.itemId)
    && isKanjiReviewDirection(candidate.direction)
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
    { error: "invalid_kanji_knowledge" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
