(function () {
    class ApiRequest {
        static buildUrl(url, data, useApiBase, method) {
            const base = useApiBase === false ? window.location.origin + '/' : window.ENV.API_BASE_URL;
            const requestUrl = new URL(url, base);

            if (data && ['GET', 'HEAD'].includes(method)) {
                Object.entries(data).forEach(function ([key, value]) {
                    if (value !== undefined && value !== null && value !== '') {
                        requestUrl.searchParams.set(key, String(value));
                    }
                });
            }

            return requestUrl.toString();
        }

        static async request(options) {
            const settings = Object.assign({
                url: '',
                method: 'GET',
                data: null,
                headers: {},
                showLoading: true,
                loadingMessage: 'Carregando...',
                skipAuthRedirect: false,
                useApiBase: true
            }, options || {});

            const method = settings.method.toUpperCase();
            const url = this.buildUrl(settings.url, settings.data, settings.useApiBase, method);
            const headers = new Headers(settings.headers || {});
            headers.set('Accept', 'application/json');

            const token = window.localStorage.getItem(window.ENV.TOKEN_KEY);
            if (token && !headers.has('Authorization')) {
                headers.set('Authorization', 'Bearer ' + token);
            }

            const fetchOptions = {
                method: method,
                headers: headers
            };

            if (!['GET', 'HEAD'].includes(method) && settings.data !== null) {
                headers.set('Content-Type', 'application/json; charset=UTF-8');
                fetchOptions.body = JSON.stringify(settings.data);
            }

            const controller = new AbortController();
            fetchOptions.signal = controller.signal;

            let timeoutId = null;
            if (window.ENV.API_TIMEOUT_MS) {
                timeoutId = window.setTimeout(function () {
                    controller.abort();
                }, window.ENV.API_TIMEOUT_MS);
            }

            if (settings.showLoading && window.loading) {
                window.loading.show(settings.loadingMessage);
            }

            try {
                const response = await window.fetch(url, fetchOptions);
                const contentType = response.headers.get('content-type') || '';
                const payload = contentType.includes('application/json') ? await response.json() : null;

                if (!response.ok) {
                    const error = new Error(payload && payload.message ? payload.message : 'Falha na requisicao.');
                    error.response = response;
                    error.payload = payload;
                    throw error;
                }

                return payload;
            } catch (error) {
                if (error.name === 'AbortError') {
                    const timeoutError = new Error('Tempo limite da requisicao excedido.');
                    timeoutError.payload = { status: 'ERROR', message: 'Tempo limite da requisicao excedido.' };
                    throw timeoutError;
                }

                const status = error.response ? error.response.status : 0;
                if (status === 401 && !settings.skipAuthRedirect && window.auth) {
                    window.auth.clearSession();
                }

                throw error;
            } finally {
                if (timeoutId !== null) {
                    window.clearTimeout(timeoutId);
                }

                if (settings.showLoading && window.loading) {
                    window.loading.hide();
                }
            }
        }

        static get(url, options) {
            return this.request(Object.assign({}, options || {}, { url: url, method: 'GET' }));
        }

        static post(url, data, options) {
            return this.request(Object.assign({}, options || {}, { url: url, method: 'POST', data: data || {} }));
        }

        static put(url, data, options) {
            return this.request(Object.assign({}, options || {}, { url: url, method: 'PUT', data: data || {} }));
        }

        static delete(url, data, options) {
            return this.request(Object.assign({}, options || {}, { url: url, method: 'DELETE', data: data || {} }));
        }
    }

    window.ApiRequest = ApiRequest;
})();
