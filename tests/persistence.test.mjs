import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("generated migration creates the user and identity boundary", async () => {
  const migration = (await readFile(new URL("drizzle/0000_left_joystick.sql", root), "utf8"))
    .replaceAll("--> statement-breakpoint", "");
  const database = new DatabaseSync(":memory:");
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(migration);

  const tables = database
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all()
    .map(({ name }) => name);
  assert.deepEqual(tables, ["user_identities", "users"]);

  const foreignKeys = database.prepare("PRAGMA foreign_key_list(user_identities)").all();
  assert.equal(foreignKeys.length, 1);
  assert.equal(foreignKeys[0].table, "users");
  assert.equal(foreignKeys[0].on_delete, "CASCADE");
  database.close();
});

test("Sites declares D1 and leaves object storage disabled", async () => {
  const hosting = JSON.parse(await readFile(new URL(".openai/hosting.json", root), "utf8"));
  assert.equal(hosting.d1, "DB");
  assert.equal(hosting.r2, null);
  assert.match(hosting.project_id, /^appgprj_[a-z0-9]+$/);
});
