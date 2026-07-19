import { getOrCreateUser } from "@/src/modules/users/repository";
import { listStationIntroductions } from "@/src/modules/learning/repository";
import {
  isStationAvailable,
  type StationId,
} from "@/src/modules/learning/stations";
import { getCurrentIdentity } from "@/src/platform/current-identity";

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
