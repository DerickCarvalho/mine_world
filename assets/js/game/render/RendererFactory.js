import { SoftwareRenderer } from './SoftwareRenderer.js';
import { WebGLRenderer } from './webgl/WebGLRenderer.js';

export class RendererFactory {
    static create(canvas, options = {}) {
        const preferWebGL = options.preferWebGL !== false && options.forceSoftware !== true;

        if (preferWebGL && WebGLRenderer.isSupported()) {
            try {
                return new WebGLRenderer(canvas);
            } catch (error) {
                console.warn('MineWorld: WebGL 2 indisponivel; usando renderer 2D.', error);
                if (typeof options.onFallback === 'function') {
                    options.onFallback(error);
                }
            }
        } else if (preferWebGL && typeof options.onFallback === 'function') {
            options.onFallback(new Error('WebGL 2 nao e suportado neste navegador.'));
        }

        return new SoftwareRenderer(canvas);
    }
}

export function createRenderer(canvas, options) {
    return RendererFactory.create(canvas, options);
}
