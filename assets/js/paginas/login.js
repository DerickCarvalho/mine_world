(function () {
    function toggleTab(target) {
        document.querySelectorAll('[data-auth-tab-button]').forEach(function (button) {
            button.classList.toggle('is-active', button.getAttribute('data-target') === target);
        });

        document.querySelectorAll('[data-auth-panel]').forEach(function (panel) {
            panel.hidden = panel.getAttribute('data-auth-panel') !== target;
        });
    }

    function serializeForm(form) {
        const formData = new FormData(form);
        return Object.fromEntries(formData.entries());
    }

    function validateLogin(data) {
        if (!data.login || !data.senha) {
            throw new Error('Preencha login e senha para continuar.');
        }
    }

    function validateRegister(data) {
        if (!data.nome_exibicao || data.nome_exibicao.length < 3) {
            throw new Error('Informe um nome de exibicao com pelo menos 3 caracteres.');
        }

        if (!data.login || data.login.length < 3) {
            throw new Error('Informe um login com pelo menos 3 caracteres.');
        }

        if (!data.senha || data.senha.length < 6) {
            throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        }

        if (data.senha !== data.confirmar_senha) {
            throw new Error('As senhas nao coincidem.');
        }
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();

        const data = serializeForm(event.currentTarget);

        try {
            validateLogin(data);
            const payload = await window.ApiRequest.post('login/logar.php', data, {
                skipAuthRedirect: true,
                loadingMessage: 'Entrando no MineWorld...'
            });

            if (!payload || payload.status !== 'OK') {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel entrar.');
            }

            window.auth.saveSession(payload.data);
            window.showSuccess(payload.message || 'Login realizado com sucesso.');
            window.setTimeout(function () {
                window.location.href = window.ENV.DOMAIN + '/index.php?page=menu';
            }, 250);
        } catch (error) {
            window.showError(error.message || 'Falha ao autenticar.');
        }
    }

    async function handleRegisterSubmit(event) {
        event.preventDefault();

        const data = serializeForm(event.currentTarget);

        try {
            validateRegister(data);
            const payload = await window.ApiRequest.post('login/cadastrar.php', data, {
                skipAuthRedirect: true,
                loadingMessage: 'Criando conta...'
            });

            if (!payload || payload.status !== 'OK') {
                throw new Error(payload && payload.message ? payload.message : 'Nao foi possivel criar a conta.');
            }

            window.auth.saveSession(payload.data);
            window.showSuccess(payload.message || 'Conta criada com sucesso.');
            window.setTimeout(function () {
                window.location.href = window.ENV.DOMAIN + '/index.php?page=menu';
            }, 250);
        } catch (error) {
            window.showError(error.message || 'Falha ao criar a conta.');
        }
    }

    window.addEventListener('DOMContentLoaded', function () {
        if (window.auth) {
            window.auth.initLoginPage();
        }

        document.querySelectorAll('[data-auth-tab-button]').forEach(function (button) {
            button.addEventListener('click', function () {
                toggleTab(button.getAttribute('data-target'));
            });
        });

        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLoginSubmit);
        }

        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', handleRegisterSubmit);
        }
    });
})();
