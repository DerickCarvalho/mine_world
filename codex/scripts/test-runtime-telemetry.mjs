import assert from "node:assert/strict";
import { RuntimeTelemetry } from "../../assets/js/game/telemetry/RuntimeTelemetry.js";

let currentTime = 1000;
const telemetry = new RuntimeTelemetry({
  now: () => currentTime,
  sampleLimit: 5,
  longTaskThresholdMs: 50
});

for (const frameTime of [10, 20, 30, 40, 50, 60]) {
  telemetry.recordFrame(frameTime);
}

assert.equal(telemetry.recordFrame(-1), false);
assert.equal(telemetry.recordLongTask(49, { source: "ignored" }), false);
assert.equal(telemetry.recordLongTask(75, { source: "manual" }), true);

const finishGeneration = telemetry.startChunkJob("generation", { chunkKey: "0,0" });
currentTime += 65;
assert.equal(finishGeneration(), 65);
assert.equal(finishGeneration(), 0);

const syncResult = telemetry.measureChunkJob("meshing", () => {
  currentTime += 25;
  return "mesh";
});
assert.equal(syncResult, "mesh");

const asyncResult = await telemetry.measureChunkJob("persistence", async () => {
  currentTime += 15;
  return "saved";
});
assert.equal(asyncResult, "saved");

currentTime = 61000;
const snapshot = telemetry.snapshot({
  viewport: "1920x1080",
  renderDistance: 6
});

assert.deepEqual(
  {
    count: snapshot.frames.count,
    averageMs: snapshot.frames.averageMs,
    p50Ms: snapshot.frames.p50Ms,
    p95Ms: snapshot.frames.p95Ms,
    fps: snapshot.frames.fps
  },
  {
    count: 5,
    averageMs: 40,
    p50Ms: 40,
    p95Ms: 60,
    fps: 25
  }
);
assert.equal(snapshot.longTasks.count, 1);
assert.equal(snapshot.longTasks.perMinute, 1);
assert.equal(snapshot.longTasks.entries[0].metadata.source, "manual");
assert.equal(snapshot.chunkJobs.count, 3);
assert.equal(snapshot.chunkJobs.p50Ms, 25);
assert.equal(snapshot.chunkJobs.p95Ms, 65);
assert.equal(snapshot.metadata.renderDistance, 6);

const exported = JSON.parse(telemetry.exportJSON({ run: "baseline" }, 0));
assert.equal(exported.schemaVersion, 1);
assert.equal(exported.metadata.run, "baseline");
assert.equal(typeof exported.capturedAt, "string");

telemetry.reset();
const resetSnapshot = telemetry.snapshot();
assert.equal(resetSnapshot.frames.count, 0);
assert.equal(resetSnapshot.longTasks.count, 0);
assert.equal(resetSnapshot.chunkJobs.count, 0);

const originalPerformanceObserver = globalThis.PerformanceObserver;
let browserObserver = null;
globalThis.PerformanceObserver = class PerformanceObserverMock {
  static supportedEntryTypes = ["longtask"];

  constructor(callback) {
    this.callback = callback;
    this.disconnected = false;
    browserObserver = this;
  }

  observe(options) {
    this.options = options;
  }

  disconnect() {
    this.disconnected = true;
  }
};

assert.equal(telemetry.observeLongTasks(), true);
assert.deepEqual(browserObserver.options, { entryTypes: ["longtask"] });
browserObserver.callback({
  getEntries: () => [{ duration: 80, entryType: "longtask", name: "self" }]
});
assert.equal(telemetry.snapshot().longTasks.entries[0].metadata.source, "performance-observer");
assert.equal(telemetry.stopObservingLongTasks(), true);
assert.equal(browserObserver.disconnected, true);

if (originalPerformanceObserver === undefined) {
  delete globalThis.PerformanceObserver;
} else {
  globalThis.PerformanceObserver = originalPerformanceObserver;
}

console.log("RuntimeTelemetry: percentis, FPS, long tasks, chunk jobs e exportacao JSON validados.");
