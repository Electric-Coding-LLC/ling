import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  hiraganaKnowledge,
  kanaExtensionKnowledge,
  katakanaKnowledge,
  moraTimingKnowledge,
  networkPlaceVisits,
  pitchAccentKnowledge,
  romajiKnowledge,
  stationIntroductions,
  vocabularyKnowledge,
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
  COMBINED_SOUND_PATTERN_IDS,
  isKanaExtensionPatternId,
  KANA_EXTENSION_PATTERN_IDS,
  SOUND_MARK_PATTERN_IDS,
  type KanaExtensionPatternId,
} from "./kana-extensions";
import {
  type CompletableNetworkPlaceId,
  isNetworkPlaceId,
  type NetworkPlaceId,
} from "./network";
import {
  isStationId,
  type StationId,
} from "./stations";
import {
  isMoraTimingReviewId,
  MORA_TIMING_REVIEW_IDS,
  type MoraTimingReviewId,
} from "./mora-timing";
import {
  isPitchAccentItemId,
  PITCH_ACCENT_ITEM_IDS,
  type PitchAccentItemId,
} from "./pitch-accent";
import {
  getVocabularyItemIds,
  isVocabularyItemId,
  isVocabularyReviewDirection,
  VOCABULARY_REVIEW_DIRECTIONS,
  type VocabularyKnowledge,
  type VocabularyReviewDirection,
} from "./vocabulary";
import {
  isRomajiKana,
  ROMAJI_KANA,
  type RomajiKana,
} from "../romaji";
import {
  VOWEL_HIRAGANA,
  VOWEL_KATAKANA,
} from "./vowels";

const HIRAGANA_KNOWLEDGE_ROWS_PER_STATEMENT = 30;
const KANA_EXTENSION_KNOWLEDGE_ROWS_PER_STATEMENT = 30;
const KATAKANA_KNOWLEDGE_ROWS_PER_STATEMENT = 30;
const ROMAJI_KNOWLEDGE_ROWS_PER_STATEMENT = 30;

export async function listStationIntroductions(
  userId: string,
): Promise<StationId[]> {
  const db = await getDb();
  const rows = await db
    .select({ stationId: stationIntroductions.stationId })
    .from(stationIntroductions)
    .where(eq(stationIntroductions.userId, userId));

  return Array.from(new Set(
    rows
      .map((row) => row.stationId === "kana" ? "vowels" : row.stationId)
      .filter(isStationId),
  ));
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

export async function listVisitedNetworkPlaces(
  userId: string,
): Promise<NetworkPlaceId[]> {
  const db = await getDb();
  const rows = await db
    .select({ placeId: networkPlaceVisits.placeId })
    .from(networkPlaceVisits)
    .where(eq(networkPlaceVisits.userId, userId));

  return rows.map((row) => row.placeId).filter(isNetworkPlaceId);
}

export async function recordNetworkPlaceVisit(
  userId: string,
  placeId: NetworkPlaceId,
): Promise<void> {
  const db = await getDb();
  await db
    .insert(networkPlaceVisits)
    .values({ userId, placeId, visitedAt: new Date() })
    .onConflictDoNothing();
}

export async function listCompletedNetworkPlaces(
  userId: string,
): Promise<CompletableNetworkPlaceId[]> {
  const [
    knownHiragana,
    knownKatakana,
    knownKanaExtensionPatterns,
    knownMoraTimingReviews,
    knownPitchAccentItems,
    knownRomaji,
    knownWords,
  ] = await Promise.all([
    listKnownHiragana(userId),
    listKnownKatakana(userId),
    listKnownKanaExtensionPatterns(userId),
    listKnownMoraTimingReviews(userId),
    listKnownPitchAccentItems(userId),
    listKnownRomajiKana(userId),
    listWordsKnowledge(userId),
  ]);
  const completed: CompletableNetworkPlaceId[] = [];

  if (ROMAJI_KANA.every((kana) => knownRomaji.includes(kana))) {
    completed.push("romaji");
  }
  if (
    VOWEL_HIRAGANA.every((kana) => knownHiragana.includes(kana))
    && VOWEL_KATAKANA.every((kana) => knownKatakana.includes(kana))
  ) {
    completed.push("vowels");
  }
  if (MORA_TIMING_REVIEW_IDS.every((reviewId) => knownMoraTimingReviews.includes(reviewId))) {
    completed.push("mora");
  }
  if (PITCH_ACCENT_ITEM_IDS.every((itemId) => knownPitchAccentItems.includes(itemId))) {
    completed.push("pitch");
  }
  if (BASIC_HIRAGANA.every((kana) => knownHiragana.includes(kana))) {
    completed.push("hiragana");
  }
  if (BASIC_KATAKANA.every((kana) => knownKatakana.includes(kana))) {
    completed.push("katakana");
  }
  if (SOUND_MARK_PATTERN_IDS.every((patternId) => knownKanaExtensionPatterns.includes(patternId))) {
    completed.push("marks");
  }
  if (COMBINED_SOUND_PATTERN_IDS.every((patternId) => knownKanaExtensionPatterns.includes(patternId))) {
    completed.push("combined");
  }
  if (
    VOCABULARY_REVIEW_DIRECTIONS.every((direction) =>
      getVocabularyItemIds().every((itemId) =>
        knownWords.some((knowledge) => (
          knowledge.itemId === itemId && knowledge.direction === direction
        )),
      ),
    )
  ) {
    completed.push("words");
  }

  return completed;
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

export async function listKnownRomajiKana(
  userId: string,
): Promise<RomajiKana[]> {
  const db = await getDb();
  const rows = await db
    .select({ kana: romajiKnowledge.kana })
    .from(romajiKnowledge)
    .where(eq(romajiKnowledge.userId, userId));

  return rows.map((row) => row.kana).filter(isRomajiKana);
}

export async function setRomajiKanaKnown(
  userId: string,
  kana: RomajiKana,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(romajiKnowledge)
      .where(
        and(
          eq(romajiKnowledge.userId, userId),
          eq(romajiKnowledge.kana, kana),
        ),
      );
    return;
  }

  await db
    .insert(romajiKnowledge)
    .values({ userId, kana, knownAt: new Date() })
    .onConflictDoUpdate({
      target: [romajiKnowledge.userId, romajiKnowledge.kana],
      set: { knownAt: new Date() },
    });
}

export async function setAllRomajiKanaKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(romajiKnowledge)
      .where(eq(romajiKnowledge.userId, userId));
    return;
  }

  const knownAt = new Date();
  const statements = [];

  for (
    let start = 0;
    start < ROMAJI_KANA.length;
    start += ROMAJI_KNOWLEDGE_ROWS_PER_STATEMENT
  ) {
    const kana = ROMAJI_KANA.slice(
      start,
      start + ROMAJI_KNOWLEDGE_ROWS_PER_STATEMENT,
    );
    statements.push(
      db
        .insert(romajiKnowledge)
        .values(kana.map((value) => ({ userId, kana: value, knownAt })))
        .onConflictDoUpdate({
          target: [romajiKnowledge.userId, romajiKnowledge.kana],
          set: { knownAt },
        }),
    );
  }

  const [firstStatement, ...remainingStatements] = statements;
  if (!firstStatement) return;

  await db.batch([firstStatement, ...remainingStatements]);
}

