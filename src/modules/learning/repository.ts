import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { stationIntroductions } from "@/db/schema";
import { isStationId, type StationId } from "./stations";

export async function listStationIntroductions(
  userId: string,
): Promise<StationId[]> {
  const db = await getDb();
  const rows = await db
    .select({ stationId: stationIntroductions.stationId })
    .from(stationIntroductions)
    .where(eq(stationIntroductions.userId, userId));

  return rows
    .map((row) => row.stationId)
    .filter(isStationId);
}

export async function recordStationIntroduction(
  userId: string,
  stationId: StationId,
): Promise<void> {
  const db = await getDb();
  await db
    .insert(stationIntroductions)
    .values({ userId, stationId, introducedAt: new Date() })
    .onConflictDoNothing();
}
