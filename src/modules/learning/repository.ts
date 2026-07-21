import { and, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  hiraganaKnowledge,
  kanaExtensionKnowledge,
  katakanaKnowledge,
  stationIntroductions,
} from "@/db/schema";
import {
  BASIC_HIRAGANA,
  isBasicHiragana,
  type BasicHiragana,
} from "./hiragana";
import {
  BASIC_KATAKANA,
  isBasicKatakana,
  type BasicKatakana,
} from "./katakana";
import {
  isKanaExtensionPatternId,
  KANA_EXTENSION_PATTERN_IDS,
  type KanaExtensionPatternId,
} from "./kana-extensions";
import {
  isStationAvailable,
  isStationId,
  type StationId,
} from "./stations";

const HIRAGANA_KNOWLEDGE_ROWS_PER_STATEMENT = 30;
const KATAKANA_KNOWLEDGE_ROWS_PER_STATEMENT = 30;

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
): Promise<boolean> {
  const completedStations = await listCompletedStations(userId);
  if (!isStationAvailable(stationId, completedStations)) return false;

  const db = await getDb();
  await db
    .insert(stationIntroductions)
    .values({ userId, stationId, introducedAt: new Date() })
    .onConflictDoNothing();

  return true;
}

export async function listCompletedStations(
  userId: string,
): Promise<StationId[]> {
  const introductions = await listStationIntroductions(userId);
  const [knownHiragana, knownKatakana] = await Promise.all([
    introductions.includes("hiragana") ? listKnownHiragana(userId) : [],
    introductions.includes("katakana") ? listKnownKatakana(userId) : [],
  ]);
  return introductions.filter(
    (stationId) => (
      (stationId !== "hiragana" || knownHiragana.length === BASIC_HIRAGANA.length)
      && (stationId !== "katakana" || knownKatakana.length === BASIC_KATAKANA.length)
    ),
  );
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

export async function setAllHiraganaKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(hiraganaKnowledge)
      .where(eq(hiraganaKnowledge.userId, userId));
    return;
  }

  const knownAt = new Date();
  const statements = [];

  for (
    let start = 0;
    start < BASIC_HIRAGANA.length;
    start += HIRAGANA_KNOWLEDGE_ROWS_PER_STATEMENT
  ) {
    const kana = BASIC_HIRAGANA.slice(
      start,
      start + HIRAGANA_KNOWLEDGE_ROWS_PER_STATEMENT,
    );
    statements.push(
      db
        .insert(hiraganaKnowledge)
        .values(kana.map((value) => ({ userId, kana: value, knownAt })))
        .onConflictDoUpdate({
          target: [hiraganaKnowledge.userId, hiraganaKnowledge.kana],
          set: { knownAt },
        }),
    );
  }

  const [firstStatement, ...remainingStatements] = statements;
  if (!firstStatement) return;

  await db.batch([firstStatement, ...remainingStatements]);
}

export async function listKnownKatakana(
  userId: string,
): Promise<BasicKatakana[]> {
  const db = await getDb();
  const rows = await db
    .select({ kana: katakanaKnowledge.kana })
    .from(katakanaKnowledge)
    .where(eq(katakanaKnowledge.userId, userId));

  return rows.map((row) => row.kana).filter(isBasicKatakana);
}

export async function setKatakanaKnown(
  userId: string,
  kana: BasicKatakana,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(katakanaKnowledge)
      .where(
        and(
          eq(katakanaKnowledge.userId, userId),
          eq(katakanaKnowledge.kana, kana),
        ),
      );
    return;
  }

  await db
    .insert(katakanaKnowledge)
    .values({ userId, kana, knownAt: new Date() })
    .onConflictDoUpdate({
      target: [katakanaKnowledge.userId, katakanaKnowledge.kana],
      set: { knownAt: new Date() },
    });
}

export async function setAllKatakanaKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(katakanaKnowledge)
      .where(eq(katakanaKnowledge.userId, userId));
    return;
  }

  const knownAt = new Date();
  const statements = [];

  for (
    let start = 0;
    start < BASIC_KATAKANA.length;
    start += KATAKANA_KNOWLEDGE_ROWS_PER_STATEMENT
  ) {
    const kana = BASIC_KATAKANA.slice(
      start,
      start + KATAKANA_KNOWLEDGE_ROWS_PER_STATEMENT,
    );
    statements.push(
      db
        .insert(katakanaKnowledge)
        .values(kana.map((value) => ({ userId, kana: value, knownAt })))
        .onConflictDoUpdate({
          target: [katakanaKnowledge.userId, katakanaKnowledge.kana],
          set: { knownAt },
        }),
    );
  }

  const [firstStatement, ...remainingStatements] = statements;
  if (!firstStatement) return;

  await db.batch([firstStatement, ...remainingStatements]);
}

export async function listKnownKanaExtensionPatterns(
  userId: string,
): Promise<KanaExtensionPatternId[]> {
  const db = await getDb();
  const rows = await db
    .select({ patternId: kanaExtensionKnowledge.patternId })
    .from(kanaExtensionKnowledge)
    .where(eq(kanaExtensionKnowledge.userId, userId));

  return rows.map((row) => row.patternId).filter(isKanaExtensionPatternId);
}

export async function setKanaExtensionPatternKnown(
  userId: string,
  patternId: KanaExtensionPatternId,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(kanaExtensionKnowledge)
      .where(
        and(
          eq(kanaExtensionKnowledge.userId, userId),
          eq(kanaExtensionKnowledge.patternId, patternId),
        ),
      );
    return;
  }

  await db
    .insert(kanaExtensionKnowledge)
    .values({ userId, patternId, knownAt: new Date() })
    .onConflictDoUpdate({
      target: [kanaExtensionKnowledge.userId, kanaExtensionKnowledge.patternId],
      set: { knownAt: new Date() },
    });
}

export async function setAllKanaExtensionPatternsKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(kanaExtensionKnowledge)
      .where(eq(kanaExtensionKnowledge.userId, userId));
    return;
  }

  const knownAt = new Date();
  await db
    .insert(kanaExtensionKnowledge)
    .values(
      KANA_EXTENSION_PATTERN_IDS.map((patternId) => ({
        userId,
        patternId,
        knownAt,
      })),
    )
    .onConflictDoUpdate({
      target: [kanaExtensionKnowledge.userId, kanaExtensionKnowledge.patternId],
      set: { knownAt },
    });
}
