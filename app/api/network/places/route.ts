import {
  isNetworkPlaceId,
} from "@/src/modules/learning/network";
import {
  listCompletedNetworkPlaces,
  listVisitedNetworkPlaces,
  recordNetworkPlaceVisit,
} from "@/src/modules/learning/repository";
import { getOrCreateUser } from "@/src/modules/users/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const [visited, completed] = await Promise.all([
    listVisitedNetworkPlaces(user.id),
    listCompletedNetworkPlaces(user.id),
  ]);

  return Response.json(
    { visited: Array.from(new Set([...visited, ...completed])), completed },
    { headers: privateNoStoreHeaders() },
  );
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await readJson(request);
  if (!isVisit(body)) return invalidVisit();

  await recordNetworkPlaceVisit(user.id, body.placeId);
  return Response.json(
    { placeId: body.placeId, visited: true },
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

function isVisit(value: unknown): value is { placeId: Parameters<typeof recordNetworkPlaceVisit>[1] } {
  if (!value || typeof value !== "object") return false;
  return isNetworkPlaceId((value as { placeId?: unknown }).placeId);
}

function unauthorized() {
  return Response.json(
    { error: "unauthorized" },
    { status: 401, headers: privateNoStoreHeaders() },
  );
}

function invalidVisit() {
  return Response.json(
    { error: "invalid_network_place" },
    { status: 400, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
