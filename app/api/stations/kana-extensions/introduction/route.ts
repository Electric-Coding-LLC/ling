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
  if (!(await recordStationIntroduction(user.id, "kana-extensions"))) {
    return Response.json(
      { error: "station_unavailable" },
      { status: 403, headers: privateNoStoreHeaders() },
    );
  }

  return Response.json(
    { available: ["mora-timing"] },
    { headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
