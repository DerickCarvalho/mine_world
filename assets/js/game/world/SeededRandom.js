function hashString(value) {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
}

function hashInt(value) {
    let hashed = value >>> 0;
    hashed ^= hashed >>> 16;
    hashed = Math.imul(hashed, 2246822519);
    hashed ^= hashed >>> 13;
    hashed = Math.imul(hashed, 3266489917);
    hashed ^= hashed >>> 16;
    return hashed >>> 0;
}

function lerp(start, end, amount) {
    return start + (end - start) * amount;
}

function fade(value) {
    return value * value * value * (value * (value * 6 - 15) + 10);
}

export class SeededRandom {
    constructor(seed) {
        this.seed = hashString(String(seed || 'mineworld'));
    }

    random2D(x, z, salt = 0) {
        const mixed = hashInt(
            Math.imul(x, 374761393)
            ^ Math.imul(z, 668265263)
            ^ Math.imul(this.seed ^ salt, 1274126177)
        );

        return mixed / 4294967295;
    }

    valueNoise2D(x, z, frequency = 1, salt = 0) {
        const sampleX = x * frequency;
        const sampleZ = z * frequency;
        const x0 = Math.floor(sampleX);
        const z0 = Math.floor(sampleZ);
        const x1 = x0 + 1;
        const z1 = z0 + 1;
        const tx = fade(sampleX - x0);
        const tz = fade(sampleZ - z0);
        const v00 = this.random2D(x0, z0, salt);
        const v10 = this.random2D(x1, z0, salt);
        const v01 = this.random2D(x0, z1, salt);
        const v11 = this.random2D(x1, z1, salt);
        const ix0 = lerp(v00, v10, tx);
        const ix1 = lerp(v01, v11, tx);

        return lerp(ix0, ix1, tz);
    }

    fractalNoise2D(x, z, options = {}) {
        const settings = Object.assign({
            frequency: 0.01,
            octaves: 4,
            lacunarity: 2,
            persistence: 0.5,
            salt: 0
        }, options || {});

        let amplitude = 1;
        let frequency = settings.frequency;
        let total = 0;
        let amplitudeSum = 0;

        for (let octave = 0; octave < settings.octaves; octave += 1) {
            total += this.valueNoise2D(x, z, frequency, settings.salt + octave * 97) * amplitude;
            amplitudeSum += amplitude;
            amplitude *= settings.persistence;
            frequency *= settings.lacunarity;
        }

        return amplitudeSum === 0 ? 0 : total / amplitudeSum;
    }
}
