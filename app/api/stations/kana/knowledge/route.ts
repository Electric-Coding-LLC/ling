import { getOrCreateUser } from "@/src/modules/users/repository";
import {
  setAllVowelsKnown,
} from "@/src/modules/learning/repository";
import { VOWEL_KANA } from "@/src/modules/learning/vowels";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const body = await readJson(request);
  if (!isBulkKnowledgeUpdate(body)) return invalidKnowledge();

  const user = await getOrCreateUser(identity);
  await setAllVowelsKnown(user.id, body.known);
  return Response.json(
    { known: body.known ? VOWEL_KANA : [] },
    { headers: privateNoStoreHeaders() },
  );
}

async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
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
    { error: "invalid_vowel_knowledge" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
