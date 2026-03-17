(function () {
    class AuthManager {
        getToken() {
            return window.localStorage.getItem(window.ENV.TOKEN_KEY);
        }

        saveSession(data) {
            if (data.token) {
                window.localStorage.setItem(window.ENV.TOKEN_KEY, data.token);
            }

            if (data.user) {
                window.localStorage.setItem(window.ENV.USER_KEY, JSON.stringify(data.user));
            }
        }

        clearSession(options) {
            const settings = Object.assign({
                redirect: true,
                silent: false
            }, options || {});

            window.localStorage.removeItem(window.ENV.TOKEN_KEY);
            window.localStorage.removeItem(window.ENV.USER_KEY);

            if (!settings.silent && settings.redirect) {
                window.location.href = window.ENV.DOMAIN + '/login.php';
            }
        }

        async validateToken() {
            const payload = await window.ApiRequest.get('login/validar.php', {
                skipAuthRedirect: true,
                loadingMessage: 'Validando sessao...'
            });

            if (!payload || payload.status !== 'OK' || !payload.data || !payload.data.user) {
                throw new Error('Sessao invalida.');
            }

            this.saveSession({ user: payload.data.user, token: this.getToken() });
            return payload.data;
        }

        async initLoginPage() {
            const token = this.getToken();
            if (!token) {
                window.loading.reset();
                return;
            }

            window.loading.show('Validando sessao...');

            try {
                await this.validateToken();
                window.location.href = window.ENV.DOMAIN + '/index.php?page=menu';
            } catch (error) {
                this.clearSession({ redirect: false, silent: true });
            } finally {
                window.loading.reset();
            }
        }

        async initProtectedShell() {
            if (!this.getToken()) {
                this.clearSession();
                return;
            }

            window.loading.show('Carregando sessao...');

            try {
                const sessionData = await this.validateToken();
                this.hydrateShell(sessionData.user);
                const protectedShell = document.querySelector('[data-protected-shell]');
                if (protectedShell) {
                    protectedShell.hidden = false;
                }

                window.dispatchEvent(new CustomEvent('mineworld:auth-ready', {
                    detail: sessionData
                }));
            } catch (error) {
                this.clearSession();
            } finally {
                window.loading.reset();
            }

            const logoutButton = document.querySelector('[data-action="logout"]');
            if (logoutButton) {
                logoutButton.addEventListener('click', this.logout.bind(this));
            }
        }

        hydrateShell(user) {
            document.querySelectorAll('[data-auth-user-name]').forEach(function (node) {
                node.textContent = user.nome_exibicao || user.login || 'Jogador';
            });
        }

        async logout() {
            try {
                await window.ApiRequest.post('login/logout.php', {}, {
                    skipAuthRedirect: true,
                    loadingMessage: 'Saindo...'
                });
            } catch (error) {
                // Logout stateless: falha remota nao impede limpeza local.
            } finally {
                this.clearSession();
            }
        }
    }

    window.auth = new AuthManager();
})();