export async function setAllVowelsKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db.batch([
      db
        .delete(hiraganaKnowledge)
        .where(and(
          eq(hiraganaKnowledge.userId, userId),
          inArray(hiraganaKnowledge.kana, VOWEL_HIRAGANA),
        )),
      db
        .delete(katakanaKnowledge)
        .where(and(
          eq(katakanaKnowledge.userId, userId),
          inArray(katakanaKnowledge.kana, VOWEL_KATAKANA),
        )),
    ]);
    return;
  }

  const knownAt = new Date();
  await db.batch([
    db
      .insert(hiraganaKnowledge)
      .values(VOWEL_HIRAGANA.map((kana) => ({ userId, kana, knownAt })))
      .onConflictDoUpdate({
        target: [hiraganaKnowledge.userId, hiraganaKnowledge.kana],
        set: { knownAt },
      }),
    db
      .insert(katakanaKnowledge)
      .values(VOWEL_KATAKANA.map((kana) => ({ userId, kana, knownAt })))
      .onConflictDoUpdate({
        target: [katakanaKnowledge.userId, katakanaKnowledge.kana],
        set: { knownAt },
      }),
  ]);
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
  return setKanaExtensionPatternsKnown(userId, KANA_EXTENSION_PATTERN_IDS, known);
}

export async function setKanaExtensionPatternsKnown(
  userId: string,
  patternIds: readonly KanaExtensionPatternId[],
  known: boolean,
): Promise<void> {
  if (patternIds.length === 0) return;

  const db = await getDb();

  if (!known) {
    await db
      .delete(kanaExtensionKnowledge)
      .where(and(
        eq(kanaExtensionKnowledge.userId, userId),
        inArray(kanaExtensionKnowledge.patternId, patternIds),
      ));
    return;
  }

  const knownAt = new Date();
  const statements = [];

  for (
    let start = 0;
    start < patternIds.length;
    start += KANA_EXTENSION_KNOWLEDGE_ROWS_PER_STATEMENT
  ) {
    const patterns = patternIds.slice(
      start,
      start + KANA_EXTENSION_KNOWLEDGE_ROWS_PER_STATEMENT,
    );
    statements.push(
      db
        .insert(kanaExtensionKnowledge)
        .values(patterns.map((patternId) => ({ userId, patternId, knownAt })))
        .onConflictDoUpdate({
          target: [kanaExtensionKnowledge.userId, kanaExtensionKnowledge.patternId],
          set: { knownAt },
        }),
    );
  }

  const [firstStatement, ...remainingStatements] = statements;
  if (!firstStatement) return;

  await db.batch([firstStatement, ...remainingStatements]);
}

