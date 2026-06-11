import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mineworld-harness-"));
const tempCodex = path.join(tempRoot, "codex");

function copy(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

function run(...args) {
  return spawnSync(process.execPath, [path.join(tempCodex, "harness.mjs"), ...args], {
    cwd: tempRoot,
    encoding: "utf8"
  });
}

function mustRun(...args) {
  const result = run(...args);
  assert.equal(result.status, 0, `${args.join(" ")} falhou:\n${result.stdout}${result.stderr}`);
  return result;
}

try {
  fs.mkdirSync(path.join(tempCodex, "_templates"), { recursive: true });
  for (const name of ["TEMPLATE-PRD.md", "TEMPLATE-PRD-TECNICA.md", "TEMPLATE-TASK.md", "TEMPLATE-DT.md", "TEMPLATE-VALIDACAO.md"]) {
    copy(path.join(root, "codex", "_templates", name), path.join(tempCodex, "_templates", name));
  }
  copy(path.join(root, "codex", "harness.mjs"), path.join(tempCodex, "harness.mjs"));
  copy(path.join(root, "codex", "harness.config.json"), path.join(tempCodex, "harness.config.json"));
  fs.mkdirSync(path.join(tempCodex, "prds"), { recursive: true });
  fs.mkdirSync(path.join(tempCodex, "debitos-tecnicos"), { recursive: true });
  fs.mkdirSync(path.join(tempCodex, "execucoes"), { recursive: true });
  fs.writeFileSync(path.join(tempCodex, "ESCOPO.md"), "# Escopo\n", "utf8");

  mustRun("prd:create", "050", "teste-prd", "Teste PRD");
  mustRun("task:create", "050", "001", "implementar-base", "Implementar base");
  mustRun("prd:status", "050", "Em validacao");
  mustRun("dt:create", "007", "teste-dt", "Teste DT");
  mustRun("dt:status", "007", "Aprovada");
  mustRun("validation:create", "prd", "050");

  const premature = run("prd:status", "050", "Aprovada");
  assert.equal(premature.status, 0, premature.stderr);
  mustRun("prd:status", "050", "Em andamento");
  const blockedFinal = run("prd:status", "050", "Implementada");
  assert.notEqual(blockedFinal.status, 0);
  assert.match(blockedFinal.stderr, /checkbox\(es\) pendentes/);

  const task = fs.readFileSync(path.join(tempCodex, "prds", "PRD-050-teste-prd", "tasks", "TASK-001-implementar-base.md"), "utf8");
  assert.match(task, /\[PRD-050-teste-prd\.md\]\(\.\.\/PRD-050-teste-prd\.md\)/);
  assert.match(task, /\*\*Status\*\* \| Pendente/);
  console.log("Harness CLI: criacao, transicoes e gate final validados.");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
