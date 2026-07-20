import { getStationAvailabilityForCurrentUser } from "@/app/station-availability";
import { STATION_IDS } from "@/src/modules/learning/stations";

export const dynamic = "force-dynamic";

export async function GET() {
  const availability = await getStationAvailabilityForCurrentUser();
  if (!availability) {
    return Response.json(
      { error: "unauthorized" },
      { status: 401, headers: privateNoStoreHeaders() },
    );
  }

  return Response.json(
    {
      available: STATION_IDS.filter((stationId) => availability[stationId]),
    },
    { headers: privateNoStoreHeaders() },
  );
}

function privateNoStoreHeaders(): HeadersInit {
  return { "Cache-Control": "private, no-store" };
}
