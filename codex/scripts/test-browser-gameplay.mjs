import fs from 'node:fs/promises';
import process from 'node:process';
import { chromium } from 'playwright';

const base = process.env.MINEWORLD_BASE_URL || 'http://mine_world.test';
const durationMs = Math.max(5000, Number(process.env.MINEWORLD_BROWSER_SMOKE_MS || 15000));
const strictPerformance = process.env.MINEWORLD_STRICT_PERFORMANCE === '1';
const headless = process.env.MINEWORLD_HEADLESS !== '0';
const executablePath = process.env.MINEWORLD_BROWSER_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const credentials = {
    nome_exibicao: 'Browser Smoke',
    login: 'mineworld_browser_smoke',
    senha: 'MineWorld123#',
    confirmar_senha: 'MineWorld123#'
};

async function api(path, options = {}) {
    const response = await fetch(base + path, {
        ...options,
        signal: AbortSignal.timeout(60000),
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
    });
    const payload = await response.json();
    if (!response.ok) {
        throw new Error(path + ': ' + (payload.message || response.status));
    }
    return payload;
}

let login;
try {
    login = await api('/api/login/logar.php', {
        method: 'POST',
        body: JSON.stringify({ login: credentials.login, senha: credentials.senha })
    });
} catch {
    login = await api('/api/login/cadastrar.php', { method: 'POST', body: JSON.stringify(credentials) });
}

const token = login.data.token;
const authHeaders = { Authorization: 'Bearer ' + token };
const created = await api('/api/mundos/cadastrar.php', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ nome: 'Smoke Browser ' + Date.now() })
});
const worldId = created.data.world.id;
const browser = await chromium.launch({
    executablePath: executablePath,
    headless: headless,
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
});

try {
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    await context.addInitScript(({ authToken, performanceMode }) => {
        localStorage.setItem('mineworld@token', authToken);
        localStorage.setItem('mineworld-performance-mode', performanceMode);
    }, { authToken: token, performanceMode: strictPerformance ? 'turbo' : 'balanced' });
    const page = await context.newPage();
    const errors = [];
    const failedResponses = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
        if (response.status() >= 400) {
            failedResponses.push({ status: response.status(), url: response.url() });
        }
    });

    await page.goto(base + '/index.php?page=jogo&id_mundo=' + worldId, { waitUntil: 'domcontentloaded' });
    try {
        await page.waitForFunction(() => window.mineWorldBenchmark && window.mineWorldBenchmark.snapshot(), null, { timeout: 120000 });
    } catch (error) {
        await fs.mkdir('codex/execucoes', { recursive: true });
        const diagnostics = await page.evaluate(() => ({
            href: location.href,
            title: document.title,
            overlayTitle: document.querySelector('[data-overlay-title]')?.textContent || null,
            overlayMessage: document.querySelector('[data-overlay-message]')?.textContent || null,
            status: document.querySelector('[data-game-status]')?.textContent || null,
            hasBenchmark: Boolean(window.mineWorldBenchmark),
            token: Boolean(localStorage.getItem('mineworld@token'))
        }));
        await page.screenshot({ path: 'codex/execucoes/PRD-012-browser-failure.png', fullPage: true });
        await fs.writeFile('codex/execucoes/PRD-012-browser-failure.json', JSON.stringify({ diagnostics, errors, failedResponses }, null, 2));
        throw error;
    }
    await page.waitForFunction(() => document.querySelector('[data-scene-overlay]')?.hidden === true, null, { timeout: 120000 });

    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => document.querySelector('[data-game-inventory]')?.hidden === false);
    await page.keyboard.press('KeyE');
    await page.waitForFunction(() => document.querySelector('[data-game-inventory]')?.hidden === true);

    const integratedSmoke = await page.evaluate(() => window.mineWorldBenchmark.integratedSmoke());
    const traversal = await page.evaluate(() => window.mineWorldBenchmark.traverseChunks(20, 250));
    await page.waitForTimeout(durationMs);
    const snapshot = await page.evaluate(() => window.mineWorldBenchmark.snapshot());
    const status = await page.locator('[data-game-status]').textContent();
    await fs.mkdir('codex/execucoes', { recursive: true });
    await page.screenshot({ path: 'codex/execucoes/PRD-012-browser-smoke.png', fullPage: true });
    const compact = (value) => ({
        ...value,
        longTasks: { ...value.longTasks, entries: value.longTasks.entries.slice(-20) },
        chunkJobs: { ...value.chunkJobs, entries: value.chunkJobs.entries.filter((entry) => entry.durationMs >= 10).slice(-50) }
    });
    await fs.writeFile(
        'codex/execucoes/PRD-012-browser-benchmark.json',
        JSON.stringify({ status, integratedSmoke, traversal: compact(traversal), snapshot: compact(snapshot), errors, failedResponses }, null, 2)
    );

    if (errors.length > 0) {
        throw new Error('Erros no navegador: ' + errors.join(' | '));
    }
    if (!snapshot.metadata.renderer || snapshot.frames.count === 0) {
        throw new Error('Benchmark do navegador nao coletou renderer/frames.');
    }
    if (!integratedSmoke || Object.values(integratedSmoke).some((value) => value !== true)) {
        throw new Error('Smoke integrado nao cobriu todos os fluxos esperados: ' + JSON.stringify(integratedSmoke));
    }
    if (strictPerformance && snapshot.frames.p95Ms > 22) {
        throw new Error('CA-01 falhou: P95 sustentado de ' + snapshot.frames.p95Ms + 'ms excede 22ms.');
    }
    if (strictPerformance && traversal.frames.maxMs > 100) {
        throw new Error('CA-02 falhou: frame maximo de ' + traversal.frames.maxMs + 'ms excede 100ms na travessia.');
    }
    if (strictPerformance && snapshot.longTasks.perMinute > 2) {
        throw new Error('CA-03 falhou: ' + snapshot.longTasks.perMinute + ' long tasks/min excede 2.');
    }
    console.log('Browser gameplay: renderer=' + snapshot.metadata.renderer
        + ', frames=' + snapshot.frames.count
        + ', p95=' + snapshot.frames.p95Ms + 'ms'
        + ', longTasks=' + snapshot.longTasks.count
        + ', chunks=' + snapshot.metadata.loadedChunks
        + (strictPerformance ? ', strict=on.' : ', strict=off.'));
} finally {
    await browser.close();
    await api('/api/mundos/excluir.php?id=' + worldId, { method: 'DELETE', headers: authHeaders }).catch(() => {});
}
