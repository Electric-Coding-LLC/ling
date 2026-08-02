import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("generated migrations create the account-scoped learning boundaries", async () => {
  const userMigration = (await readFile(new URL("drizzle/0000_left_joystick.sql", root), "utf8"))
    .replaceAll("--> statement-breakpoint", "");
  const introductionMigration = await readFile(
    new URL("drizzle/0001_stale_mimic.sql", root),
    "utf8",
  );
  const hiraganaKnowledgeMigration = await readFile(
    new URL("drizzle/0002_young_marvel_boy.sql", root),
    "utf8",
  );
  const katakanaKnowledgeMigration = await readFile(
    new URL("drizzle/0003_far_shatterstar.sql", root),
    "utf8",
  );
  const kanaExtensionKnowledgeMigration = await readFile(
    new URL("drizzle/0004_keen_alice.sql", root),
    "utf8",
  );
  const moraTimingKnowledgeMigration = await readFile(
    new URL("drizzle/0005_violet_namora.sql", root),
    "utf8",
  );
  const pitchAccentKnowledgeMigration = await readFile(
    new URL("drizzle/0006_secret_miek.sql", root),
    "utf8",
  );
  const romajiKnowledgeMigration = await readFile(
    new URL("drizzle/0007_nostalgic_cargill.sql", root),
    "utf8",
  );
  const vocabularyKnowledgeMigration = await readFile(
    new URL("drizzle/0008_great_the_twelve.sql", root),
    "utf8",
  );
  const directionalVocabularyKnowledgeMigration = await readFile(
    new URL("drizzle/0009_nostalgic_wallop.sql", root),
    "utf8",
  );
  const networkPlaceVisitsMigration = await readFile(
    new URL("drizzle/0010_lowly_kat_farrell.sql", root),
    "utf8",
  );
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(userMigration);
  database.exec(introductionMigration);
  database.exec(hiraganaKnowledgeMigration);
  database.exec(katakanaKnowledgeMigration);
  database.exec(kanaExtensionKnowledgeMigration);
  database.exec(moraTimingKnowledgeMigration);
  database.exec(pitchAccentKnowledgeMigration);
  database.exec(romajiKnowledgeMigration);
  database.exec(vocabularyKnowledgeMigration);
  database.prepare(
    "INSERT INTO users (id, created_at, updated_at) VALUES (?, ?, ?)",
  ).run("legacy-learner", 1, 1);
  database.prepare(
    "INSERT INTO vocabulary_knowledge (user_id, station_id, item_id, known_at) VALUES (?, ?, ?, ?)",
  ).run("legacy-learner", "words", "kore", 2);
  database.prepare(
    "INSERT INTO vocabulary_knowledge (user_id, station_id, item_id, known_at) VALUES (?, ?, ?, ?)",
  ).run("legacy-learner", "nouns", "yama", 3);
  database.prepare(
    "INSERT INTO station_introductions (user_id, station_id, introduced_at) VALUES (?, ?, ?)",
  ).run("legacy-learner", "words", 4);
  database.prepare(
    "INSERT INTO station_introductions (user_id, station_id, introduced_at) VALUES (?, ?, ?)",
  ).run("legacy-learner", "nouns", 5);
  database.exec(directionalVocabularyKnowledgeMigration);
  database.exec(networkPlaceVisitsMigration.replaceAll("--> statement-breakpoint", ""));

  const migratedVocabularyKnowledge = database.prepare(
    "SELECT review_direction FROM vocabulary_knowledge WHERE user_id = ? AND item_id = ?",
  ).get("legacy-learner", "kore");
  assert.equal(
    migratedVocabularyKnowledge.review_direction,
    "meaning-to-japanese",
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM vocabulary_knowledge").get().count,
    1,
  );
  assert.deepEqual(
    database.prepare(
      "SELECT station_id FROM station_introductions WHERE user_id = ? ORDER BY station_id",
    ).all("legacy-learner").map(({ station_id }) => station_id),
    ["words"],
  );
  assert.deepEqual(
    database.prepare(
      "SELECT place_id FROM network_place_visits WHERE user_id = ? ORDER BY place_id",
    ).all("legacy-learner").map(({ place_id }) => place_id),
    ["words"],
  );
  assert.equal(
    database.prepare("PRAGMA table_info(vocabulary_knowledge)").all()
      .some(({ name }) => name === "station_id"),
    false,
  );
  database.prepare("DELETE FROM users WHERE id = ?").run("legacy-learner");

  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map(({ name }) => name);
  assert.deepEqual(tables, [
    "hiragana_knowledge",
    "kana_extension_knowledge",
    "katakana_knowledge",
    "mora_timing_knowledge",
    "network_place_visits",
    "pitch_accent_knowledge",
    "romaji_knowledge",
    "station_introductions",
    "user_identities",
    "users",
    "vocabulary_knowledge",
  ]);

  const foreignKeys = database.prepare("PRAGMA foreign_key_list(user_identities)").all();
  assert.equal(foreignKeys.length, 1);
  assert.equal(foreignKeys[0].table, "users");
  assert.equal(foreignKeys[0].on_delete, "CASCADE");

  const introductionForeignKeys = database
    .prepare("PRAGMA foreign_key_list(station_introductions)")
    .all();
  assert.equal(introductionForeignKeys.length, 1);
  assert.equal(introductionForeignKeys[0].table, "users");
  assert.equal(introductionForeignKeys[0].on_delete, "CASCADE");

  const networkPlaceVisitForeignKeys = database
    .prepare("PRAGMA foreign_key_list(network_place_visits)")
    .all();
  assert.equal(networkPlaceVisitForeignKeys.length, 1);
  assert.equal(networkPlaceVisitForeignKeys[0].table, "users");
  assert.equal(networkPlaceVisitForeignKeys[0].on_delete, "CASCADE");

  const hiraganaKnowledgeForeignKeys = database
    .prepare("PRAGMA foreign_key_list(hiragana_knowledge)")
    .all();
  assert.equal(hiraganaKnowledgeForeignKeys.length, 1);
  assert.equal(hiraganaKnowledgeForeignKeys[0].table, "users");
  assert.equal(hiraganaKnowledgeForeignKeys[0].on_delete, "CASCADE");

  const katakanaKnowledgeForeignKeys = database
    .prepare("PRAGMA foreign_key_list(katakana_knowledge)")
    .all();
  assert.equal(katakanaKnowledgeForeignKeys.length, 1);
  assert.equal(katakanaKnowledgeForeignKeys[0].table, "users");
  assert.equal(katakanaKnowledgeForeignKeys[0].on_delete, "CASCADE");

  const kanaExtensionKnowledgeForeignKeys = database
    .prepare("PRAGMA foreign_key_list(kana_extension_knowledge)")
    .all();
  assert.equal(kanaExtensionKnowledgeForeignKeys.length, 1);
  assert.equal(kanaExtensionKnowledgeForeignKeys[0].table, "users");
  assert.equal(kanaExtensionKnowledgeForeignKeys[0].on_delete, "CASCADE");

  const moraTimingKnowledgeForeignKeys = database
    .prepare("PRAGMA foreign_key_list(mora_timing_knowledge)")
    .all();
  assert.equal(moraTimingKnowledgeForeignKeys.length, 1);
  assert.equal(moraTimingKnowledgeForeignKeys[0].table, "users");
  assert.equal(moraTimingKnowledgeForeignKeys[0].on_delete, "CASCADE");

  const pitchAccentKnowledgeForeignKeys = database
    .prepare("PRAGMA foreign_key_list(pitch_accent_knowledge)")
    .all();
  assert.equal(pitchAccentKnowledgeForeignKeys.length, 1);
  assert.equal(pitchAccentKnowledgeForeignKeys[0].table, "users");
  assert.equal(pitchAccentKnowledgeForeignKeys[0].on_delete, "CASCADE");

  const vocabularyKnowledgeForeignKeys = database
    .prepare("PRAGMA foreign_key_list(vocabulary_knowledge)")
    .all();
  assert.equal(vocabularyKnowledgeForeignKeys.length, 1);
  assert.equal(vocabularyKnowledgeForeignKeys[0].table, "users");
  assert.equal(vocabularyKnowledgeForeignKeys[0].on_delete, "CASCADE");

  const romajiKnowledgeForeignKeys = database
    .prepare("PRAGMA foreign_key_list(romaji_knowledge)")
    .all();
  assert.equal(romajiKnowledgeForeignKeys.length, 1);
  assert.equal(romajiKnowledgeForeignKeys[0].table, "users");
  assert.equal(romajiKnowledgeForeignKeys[0].on_delete, "CASCADE");

  database.prepare(
    "INSERT INTO users (id, created_at, updated_at) VALUES (?, ?, ?)",
  ).run("learner-1", 1, 1);
  database.prepare(
    "INSERT INTO station_introductions (user_id, station_id, introduced_at) VALUES (?, ?, ?)",
  ).run("learner-1", "hiragana", 2);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO station_introductions (user_id, station_id, introduced_at) VALUES (?, ?, ?)",
    ).run("learner-1", "hiragana", 3);
  }, /UNIQUE constraint failed/);

  database.prepare(
    "INSERT INTO network_place_visits (user_id, place_id, visited_at) VALUES (?, ?, ?)",
  ).run("learner-1", "hiragana", 3);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO network_place_visits (user_id, place_id, visited_at) VALUES (?, ?, ?)",
    ).run("learner-1", "hiragana", 4);
  }, /UNIQUE constraint failed/);

  database.prepare(
    "INSERT INTO pitch_accent_knowledge (user_id, item_id, known_at) VALUES (?, ?, ?)",
  ).run("learner-1", "ame-candy", 12);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO pitch_accent_knowledge (user_id, item_id, known_at) VALUES (?, ?, ?)",
    ).run("learner-1", "ame-candy", 13);
  }, /UNIQUE constraint failed/);

  database.prepare(
    "INSERT INTO vocabulary_knowledge (user_id, item_id, review_direction, known_at) VALUES (?, ?, ?, ?)",
  ).run("learner-1", "neko", "meaning-to-japanese", 16);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO vocabulary_knowledge (user_id, item_id, review_direction, known_at) VALUES (?, ?, ?, ?)",
    ).run("learner-1", "neko", "meaning-to-japanese", 17);
  }, /UNIQUE constraint failed/);
  database.prepare(
    "INSERT INTO vocabulary_knowledge (user_id, item_id, review_direction, known_at) VALUES (?, ?, ?, ?)",
  ).run("learner-1", "neko", "japanese-to-meaning", 18);

  database.prepare(
    "INSERT INTO mora_timing_knowledge (user_id, review_id, known_at) VALUES (?, ?, ?)",
  ).run("learner-1", "basic-neko", 10);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO mora_timing_knowledge (user_id, review_id, known_at) VALUES (?, ?, ?)",
    ).run("learner-1", "basic-neko", 11);
  }, /UNIQUE constraint failed/);

  database.prepare(
    "INSERT INTO kana_extension_knowledge (user_id, pattern_id, known_at) VALUES (?, ?, ?)",
  ).run("learner-1", "dakuten-k", 8);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO kana_extension_knowledge (user_id, pattern_id, known_at) VALUES (?, ?, ?)",
    ).run("learner-1", "dakuten-k", 9);
  }, /UNIQUE constraint failed/);

  database.prepare(
    "INSERT INTO katakana_knowledge (user_id, kana, known_at) VALUES (?, ?, ?)",
  ).run("learner-1", "ア", 6);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO katakana_knowledge (user_id, kana, known_at) VALUES (?, ?, ?)",
    ).run("learner-1", "ア", 7);
  }, /UNIQUE constraint failed/);

  database.prepare(
    "INSERT INTO hiragana_knowledge (user_id, kana, known_at) VALUES (?, ?, ?)",
  ).run("learner-1", "あ", 4);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO hiragana_knowledge (user_id, kana, known_at) VALUES (?, ?, ?)",
    ).run("learner-1", "あ", 5);
  }, /UNIQUE constraint failed/);

  database.prepare(
    "INSERT INTO romaji_knowledge (user_id, kana, known_at) VALUES (?, ?, ?)",
  ).run("learner-1", "あ", 14);
  assert.throws(() => {
    database.prepare(
      "INSERT INTO romaji_knowledge (user_id, kana, known_at) VALUES (?, ?, ?)",
    ).run("learner-1", "あ", 15);
  }, /UNIQUE constraint failed/);

  database.prepare("DELETE FROM users WHERE id = ?").run("learner-1");
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM station_introductions").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM network_place_visits").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM hiragana_knowledge").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM katakana_knowledge").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM kana_extension_knowledge").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM mora_timing_knowledge").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM pitch_accent_knowledge").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM vocabulary_knowledge").get().count,
    0,
  );
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM romaji_knowledge").get().count,
    0,
  );
  database.close();
});

test("Sites declares D1 and leaves object storage disabled", async () => {
  const hosting = JSON.parse(await readFile(new URL(".openai/hosting.json", root), "utf8"));
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, null);
  assert.match(hosting.project_id, /^appgprj_[a-z0-9]+$/);
});
