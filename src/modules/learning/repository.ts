import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { hiraganaKnowledge, stationIntroductions } from "@/db/schema";
import { isBasicHiragana, type BasicHiragana } from "./hiragana";
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

export async function listKnownHiragana(
  userId: string,
): Promise<BasicHiragana[]> {
  const db = await getDb();
  const rows = await db
    .select({ kana: hiraganaKnowledge.kana })
    .from(hiraganaKnowledge)
    .where(eq(hiraganaKnowledge.userId, userId));

  return rows.map((row) => row.kana).filter(isBasicHiragana);
}

export async function setHiraganaKnown(
  userId: string,
  kana: BasicHiragana,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(hiraganaKnowledge)
      .where(
        and(
          eq(hiraganaKnowledge.userId, userId),
          eq(hiraganaKnowledge.kana, kana),
        ),
      );
    return;
  }

  await db
    .insert(hiraganaKnowledge)
    .values({ userId, kana, knownAt: new Date() })
    .onConflictDoUpdate({
      target: [hiraganaKnowledge.userId, hiraganaKnowledge.kana],
      set: { knownAt: new Date() },
    });
}
