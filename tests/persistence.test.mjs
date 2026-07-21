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
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(userMigration);
  database.exec(introductionMigration);
  database.exec(hiraganaKnowledgeMigration);
  database.exec(katakanaKnowledgeMigration);
  database.exec(kanaExtensionKnowledgeMigration);

  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map(({ name }) => name);
  assert.deepEqual(tables, [
    "hiragana_knowledge",
    "kana_extension_knowledge",
    "katakana_knowledge",
    "station_introductions",
    "user_identities",
    "users",
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

  database.prepare("DELETE FROM users WHERE id = ?").run("learner-1");
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM station_introductions").get().count,
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
  database.close();
});

test("Sites declares D1 and leaves object storage disabled", async () => {
  const hosting = JSON.parse(await readFile(new URL(".openai/hosting.json", root), "utf8"));
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, null);
  assert.match(hosting.project_id, /^appgprj_[a-z0-9]+$/);
});
