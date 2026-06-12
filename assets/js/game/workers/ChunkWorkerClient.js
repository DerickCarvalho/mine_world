export class ChunkWorkerClient {
    constructor(options) {
        this.worker = null;
        this.nextJobId = 1;
        this.pending = new Map();
        this.onResult = typeof options.onResult === 'function' ? options.onResult : null;
        this.onError = typeof options.onError === 'function' ? options.onError : null;
        this.basePayload = {
            seed: options.seed,
            algorithmVersion: options.algorithmVersion,
            textureCatalog: options.textureCatalog || {}
        };

        if (typeof Worker === 'function') {
            try {
                this.worker = new Worker(new URL('./ChunkWorker.js', import.meta.url), { type: 'module' });
                this.worker.addEventListener('message', (event) => this.handleMessage(event.data));
                this.worker.addEventListener('error', (event) => this.handleFatalError(event));
            } catch (error) {
                this.worker = null;
                this.notifyError(error);
            }
        }
    }

    isAvailable() {
        return Boolean(this.worker);
    }

    request(payload) {
        if (!this.worker) {
            return false;
        }

        const jobId = this.nextJobId;
        this.nextJobId += 1;
        const message = {
            ...this.basePayload,
            ...payload,
            type: 'mesh-chunk',
            jobId: jobId
        };
        const transfer = [];
        if (message.snapshot && Array.isArray(message.snapshot.snapshots)) {
            for (const chunk of message.snapshot.snapshots) {
                if (chunk && chunk.dataBuffer instanceof ArrayBuffer) {
                    transfer.push(chunk.dataBuffer);
                }
            }
        }

        this.pending.set(jobId, {
            key: message.key,
            version: message.version,
            mode: message.mode,
            chunkX: message.chunkX,
            chunkZ: message.chunkZ
        });
        try {
            this.worker.postMessage(message, transfer);
        } catch (error) {
            const context = this.pending.get(jobId);
            this.pending.delete(jobId);
            this.notifyError(error, context);
            return false;
        }
        return true;
    }

    handleMessage(message) {
        if (!message || !this.pending.has(message.jobId)) {
            return;
        }

        const context = this.pending.get(message.jobId);
        this.pending.delete(message.jobId);
        if (message.type === 'mesh-result' && this.onResult) {
            this.onResult(message);
        } else if (message.type === 'mesh-error') {
            this.notifyError(new Error(message.message || 'Falha no job de chunk.'), { ...context, ...message });
        }
    }

    handleFatalError(event) {
        const error = event.error || new Error(event.message || 'Chunk Worker indisponivel.');
        for (const context of this.pending.values()) {
            this.notifyError(error, context);
        }
        this.destroy();
    }

    notifyError(error, context = null) {
        if (this.onError) {
            this.onError(error, context);
        }
    }

    getPendingCount() {
        return this.pending.size;
    }

    destroy() {
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.pending.clear();
    }
}
