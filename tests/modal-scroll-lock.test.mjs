import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("open modal dialogs lock background scrolling", async () => {
  const foundation = await readFile(new URL("app/styles/foundation.css", root), "utf8");

  assert.match(
    foundation,
    /html:has\(dialog\[open\]\)\s*\{[^}]*overflow:\s*hidden/s,
  );
});
