import { getOrCreateUser } from "@/src/modules/users/repository";
import { recordStationIntroduction } from "@/src/modules/learning/repository";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export const dynamic = "force-dynamic";

export async function POST() {
  const identity = await getCurrentIdentity();
  if (!identity) return unauthorized();

  const user = await getOrCreateUser(identity);
  if (!(await recordStationIntroduction(user.id, "sound-marks"))) {
    return Response.json(
      { error: "station_unavailable" },
      { status: 403, headers: privateNoStoreHeaders() },
    );
  }

  return Response.json(
    { available: [] },
    { headers: privateNoStoreHeaders() },
  );
}

function unauthorized() {
  return Response.json(
    { error: "unauthorized" },
    { status: 401, headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
