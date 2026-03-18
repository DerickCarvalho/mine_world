export class TextureRepository {
    async loadManifest() {
        const payload = await window.ApiRequest.get('texturas/listar.php', {
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar o manifest de texturas.');
        }

        const manifest = {};

        for (const block of Array.isArray(payload.data.blocks) ? payload.data.blocks : []) {
            manifest[block.block_key] = {
                top: block.textures && block.textures.top ? block.textures.top : null,
                side: block.textures && block.textures.side ? block.textures.side : null,
                bottom: block.textures && block.textures.bottom ? block.textures.bottom : null
            };
        }

        return manifest;
    }
}
