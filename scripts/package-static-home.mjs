import { copyFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const prerenderedHome = resolve(
  root,
  "dist",
  "server",
  "prerendered-routes",
  "index.html",
);
const staticHome = resolve(root, "dist", "client", "index.html");

const html = await readFile(prerenderedHome, "utf8");

if (!html.includes("<title>Ling</title>")) {
  throw new Error("Refusing to package an unexpected prerendered home page");
}

if (!html.includes("loading-shell-boot")) {
  throw new Error("The prerendered home page is missing its startup feedback");
}

await copyFile(prerenderedHome, staticHome);
