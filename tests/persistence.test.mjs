import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("generated migrations create the user, identity, and station introduction boundaries", async () => {
  const userMigration = (await readFile(new URL("drizzle/0000_left_joystick.sql", root), "utf8"))
    .replaceAll("--> statement-breakpoint", "");
  const introductionMigration = await readFile(
    new URL("drizzle/0001_stale_mimic.sql", root),
    "utf8",
  );
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(userMigration);
  database.exec(introductionMigration);

  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map(({ name }) => name);
  assert.deepEqual(tables, ["station_introductions", "user_identities", "users"]);

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

  database.prepare("DELETE FROM users WHERE id = ?").run("learner-1");
  assert.equal(
    database.prepare("SELECT COUNT(*) AS count FROM station_introductions").get().count,
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
