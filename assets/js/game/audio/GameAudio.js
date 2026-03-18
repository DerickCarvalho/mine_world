const FOOTSTEP_PROFILES = Object.freeze({
    grass: { tone: 140, noise: 0.085, decay: 0.075, filter: 880 },
    dirt: { tone: 122, noise: 0.082, decay: 0.078, filter: 720 },
    stone: { tone: 196, noise: 0.05, decay: 0.055, filter: 1280 },
    sand: { tone: 104, noise: 0.1, decay: 0.08, filter: 620 },
    wood: { tone: 176, noise: 0.06, decay: 0.07, filter: 980 },
    leaves: { tone: 160, noise: 0.095, decay: 0.09, filter: 540 },
    default: { tone: 150, noise: 0.07, decay: 0.07, filter: 900 }
});

export class GameAudio {
    constructor(volume = 80) {
        this.audioContext = null;
        this.masterGain = null;
        this.noiseBuffer = null;
        this.unlocked = false;
        this.setVolume(volume);
    }

    ensureContext() {
        if (this.audioContext) {
            return this.audioContext;
        }

        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) {
            return null;
        }

        this.audioContext = new AudioCtor();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.applyVolume();
        return this.audioContext;
    }

    applyVolume() {
        if (!this.masterGain) {
            return;
        }

        this.masterGain.gain.value = this.volume;
    }

    setVolume(value) {
        const numeric = Number.isFinite(Number(value)) ? Number(value) : 80;
        this.volume = Math.max(0, Math.min(1, numeric / 100));
        this.applyVolume();
    }

    async unlock() {
        const context = this.ensureContext();
        if (!context) {
            return false;
        }

        if (context.state === 'suspended') {
            try {
                await context.resume();
            } catch (error) {
                return false;
            }
        }

        this.unlocked = context.state === 'running';
        return this.unlocked;
    }

    createEnvelope(now, attack, peak, decay) {
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), now + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
        gain.connect(this.masterGain);
        return gain;
    }

    getNoiseBuffer() {
        if (this.noiseBuffer || !this.audioContext) {
            return this.noiseBuffer;
        }

        const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate, this.audioContext.sampleRate);
        const channel = buffer.getChannelData(0);
        for (let index = 0; index < channel.length; index += 1) {
            channel[index] = Math.random() * 2 - 1;
        }

        this.noiseBuffer = buffer;
        return buffer;
    }

    spawnOscillator(options) {
        if (!this.audioContext || !this.masterGain) {
            return;
        }

        const now = this.audioContext.currentTime;
        const oscillator = this.audioContext.createOscillator();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.createEnvelope(now, options.attack || 0.01, options.gain || 0.14, options.decay || 0.16);

        oscillator.type = options.type || 'square';
        oscillator.frequency.setValueAtTime(options.startFrequency || 220, now);
        oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, options.endFrequency || options.startFrequency || 220), now + (options.decay || 0.16));

        filter.type = options.filterType || 'lowpass';
        filter.frequency.setValueAtTime(options.filterFrequency || 900, now);
        if (options.filterEndFrequency) {
            filter.frequency.exponentialRampToValueAtTime(Math.max(80, options.filterEndFrequency), now + (options.decay || 0.16));
        }

        oscillator.connect(filter);
        filter.connect(gain);
        oscillator.start(now);
        oscillator.stop(now + (options.duration || options.decay || 0.16) + 0.02);
    }

    spawnNoise(options) {
        if (!this.audioContext || !this.masterGain) {
            return;
        }

        const buffer = this.getNoiseBuffer();
        if (!buffer) {
            return;
        }

        const now = this.audioContext.currentTime;
        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.createEnvelope(now, options.attack || 0.005, options.gain || 0.08, options.decay || 0.09);

        source.buffer = buffer;
        filter.type = options.filterType || 'bandpass';
        filter.frequency.setValueAtTime(options.filterFrequency || 900, now);
        if (options.q) {
            filter.Q.value = options.q;
        }

        source.connect(filter);
        filter.connect(gain);
        source.start(now);
        source.stop(now + (options.duration || options.decay || 0.09) + 0.02);
    }

    playDamage() {
        if (!this.unlocked) {
            void this.unlock();
            return;
        }

        this.spawnOscillator({
            type: 'sawtooth',
            startFrequency: 210,
            endFrequency: 95,
            filterFrequency: 840,
            filterEndFrequency: 320,
            gain: 0.24,
            decay: 0.18,
            duration: 0.2
        });
    }

    playCatHurt() {
        if (!this.unlocked) {
            void this.unlock();
            return;
        }

        this.spawnOscillator({
            type: 'triangle',
            startFrequency: 740,
            endFrequency: 420,
            filterFrequency: 1800,
            filterEndFrequency: 720,
            gain: 0.11,
            decay: 0.18,
            duration: 0.2
        });
        this.spawnOscillator({
            type: 'square',
            startFrequency: 1180,
            endFrequency: 610,
            filterFrequency: 2200,
            filterEndFrequency: 900,
            gain: 0.05,
            decay: 0.13,
            duration: 0.14
        });
    }

    playBlockBreak(materialKey) {
        if (!this.unlocked) {
            void this.unlock();
            return;
        }

        const profile = FOOTSTEP_PROFILES[materialKey] || FOOTSTEP_PROFILES.default;
        this.spawnNoise({ gain: profile.noise * 1.25, decay: profile.decay * 1.2, filterFrequency: profile.filter, q: 0.7 });
        this.spawnOscillator({ type: 'square', startFrequency: profile.tone * 1.2, endFrequency: profile.tone * 0.58, filterFrequency: profile.filter * 1.1, gain: 0.045, decay: 0.08, duration: 0.09 });
    }

    playBlockPlace(materialKey) {
        if (!this.unlocked) {
            void this.unlock();
            return;
        }

        const profile = FOOTSTEP_PROFILES[materialKey] || FOOTSTEP_PROFILES.default;
        this.spawnNoise({ gain: profile.noise * 0.8, decay: profile.decay, filterFrequency: Math.max(220, profile.filter * 0.82), q: 0.55 });
        this.spawnOscillator({ type: 'triangle', startFrequency: profile.tone * 0.92, endFrequency: profile.tone * 0.44, filterFrequency: Math.max(240, profile.filter * 0.75), gain: 0.05, decay: 0.11, duration: 0.12 });
    }

    playFootstep(materialKey) {
        if (!this.unlocked) {
            return;
        }

        const profile = FOOTSTEP_PROFILES[materialKey] || FOOTSTEP_PROFILES.default;
        this.spawnNoise({ gain: profile.noise, decay: profile.decay, filterFrequency: profile.filter, q: 0.45 });
        this.spawnOscillator({ type: 'triangle', startFrequency: profile.tone, endFrequency: profile.tone * 0.72, filterFrequency: profile.filter * 0.9, gain: 0.028, decay: profile.decay, duration: profile.decay + 0.01 });
    }
}
