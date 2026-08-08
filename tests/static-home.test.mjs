import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("the build packages the branded home page as an edge asset", async () => {
  const [prerenderedHome, staticHome] = await Promise.all([
    readFile(
      new URL("dist/server/prerendered-routes/index.html", root),
      "utf8",
    ),
    readFile(new URL("dist/client/index.html", root), "utf8"),
  ]);

  assert.equal(staticHome, prerenderedHome);
  assert.match(staticHome, /<title>Ling<\/title>/i);
  assert.match(
    staticHome,
    /class="loading-shell loading-shell-overlay loading-shell-boot"/i,
  );
  assert.match(staticHome, /aria-label="Foundations learning network"/i);
  assert.doesNotMatch(staticHome, /data-ling-ready=/i);
});
