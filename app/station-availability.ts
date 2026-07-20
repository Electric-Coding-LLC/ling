import { getOrCreateUser } from "@/src/modules/users/repository";
import { listStationIntroductions } from "@/src/modules/learning/repository";
import {
  isStationAvailable,
  STATION_IDS,
  type StationId,
} from "@/src/modules/learning/stations";
import { getCurrentIdentity } from "@/src/platform/current-identity";

export async function getStationAvailabilityForCurrentUser(): Promise<
  Record<StationId, boolean>
> {
  const identity = await getCurrentIdentity();
  const introductions = identity
    ? await listStationIntroductions((await getOrCreateUser(identity)).id)
    : [];

  return Object.fromEntries(
    STATION_IDS.map((stationId) => [
      stationId,
      isStationAvailable(stationId, introductions),
    ]),
  ) as Record<StationId, boolean>;
}

export async function isStationAvailableToCurrentUser(
  stationId: StationId,
): Promise<boolean> {
  if (isStationAvailable(stationId, [])) return true;

  const identity = await getCurrentIdentity();
  if (!identity) return false;

  const user = await getOrCreateUser(identity);
  const introductions = await listStationIntroductions(user.id);
  return isStationAvailable(stationId, introductions);
}
