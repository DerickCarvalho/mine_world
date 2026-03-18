export class GameAudio {
    constructor(volume = 80) {
        this.audioContext = null;
        this.masterGain = null;
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

    playDamage() {
        const context = this.ensureContext();
        if (!context || !this.masterGain) {
            return;
        }

        if (context.state === 'suspended') {
            void context.resume().catch(function () {
                // Ignora browsers que negarem o resume automatico.
            });
        }

        const now = context.currentTime;
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const filter = context.createBiquadFilter();

        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(210, now);
        oscillator.frequency.exponentialRampToValueAtTime(95, now + 0.16);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(840, now);
        filter.frequency.exponentialRampToValueAtTime(320, now + 0.18);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.24, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }
}