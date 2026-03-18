import { getBlockDefinitionByKey, getBlockFaceBaseColor } from '../world/BlockTypes.js';
import { getBlockTextureCatalog } from '../world/ChunkMaterials.js';

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildFaceStyle(blockKey, faceKey) {
    const definition = getBlockDefinitionByKey(blockKey);
    const color = getBlockFaceBaseColor(definition.key, faceKey === 'side' ? 'north' : faceKey);
    const textureCatalog = getBlockTextureCatalog();
    const texture = textureCatalog[definition.key] && textureCatalog[definition.key][faceKey]
        ? textureCatalog[definition.key][faceKey]
        : null;

    let style = 'background-color: rgb(' + color.r + ',' + color.g + ',' + color.b + ');';
    if (texture && texture.path) {
        const textureUrl = new URL(texture.path, window.ENV.DOMAIN + '/').toString();
        style += 'background-image: url(&quot;' + escapeHtml(textureUrl) + '&quot;);';
        style += 'background-size: cover; background-position: center;';
    }

    return style;
}

export function renderItemIconMarkup(blockKey, sizeClass) {
    if (!blockKey) {
        return '<span class="game-item-icon game-item-icon--empty"></span>';
    }

    const definition = getBlockDefinitionByKey(blockKey);
    const iconSizeClass = sizeClass ? ' ' + sizeClass : '';

    return '<span class="game-item-icon' + iconSizeClass + '" aria-hidden="true" title="' + escapeHtml(definition.name) + '">'
        + '<span class="game-item-icon__cube">'
        + '<span class="game-item-icon__face game-item-icon__face--top" style="' + buildFaceStyle(definition.key, 'top') + '"></span>'
        + '<span class="game-item-icon__face game-item-icon__face--front" style="' + buildFaceStyle(definition.key, 'side') + '"></span>'
        + '<span class="game-item-icon__face game-item-icon__face--side" style="' + buildFaceStyle(definition.key, 'side') + '"></span>'
        + '</span>'
        + '</span>';
}
