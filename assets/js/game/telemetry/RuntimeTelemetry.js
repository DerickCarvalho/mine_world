const DEFAULT_SAMPLE_LIMIT = 36000;
const DEFAULT_LONG_TASK_THRESHOLD_MS = 50;

function defaultNow() {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
        return performance.now();
    }

    return Date.now();
}

function round(value, precision = 2) {
    if (!Number.isFinite(value)) {
        return 0;
    }

    const factor = 10 ** precision;
    return Math.round(value * factor) / factor;
}

function percentile(sortedValues, percentileValue) {
    if (sortedValues.length === 0) {
        return 0;
    }

    const index = Math.ceil((percentileValue / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
}

function summarizeDurations(values) {
    if (values.length === 0) {
        return {
            count: 0,
            averageMs: 0,
            minMs: 0,
            maxMs: 0,
            p50Ms: 0,
            p95Ms: 0
        };
    }

    const sortedValues = [...values].sort((left, right) => left - right);
    const total = values.reduce((sum, value) => sum + value, 0);

    return {
        count: values.length,
        averageMs: round(total / values.length),
        minMs: round(sortedValues[0]),
        maxMs: round(sortedValues[sortedValues.length - 1]),
        p50Ms: round(percentile(sortedValues, 50)),
        p95Ms: round(percentile(sortedValues, 95))
    };
}

function normalizeDuration(durationMs) {
    const value = Number(durationMs);
    return Number.isFinite(value) && value >= 0 ? value : null;
}

function appendLimited(collection, value, limit) {
    collection.push(value);
    if (collection.length > limit) {
        collection.splice(0, collection.length - limit);
    }
}

function cloneMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object') {
        return {};
    }

    return { ...metadata };
}

export class RuntimeTelemetry {
    constructor(options = {}) {
        this.now = typeof options.now === 'function' ? options.now : defaultNow;
        this.sampleLimit = Math.max(1, Math.floor(options.sampleLimit || DEFAULT_SAMPLE_LIMIT));
        this.longTaskThresholdMs = normalizeDuration(options.longTaskThresholdMs)
            ?? DEFAULT_LONG_TASK_THRESHOLD_MS;
        this.startedAt = this.now();
        this.frameTimes = [];
        this.longTasks = [];
        this.chunkJobs = [];
        this.longTaskObserver = null;
    }

    recordFrame(frameTimeMs) {
        const durationMs = normalizeDuration(frameTimeMs);
        if (durationMs === null) {
            return false;
        }

        appendLimited(this.frameTimes, durationMs, this.sampleLimit);
        return true;
    }

    recordLongTask(durationMs, metadata = {}) {
        const normalizedDuration = normalizeDuration(durationMs);
        if (normalizedDuration === null || normalizedDuration < this.longTaskThresholdMs) {
            return false;
        }

        appendLimited(this.longTasks, {
            durationMs: normalizedDuration,
            recordedAtMs: this.now() - this.startedAt,
            metadata: cloneMetadata(metadata)
        }, this.sampleLimit);
        return true;
    }

    recordChunkJob(name, durationMs, metadata = {}) {
        const normalizedDuration = normalizeDuration(durationMs);
        if (normalizedDuration === null) {
            return false;
        }

        const normalizedName = String(name || 'chunk-job');
        appendLimited(this.chunkJobs, {
            name: normalizedName,
            durationMs: normalizedDuration,
            recordedAtMs: this.now() - this.startedAt,
            metadata: cloneMetadata(metadata)
        }, this.sampleLimit);

        return true;
    }

    startChunkJob(name, metadata = {}) {
        const startedAt = this.now();
        let finished = false;

        return () => {
            if (finished) {
                return 0;
            }

            finished = true;
            const durationMs = Math.max(0, this.now() - startedAt);
            this.recordChunkJob(name, durationMs, metadata);
            return durationMs;
        };
    }

    measureChunkJob(name, callback, metadata = {}) {
        const finish = this.startChunkJob(name, metadata);

        try {
            const result = callback();
            if (result && typeof result.then === 'function') {
                return Promise.resolve(result).finally(finish);
            }

            finish();
            return result;
        } catch (error) {
            finish();
            throw error;
        }
    }

    observeLongTasks() {
        if (
            this.longTaskObserver
            || typeof PerformanceObserver === 'undefined'
            || !Array.isArray(PerformanceObserver.supportedEntryTypes)
            || !PerformanceObserver.supportedEntryTypes.includes('longtask')
        ) {
            return false;
        }

        this.longTaskObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                this.recordLongTask(entry.duration, {
                    source: 'performance-observer',
                    entryType: entry.entryType,
                    name: entry.name
                });
            }
        });
        this.longTaskObserver.observe({ entryTypes: ['longtask'] });
        return true;
    }

    stopObservingLongTasks() {
        if (!this.longTaskObserver) {
            return false;
        }

        this.longTaskObserver.disconnect();
        this.longTaskObserver = null;
        return true;
    }

    snapshot(metadata = {}) {
        const frameSummary = summarizeDurations(this.frameTimes);
        const chunkDurations = this.chunkJobs.map((job) => job.durationMs);
        const longTaskDurations = this.longTasks.map((task) => task.durationMs);
        const elapsedMs = Math.max(0, this.now() - this.startedAt);

        return {
            schemaVersion: 1,
            capturedAt: new Date().toISOString(),
            elapsedMs: round(elapsedMs),
            metadata: cloneMetadata(metadata),
            frames: {
                ...frameSummary,
                fps: frameSummary.averageMs > 0 ? round(1000 / frameSummary.averageMs) : 0
            },
            longTasks: {
                ...summarizeDurations(longTaskDurations),
                thresholdMs: this.longTaskThresholdMs,
                perMinute: elapsedMs > 0
                    ? round(this.longTasks.length / (elapsedMs / 60000))
                    : 0,
                entries: this.longTasks.map((task) => ({
                    ...task,
                    durationMs: round(task.durationMs),
                    recordedAtMs: round(task.recordedAtMs)
                }))
            },
            chunkJobs: {
                ...summarizeDurations(chunkDurations),
                entries: this.chunkJobs.map((job) => ({
                    ...job,
                    durationMs: round(job.durationMs),
                    recordedAtMs: round(job.recordedAtMs)
                }))
            }
        };
    }

    exportJSON(metadata = {}, space = 2) {
        return JSON.stringify(this.snapshot(metadata), null, space);
    }

    reset() {
        this.frameTimes.length = 0;
        this.longTasks.length = 0;
        this.chunkJobs.length = 0;
        this.startedAt = this.now();
    }

    destroy() {
        this.stopObservingLongTasks();
        this.reset();
    }
}