export async function listKnownMoraTimingReviews(
  userId: string,
): Promise<MoraTimingReviewId[]> {
  const db = await getDb();
  const rows = await db
    .select({ reviewId: moraTimingKnowledge.reviewId })
    .from(moraTimingKnowledge)
    .where(eq(moraTimingKnowledge.userId, userId));

  return rows.map((row) => row.reviewId).filter(isMoraTimingReviewId);
}

export async function setMoraTimingReviewKnown(
  userId: string,
  reviewId: MoraTimingReviewId,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(moraTimingKnowledge)
      .where(
        and(
          eq(moraTimingKnowledge.userId, userId),
          eq(moraTimingKnowledge.reviewId, reviewId),
        ),
      );
    return;
  }

  await db
    .insert(moraTimingKnowledge)
    .values({ userId, reviewId, knownAt: new Date() })
    .onConflictDoUpdate({
      target: [moraTimingKnowledge.userId, moraTimingKnowledge.reviewId],
      set: { knownAt: new Date() },
    });
}

export async function setAllMoraTimingReviewsKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(moraTimingKnowledge)
      .where(eq(moraTimingKnowledge.userId, userId));
    return;
  }

  const knownAt = new Date();
  await db
    .insert(moraTimingKnowledge)
    .values(MORA_TIMING_REVIEW_IDS.map((reviewId) => ({
      userId,
      reviewId,
      knownAt,
    })))
    .onConflictDoUpdate({
      target: [moraTimingKnowledge.userId, moraTimingKnowledge.reviewId],
      set: { knownAt },
    });
}

export async function listKnownPitchAccentItems(
  userId: string,
): Promise<PitchAccentItemId[]> {
  const db = await getDb();
  const rows = await db
    .select({ itemId: pitchAccentKnowledge.itemId })
    .from(pitchAccentKnowledge)
    .where(eq(pitchAccentKnowledge.userId, userId));

  return rows.map((row) => row.itemId).filter(isPitchAccentItemId);
}

export async function setPitchAccentItemKnown(
  userId: string,
  itemId: PitchAccentItemId,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(pitchAccentKnowledge)
      .where(
        and(
          eq(pitchAccentKnowledge.userId, userId),
          eq(pitchAccentKnowledge.itemId, itemId),
        ),
      );
    return;
  }

  await db
    .insert(pitchAccentKnowledge)
    .values({ userId, itemId, knownAt: new Date() })
    .onConflictDoUpdate({
      target: [pitchAccentKnowledge.userId, pitchAccentKnowledge.itemId],
      set: { knownAt: new Date() },
    });
}

export async function setAllPitchAccentItemsKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(pitchAccentKnowledge)
      .where(eq(pitchAccentKnowledge.userId, userId));
    return;
  }

  const knownAt = new Date();
  await db
    .insert(pitchAccentKnowledge)
    .values(PITCH_ACCENT_ITEM_IDS.map((itemId) => ({
      userId,
      itemId,
      knownAt,
    })))
    .onConflictDoUpdate({
      target: [pitchAccentKnowledge.userId, pitchAccentKnowledge.itemId],
      set: { knownAt },
    });
}

export async function listWordsKnowledge(
  userId: string,
): Promise<VocabularyKnowledge[]> {
  const db = await getDb();
  const rows = await db
    .select({
      direction: vocabularyKnowledge.reviewDirection,
      itemId: vocabularyKnowledge.itemId,
    })
    .from(vocabularyKnowledge)
    .where(eq(vocabularyKnowledge.userId, userId));

  return rows
    .filter((row): row is VocabularyKnowledge => (
      isVocabularyItemId(row.itemId)
      && isVocabularyReviewDirection(row.direction)
    ));
}

export async function setWordsItemKnown(
  userId: string,
  itemId: string,
  direction: VocabularyReviewDirection,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(vocabularyKnowledge)
      .where(
        and(
          eq(vocabularyKnowledge.userId, userId),
          eq(vocabularyKnowledge.itemId, itemId),
          eq(vocabularyKnowledge.reviewDirection, direction),
        ),
      );
    return;
  }

  await db
    .insert(vocabularyKnowledge)
    .values({
      userId,
      itemId,
      reviewDirection: direction,
      knownAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        vocabularyKnowledge.userId,
        vocabularyKnowledge.itemId,
        vocabularyKnowledge.reviewDirection,
      ],
      set: { knownAt: new Date() },
    });
}

export async function setAllWordsItemsKnown(
  userId: string,
  known: boolean,
): Promise<void> {
  const db = await getDb();

  if (!known) {
    await db
      .delete(vocabularyKnowledge)
      .where(eq(vocabularyKnowledge.userId, userId));
    return;
  }

  const knownAt = new Date();
  await db
    .insert(vocabularyKnowledge)
    .values(getVocabularyItemIds().flatMap((itemId) =>
      VOCABULARY_REVIEW_DIRECTIONS.map((reviewDirection) => ({
        userId,
        itemId,
        reviewDirection,
        knownAt,
      })),
    ))
    .onConflictDoUpdate({
      target: [
        vocabularyKnowledge.userId,
        vocabularyKnowledge.itemId,
        vocabularyKnowledge.reviewDirection,
      ],
      set: { knownAt },
    });
}
