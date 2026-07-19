import { getOrCreateUser } from "@/src/modules/users/repository";
import { recordStationIntroduction } from "@/src/modules/learning/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function POST() {
  const identity = await getCurrentIdentity();
  if (!identity) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: privateNoStoreHeaders() },
    );
  }

  const user = await getOrCreateUser(identity);
  await recordStationIntroduction(user.id, "katakana");

  return Response.json(
    { available: [] },
    { headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
