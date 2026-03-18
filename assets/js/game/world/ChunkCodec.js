function encodeWithBtoa(uint8Array) {
    let binary = '';
    const batchSize = 0x8000;

    for (let index = 0; index < uint8Array.length; index += batchSize) {
        const slice = uint8Array.subarray(index, index + batchSize);
        binary += String.fromCharCode.apply(null, Array.from(slice));
    }

    return btoa(binary);
}

function decodeWithAtob(base64) {
    const binary = atob(base64);
    const output = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
        output[index] = binary.charCodeAt(index);
    }

    return output;
}

export function encodeChunkData(uint8Array) {
    if (!(uint8Array instanceof Uint8Array)) {
        return '';
    }

    if (typeof btoa === 'function') {
        return encodeWithBtoa(uint8Array);
    }

    if (typeof Buffer !== 'undefined') {
        return Buffer.from(uint8Array).toString('base64');
    }

    throw new Error('Nao foi possivel codificar o chunk para base64.');
}

export function decodeChunkData(base64) {
    if (typeof base64 !== 'string' || base64.trim() === '') {
        return null;
    }

    if (typeof atob === 'function') {
        return decodeWithAtob(base64);
    }

    if (typeof Buffer !== 'undefined') {
        return new Uint8Array(Buffer.from(base64, 'base64'));
    }

    throw new Error('Nao foi possivel decodificar o chunk salvo.');
}
