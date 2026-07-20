import { getOrCreateUser } from "@/src/modules/users/repository";
import { isBasicHiragana } from "@/src/modules/learning/hiragana";
import {
  listKnownHiragana,
  setHiraganaKnown,
} from "@/src/modules/learning/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  return Response.json(
    { known: await listKnownHiragana(user.id) },
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

  await setHiraganaKnown(user.id, body.kana, body.known);
  return Response.json(body, { headers: privateNoStoreHeaders() });
}

async function getCurrentUser() {
  const identity = await getCurrentIdentity();
  return identity ? getOrCreateUser(identity) : null;
}

function isKnowledgeUpdate(
  value: unknown,
): value is { kana: Parameters<typeof setHiraganaKnown>[1]; known: boolean } {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { kana?: unknown; known?: unknown };
  return isBasicHiragana(candidate.kana) && typeof candidate.known === "boolean";
}

function unauthorized() {
  return Response.json(
    { error: "unauthorized" },
    { status: 401, headers: privateNoStoreHeaders() },
  );
}

function invalidKnowledge() {
  return Response.json(
    { error: "invalid_hiragana_knowledge" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
