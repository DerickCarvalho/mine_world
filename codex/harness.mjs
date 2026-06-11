import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const codexDir = path.join(root, "codex");
const config = JSON.parse(fs.readFileSync(path.join(codexDir, "harness.config.json"), "utf8"));
const args = process.argv.slice(2);
const command = args.shift() || "help";

const normalizeSlashes = (value) => value.replaceAll("\\", "/");
const read = (file) => fs.readFileSync(file, "utf8");
const write = (file, content) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content.replaceAll("\r\n", "\n"), "utf8");
};
const listDirs = (dir) => fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => path.join(dir, item.name))
  : [];
const listFiles = (dir) => fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((item) => item.isDirectory() ? listFiles(path.join(dir, item.name)) : [path.join(dir, item.name)])
  : [];
const normalizeId = (value, prefix) => {
  const match = String(value || "").match(/\d+/);
  if (!match) throw new Error(`Informe um numero para ${prefix}.`);
  return `${prefix}-${match[0].padStart(3, "0")}`;
};
const slugify = (value) => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const today = () => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" }).format(new Date());
const field = (content, name) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return content.match(new RegExp(`\\| \\*\\*${escaped}\\*\\* \\|\\s*([^|\\r\\n]+)`))?.[1]?.trim() || null;
};
const replaceField = (content, name, value) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(\\| \\*\\*${escaped}\\*\\* \\|)\\s*([^|\\r\\n]+)(\\|)`);
  if (!pattern.test(content)) throw new Error(`Campo "${name}" nao encontrado.`);
  return content.replace(pattern, `$1 ${value} $3`);
};
const harnessVersion = (content) => Number(field(content, "Harness Version") || 1);
const markdownLinks = (content) => [...content.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1]);
const checkboxCounts = (content) => ({
  open: (content.match(/- \[ \]/g) || []).length,
  done: (content.match(/- \[[xX]\]/g) || []).length
});
const acceptanceIds = (content) => [...content.matchAll(/\bCA-\d{2}\b/g)].map((match) => match[0]);
const unique = (values) => [...new Set(values)];

function nextId(baseDir, prefix) {
  const ids = listDirs(baseDir).map((dir) => path.basename(dir).match(new RegExp(`^${prefix}-(\\d{3})`))?.[1]).filter(Boolean);
  return `${prefix}-${String(Math.max(0, ...ids.map(Number)) + 1).padStart(3, "0")}`;
}

function resolveDocument(baseDir, prefix, rawId) {
  const id = normalizeId(rawId, prefix);
  const matches = listDirs(baseDir).filter((dir) => path.basename(dir).startsWith(`${id}-`));
  if (matches.length !== 1) throw new Error(`${id}: esperado exatamente um diretorio, encontrados ${matches.length}.`);
  const candidates = fs.readdirSync(matches[0]).filter((name) => name.endsWith(".md") && name.startsWith(`${id}-`) && !name.includes("-tecnica"));
  if (candidates.length !== 1) throw new Error(`${id}: documento principal nao encontrado de forma univoca.`);
  return { id, dir: matches[0], file: path.join(matches[0], candidates[0]) };
}

function applyTemplate(templateName, replacements) {
  let content = read(path.join(codexDir, "_templates", templateName));
  for (const [from, to] of Object.entries(replacements)) content = content.replaceAll(from, to);
  return content;
}

function createPrd(commandArgs) {
  const base = path.join(codexDir, "prds");
  const hasId = commandArgs[0] && /^\d+$|^PRD-\d+$/i.test(commandArgs[0]);
  const id = hasId ? normalizeId(commandArgs.shift(), "PRD") : nextId(base, "PRD");
  const rawSlug = commandArgs.shift();
  const title = commandArgs.join(" ") || rawSlug;
  const slug = slugify(rawSlug);
  if (!slug || !title) throw new Error("Uso: prd:create [numero] <slug> [titulo].");
  const dir = path.join(base, `${id}-${slug}`);
  if (fs.existsSync(dir)) throw new Error(`${normalizeSlashes(path.relative(root, dir))} ja existe.`);
  const number = id.slice(4);
  const replacements = {
    "[NNN]": number,
    "[nome-curto]": slug,
    "[titulo curto e descritivo]": title,
    "[titulo da funcionalidade]": title,
    "[DD/MM/YYYY]": today()
  };
  write(path.join(dir, `${id}-${slug}.md`), applyTemplate("TEMPLATE-PRD.md", replacements));
  write(path.join(dir, `PRD-TECNICA-${number}-${slug}.md`), applyTemplate("TEMPLATE-PRD-TECNICA.md", replacements));
  fs.mkdirSync(path.join(dir, "tasks"), { recursive: true });
  console.log(`Criada ${normalizeSlashes(path.relative(root, dir))}`);
}

function createDt(commandArgs) {
  const base = path.join(codexDir, "debitos-tecnicos");
  const hasId = commandArgs[0] && /^\d+$|^DT-\d+$/i.test(commandArgs[0]);
  const id = hasId ? normalizeId(commandArgs.shift(), "DT") : nextId(base, "DT");
  const rawSlug = commandArgs.shift();
  const title = commandArgs.join(" ") || rawSlug;
  const slug = slugify(rawSlug);
  if (!slug || !title) throw new Error("Uso: dt:create [numero] <slug> [titulo].");
  const dir = path.join(base, `${id}-${slug}`);
  if (fs.existsSync(dir)) throw new Error(`${normalizeSlashes(path.relative(root, dir))} ja existe.`);
  const replacements = {
    "[NNN]": id.slice(3),
    "[titulo curto e objetivo]": title,
    "[DD/MM/YYYY]": today()
  };
  write(path.join(dir, `${id}-${slug}.md`), applyTemplate("TEMPLATE-DT.md", replacements));
  console.log(`Criada ${normalizeSlashes(path.relative(root, dir))}`);
}

function createTask(commandArgs) {
  const prd = resolveDocument(path.join(codexDir, "prds"), "PRD", commandArgs.shift());
  const rawTaskId = commandArgs.shift();
  const slug = slugify(commandArgs.shift());
  const title = commandArgs.join(" ") || slug;
  if (!rawTaskId || !slug) throw new Error("Uso: task:create <prd> <task> <slug> [titulo].");
  const taskId = normalizeId(rawTaskId, "TASK");
  const file = path.join(prd.dir, "tasks", `${taskId}-${slug}.md`);
  if (fs.existsSync(file)) throw new Error(`${normalizeSlashes(path.relative(root, file))} ja existe.`);
  const prdSlug = path.basename(prd.dir).replace(`${prd.id}-`, "");
  let content = read(path.join(codexDir, "_templates", "TEMPLATE-TASK.md"));
  content = content
    .replaceAll("PRD-TECNICA-[NNN]", `PRD-TECNICA-${prd.id.slice(4)}`)
    .replaceAll("PRD-[NNN]", prd.id)
    .replaceAll("TASK-[NNN]", taskId)
    .replaceAll("[nome-curto]", prdSlug)
    .replaceAll("[descricao-curta]", slug)
    .replaceAll("[acao objetiva no imperativo]", title);
  write(file, content);
  console.log(`Criada ${normalizeSlashes(path.relative(root, file))}`);
}

function createValidation(kind, rawId) {
  if (!["prd", "dt"].includes(kind)) throw new Error("Uso: validation:create <prd|dt> <numero>.");
  const isPrd = kind === "prd";
  const doc = resolveDocument(path.join(codexDir, isPrd ? "prds" : "debitos-tecnicos"), isPrd ? "PRD" : "DT", rawId);
  const output = path.join(codexDir, "execucoes", `${doc.id}-validacao.md`);
  if (fs.existsSync(output)) throw new Error(`${normalizeSlashes(path.relative(root, output))} ja existe.`);
  const relativeLink = normalizeSlashes(path.relative(path.dirname(output), doc.file));
  let content = read(path.join(codexDir, "_templates", "TEMPLATE-VALIDACAO.md"));
  content = content.replaceAll("[PRD/DT]-[NNN]", doc.id).replaceAll("[link]", relativeLink).replaceAll("[DD/MM/YYYY]", today());
  write(output, content);
  console.log(`Criada ${normalizeSlashes(path.relative(root, output))}`);
}

function syncScopeStatus(id, nextState) {
  const scopeFile = path.join(codexDir, "ESCOPO.md");
  const lines = read(scopeFile).split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith(`| ${id} |`));
  if (index < 0) return;
  const cells = lines[index].split("|");
  if (cells.length >= 5) {
    cells[3] = ` ${nextState} `;
    lines[index] = cells.join("|");
    write(scopeFile, `${lines.join("\n")}\n`);
  }
}

function assertFinalGate(doc, isPrd, content) {
  const checks = checkboxCounts(content);
  if (checks.open > 0) throw new Error(`${doc.id}: existem ${checks.open} checkbox(es) pendentes.`);
  if (isPrd) {
    const tasks = listFiles(path.join(doc.dir, "tasks")).filter((file) => file.endsWith(".md"));
    if (!tasks.length) throw new Error(`${doc.id}: nenhuma task individual encontrada.`);
    const incomplete = tasks.filter((file) => field(read(file), "Status") !== "Concluida");
    if (incomplete.length) throw new Error(`${doc.id}: ${incomplete.length} task(s) ainda nao estao Concluidas.`);
  }
  const report = path.join(codexDir, "execucoes", `${doc.id}-validacao.md`);
  if (!fs.existsSync(report)) throw new Error(`${doc.id}: relatorio ${normalizeSlashes(path.relative(root, report))} obrigatorio.`);
  const result = field(read(report), "Resultado final");
  if (!result?.startsWith("Aprovado")) throw new Error(`${doc.id}: validacao final deve estar Aprovada.`);
}

function statusChange(kind, rawId, nextState) {
  const isPrd = kind === "prd";
  const doc = resolveDocument(path.join(codexDir, isPrd ? "prds" : "debitos-tecnicos"), isPrd ? "PRD" : "DT", rawId);
  const states = config[isPrd ? "prdStates" : "dtStates"];
  const transitions = config[isPrd ? "prdTransitions" : "dtTransitions"];
  if (!states.includes(nextState)) throw new Error(`Estado invalido: ${nextState}. Use: ${states.join(", ")}.`);
  const content = read(doc.file);
  const current = field(content, "Status");
  if (!current) throw new Error(`${doc.id}: campo Status nao encontrado.`);
  if (!(transitions[current] || []).includes(nextState)) throw new Error(`Transicao proibida: ${current} -> ${nextState}.`);
  if (nextState === "Implementada" || nextState === "Concluida") assertFinalGate(doc, isPrd, content);
  write(doc.file, replaceField(content, "Status", nextState));
  syncScopeStatus(doc.id, nextState);
  console.log(`${doc.id}: ${current} -> ${nextState}`);
}

function taskStatusChange(rawPrdId, rawTaskId, nextState) {
  const prd = resolveDocument(path.join(codexDir, "prds"), "PRD", rawPrdId);
  const taskId = normalizeId(rawTaskId, "TASK");
  const matches = listFiles(path.join(prd.dir, "tasks")).filter((file) => path.basename(file).startsWith(`${taskId}-`));
  if (matches.length !== 1) throw new Error(`${prd.id}/${taskId}: esperado exatamente uma task, encontradas ${matches.length}.`);
  const content = read(matches[0]);
  const current = field(content, "Status");
  if (!(config.taskTransitions[current] || []).includes(nextState)) throw new Error(`Transicao proibida: ${current} -> ${nextState}.`);
  if (nextState === "Concluida" && checkboxCounts(content).open > 0) throw new Error(`${taskId}: checklist ainda possui itens pendentes.`);
  write(matches[0], replaceField(content, "Status", nextState));
  console.log(`${prd.id}/${taskId}: ${current} -> ${nextState}`);
}

function validate() {
  const issues = [];
  const add = (severity, file, message) => issues.push({ severity, file: normalizeSlashes(path.relative(root, file)), message });
  const collections = [
    { base: path.join(codexDir, "prds"), prefix: "PRD", final: "Implementada", states: config.prdStates },
    { base: path.join(codexDir, "debitos-tecnicos"), prefix: "DT", final: "Concluida", states: config.dtStates }
  ];
  for (const collection of collections) {
    const seen = new Map();
    for (const dir of listDirs(collection.base)) {
      const id = path.basename(dir).match(new RegExp(`^${collection.prefix}-(\\d{3})`))?.[0];
      if (!id) {
        add("ERROR", dir, `Diretorio nao segue ${collection.prefix}-NNN-slug.`);
        continue;
      }
      if (seen.has(id)) add("ERROR", dir, `${id} duplicado; primeiro em ${seen.get(id)}.`);
      seen.set(id, normalizeSlashes(path.relative(root, dir)));
      const mdFiles = listFiles(dir).filter((file) => file.endsWith(".md"));
      const principal = mdFiles.find((file) => path.basename(file).startsWith(`${id}-`) && !path.basename(file).includes("-tecnica"));
      if (!principal) {
        add("ERROR", dir, "Documento principal ausente.");
        continue;
      }
      const principalContent = read(principal);
      const version = harnessVersion(principalContent);
      const severity = version >= config.version ? "ERROR" : "WARN";
      const status = field(principalContent, "Status");
      if (!status) add(severity, principal, "Status nao encontrado.");
      else if (!collection.states.includes(status)) add(severity, principal, `Status desconhecido: ${status}.`);
      if (version < config.version) add("WARN", principal, `Documento legado sem Harness Version ${config.version}.`);
      if (collection.prefix === "PRD" && version >= config.version) {
        const technical = mdFiles.find((file) => /PRD-TECNICA-\d{3}-.+\.md$/.test(path.basename(file)));
        const tasks = mdFiles.filter((file) => normalizeSlashes(file).includes("/tasks/"));
        if (!technical) add("ERROR", dir, "PRD tecnica padrao ausente.");
        if (!tasks.length) add(status === "Rascunho" || status === "Em validacao" ? "WARN" : "ERROR", dir, "Nenhuma task individual encontrada.");
        const covered = unique(tasks.flatMap((file) => acceptanceIds(read(file))));
        for (const criterion of unique(acceptanceIds(principalContent))) {
          if (!covered.includes(criterion)) add("ERROR", principal, `${criterion} nao esta coberto por nenhuma task.`);
        }
      }
      for (const file of mdFiles) {
        const content = read(file);
        for (const link of markdownLinks(content)) {
          if (/^(https?:|#|\[)/.test(link) || link.includes("[") || link.includes("]")) continue;
          const target = path.resolve(path.dirname(file), link.split("#")[0]);
          if (!fs.existsSync(target)) add(severity, file, `Link quebrado: ${link}.`);
        }
        const fileStatus = field(content, "Status");
        const checks = checkboxCounts(content);
        if ((fileStatus === "Concluida" || fileStatus === "Implementada") && checks.open > 0) {
          add(severity, file, `${checks.open} checkbox(es) pendente(s) em documento concluido.`);
        }
      }
      if (status === collection.final && !fs.existsSync(path.join(codexDir, "execucoes", `${id}-validacao.md`))) {
        add(severity, principal, `Relatorio codex/execucoes/${id}-validacao.md ausente.`);
      }
    }
  }
  const scope = read(path.join(codexDir, "ESCOPO.md"));
  for (const dir of listDirs(path.join(codexDir, "prds"))) {
    const id = path.basename(dir).match(/^PRD-\d{3}/)?.[0];
    if (id && !scope.includes(`| ${id} |`)) add("WARN", path.join(codexDir, "ESCOPO.md"), `${id} nao aparece na tabela de PRDs.`);
  }
  for (const issue of issues) console.log(`${issue.severity} ${issue.file}: ${issue.message}`);
  const errors = issues.filter((issue) => issue.severity === "ERROR").length;
  const warnings = issues.filter((issue) => issue.severity === "WARN").length;
  console.log(`Harness: ${errors} erro(s), ${warnings} aviso(s).`);
  if (errors) process.exitCode = 1;
}

function help() {
  console.log(`MineWorld Harness v${config.version}

Comandos:
  validate
  prd:create [numero] <slug> [titulo]
  dt:create [numero] <slug> [titulo]
  task:create <prd> <task> <slug> [titulo]
  validation:create <prd|dt> <numero>
  prd:status <numero> "<estado>"
  dt:status <numero> "<estado>"
  task:status <prd> <task> "<estado>"`);
}

try {
  if (command === "validate") validate();
  else if (command === "prd:create") createPrd(args);
  else if (command === "dt:create") createDt(args);
  else if (command === "task:create") createTask(args);
  else if (command === "validation:create") createValidation(args[0]?.toLowerCase(), args[1]);
  else if (command === "prd:status") statusChange("prd", args[0], args.slice(1).join(" "));
  else if (command === "dt:status") statusChange("dt", args[0], args.slice(1).join(" "));
  else if (command === "task:status") taskStatusChange(args[0], args[1], args.slice(2).join(" "));
  else help();
} catch (error) {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
}
