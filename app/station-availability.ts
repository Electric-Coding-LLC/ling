import { getOrCreateUser } from "@/src/modules/users/repository";
import { listCompletedStations } from "@/src/modules/learning/repository";
import {
  isStationAvailable,
  STATION_IDS,
  type StationId,
} from "@/src/modules/learning/stations";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export async function getStationAvailabilityForCurrentUser(): Promise<
  Record<StationId, boolean> | null
> {
  const identity = await getCurrentIdentity();
  if (!identity) return null;

  const completedStations = await listCompletedStations(
    (await getOrCreateUser(identity)).id,
  );

  return Object.fromEntries(
    STATION_IDS.map((stationId) => [
      stationId,
      isStationAvailable(stationId, completedStations),
    ]),
  ) as Record<StationId, boolean>;
}

export async function isStationAvailableToCurrentUser(
  stationId: StationId,
): Promise<boolean> {
  if (isStationAvailable(stationId, [])) return true;

  const availability = await getStationAvailabilityForCurrentUser();
  return availability?.[stationId] ?? false;
}
