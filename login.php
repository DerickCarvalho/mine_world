<?php
$pageTitle = 'MineWorld - Acesso';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8'); ?></title>
    <link rel="stylesheet" href="assets/css/custom/global.css">
    <link rel="stylesheet" href="assets/css/custom/pages/login.css">
</head>
<body class="page-login">
<?php include __DIR__ . '/partials/loading-ui.php'; ?>

<main class="login-screen">
    <section class="login-panel">
        <div class="login-panel__brand">
            <p class="login-panel__eyebrow">Sandbox 3D de navegador</p>
            <h1>MineWorld</h1>
            <p class="login-panel__copy">Entre para salvar configuracoes, mundos e preparar o primeiro mundo procedural.</p>

            <div class="login-panel__feature-list" aria-label="Destaques da conta">
                <article class="login-panel__feature">
                    <strong>Mundos salvos</strong>
                    <span>Seu catalogo de mundos fica ligado a conta, pronto para crescer com o jogo.</span>
                </article>

                <article class="login-panel__feature">
                    <strong>Configuracoes persistentes</strong>
                    <span>Sensibilidade, distancia de render e preferencias basicas ja nascem com salvamento real.</span>
                </article>

                <article class="login-panel__feature">
                    <strong>Base pronta para o 3D</strong>
                    <span>Menu, lobby e mundo procedural vao usar a mesma sessao autenticada.</span>
                </article>
            </div>
        </div>

        <div class="login-panel__access">
            <div class="login-panel__access-header">
                <div>
                    <p class="login-panel__label">Acesso persistente</p>
                    <h2>Entre ou crie sua conta</h2>
                </div>

                <div class="login-tabs" role="tablist" aria-label="Acesso ao MineWorld">
                    <button class="login-tabs__button is-active" type="button" data-auth-tab-button data-target="login">Login</button>
                    <button class="login-tabs__button" type="button" data-auth-tab-button data-target="register">Cadastro</button>
                </div>
            </div>

            <section class="auth-card" data-auth-panel="login">
                <div class="auth-card__header">
                    <h3>Entrar</h3>
                    <p>Use sua conta para abrir o menu principal e continuar de onde parou.</p>
                </div>

                <form id="login-form" class="auth-form" novalidate>
                    <label class="field">
                        <span>Login</span>
                        <input type="text" name="login" maxlength="60" autocomplete="username" placeholder="Seu login" required>
                    </label>

                    <label class="field">
                        <span>Senha</span>
                        <input type="password" name="senha" minlength="6" autocomplete="current-password" placeholder="Sua senha" required>
                    </label>

                    <button class="button button--primary button--block" type="submit">Entrar no MineWorld</button>
                </form>
            </section>

            <section class="auth-card" data-auth-panel="register" hidden>
                <div class="auth-card__header">
                    <h3>Criar conta</h3>
                    <p>Seu perfil nasce pronto para salvar configuracoes e os primeiros mundos.</p>
                </div>

                <form id="register-form" class="auth-form" novalidate>
                    <label class="field">
                        <span>Nome de exibicao</span>
                        <input type="text" name="nome_exibicao" maxlength="80" autocomplete="nickname" placeholder="Como voce quer aparecer" required>
                    </label>

                    <label class="field">
                        <span>Login</span>
                        <input type="text" name="login" maxlength="60" autocomplete="username" placeholder="Escolha um login" required>
                    </label>

                    <label class="field">
                        <span>Senha</span>
                        <input type="password" name="senha" minlength="6" autocomplete="new-password" placeholder="Minimo de 6 caracteres" required>
                    </label>

                    <label class="field">
                        <span>Confirmar senha</span>
                        <input type="password" name="confirmar_senha" minlength="6" autocomplete="new-password" placeholder="Repita a senha" required>
                    </label>

                    <button class="button button--primary button--block" type="submit">Criar conta</button>
                </form>
            </section>
        </div>
    </section>
</main>

<script src="env.default.js"></script>
<script src="assets/js/Loading.js"></script>
<script src="assets/js/alert.js"></script>
<script src="assets/js/ApiRequest.js"></script>
<script src="assets/js/auth.js"></script>
<script src="assets/js/paginas/login.js"></script>
</body>
</html>
