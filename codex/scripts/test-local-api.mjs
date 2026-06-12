import process from "node:process";

const base = process.env.MINEWORLD_BASE_URL || "http://mine_world.test";
const credentials = {
  nome_exibicao: "Setup Local",
  login: "mineworld_setup_check",
  senha: "MineWorld123#",
  confirmar_senha: "MineWorld123#"
};

async function request(path, options = {}) {
  const startedAt = performance.now();
  console.log(`API local: ${options.method || "GET"} ${path}`);
  const response = await fetch(`${base}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(30000),
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const raw = await response.text();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error(`${path}: resposta nao JSON (HTTP ${response.status}): ${raw.slice(0, 1200)}`);
  }
  if (!response.ok) {
    throw new Error(`${path}: HTTP ${response.status} - ${payload.message || "erro desconhecido"}`);
  }
  console.log(`API local: ${path} concluido em ${Math.round(performance.now() - startedAt)} ms.`);
  return payload;
}

let login;
try {
  login = await request("/api/login/logar.php", {
    method: "POST",
    body: JSON.stringify({ login: credentials.login, senha: credentials.senha })
  });
} catch {
  login = await request("/api/login/cadastrar.php", {
    method: "POST",
    body: JSON.stringify(credentials)
  });
}

const token = login.data?.token;
if (!token) throw new Error("Login ou cadastro local nao retornou token.");

const authHeaders = { Authorization: `Bearer ${token}` };
await request("/api/login/validar.php", { headers: authHeaders });
const world = await request("/api/mundos/cadastrar.php", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({ nome: "Mundo Setup Local" })
});
const worldId = world.data?.world?.id;
if (!worldId) throw new Error("Criacao de mundo nao retornou ID.");

await request("/api/mundos/listar.php", { headers: authHeaders });

const chunkData = Buffer.alloc(16 * 16 * 100).toString("base64");
const chunks = [];
for (let chunkX = -2; chunkX <= 2; chunkX++) {
  for (let chunkZ = -2; chunkZ <= 2; chunkZ++) {
    chunks.push({ chunk_x: chunkX, chunk_z: chunkZ, data_base64: chunkData });
  }
}

const firstBatch = chunks.slice(0, 4);
const firstSaveStartedAt = performance.now();
const firstSave = await request("/api/mundos/salvar_chunks.php", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({ id_mundo: worldId, chunks: firstBatch })
});
if (firstSave.data?.saved_count !== firstBatch.length) {
  throw new Error(`Primeiro lote salvou ${firstSave.data?.saved_count || 0}/${firstBatch.length} chunks.`);
}
let slowestBatchMs = performance.now() - firstSaveStartedAt;

const partialLoad = await request("/api/mundos/carregar_chunks.php", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({ id_mundo: worldId, chunks })
});
if (partialLoad.data?.chunks?.length !== firstBatch.length) {
  throw new Error(`Retomada parcial encontrou ${partialLoad.data?.chunks?.length || 0}/${firstBatch.length} chunks.`);
}

for (let index = firstBatch.length; index < chunks.length; index += 4) {
  const batch = chunks.slice(index, index + 4);
  const startedAt = performance.now();
  const saved = await request("/api/mundos/salvar_chunks.php", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ id_mundo: worldId, chunks: batch })
  });
  slowestBatchMs = Math.max(slowestBatchMs, performance.now() - startedAt);
  if (saved.data?.saved_count !== batch.length) {
    throw new Error(`Lote salvou ${saved.data?.saved_count || 0}/${batch.length} chunks.`);
  }
}

const completeLoad = await request("/api/mundos/carregar_chunks.php", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify({ id_mundo: worldId, chunks })
});
if (completeLoad.data?.chunks?.length !== chunks.length) {
  throw new Error(`Janela inicial carregou ${completeLoad.data?.chunks?.length || 0}/${chunks.length} chunks.`);
}

await request(`/api/mundos/excluir.php?id=${worldId}`, {
  method: "DELETE",
  headers: authHeaders
});

console.log(`API local: cadastro, login, auth, CRUD e ${chunks.length} chunks validados; lote mais lento ${Math.round(slowestBatchMs)} ms.`);
