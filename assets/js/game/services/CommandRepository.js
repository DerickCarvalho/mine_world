export class CommandRepository {
    async listValidated() {
        const payload = await window.ApiRequest.get('comandos/listar.php', {
            data: {
                validated: 1,
                active: 1
            },
            showLoading: false
        });

        if (!payload || payload.status !== 'OK' || !payload.data) {
            throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel carregar os comandos validados.');
        }

        return Array.isArray(payload.data.commands) ? payload.data.commands : [];
    }
}
