import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const php = process.env.PHP_BIN || "C:\\laragon\\bin\\php\\php-8.3.16-Win32-vs16-x64\\php.exe";
const ignored = new Set([".git", "node_modules"]);
const files = [];

function walk(dir) {
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignored.has(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) walk(full);
    else if (full.endsWith(".js") || full.endsWith(".mjs") || full.endsWith(".php")) files.push(full);
  }
}

walk(root);
let failures = 0;
for (const file of files) {
  const relative = path.relative(root, file);
  const result = file.endsWith(".php")
    ? spawnSync(php, ["-l", file], { encoding: "utf8" })
    : spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (result.status !== 0) {
    failures++;
    console.error(`FAIL ${relative}\n${result.stdout}${result.stderr}`);
  }
}
console.log(`Syntax: ${files.length - failures}/${files.length} arquivo(s) validos.`);
if (failures) process.exitCode = 1;
