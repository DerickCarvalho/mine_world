<?php
$pageFile = __DIR__ . '/pages/' . $page . '.php';
?>
<div class="app-shell" id="protected-shell" data-protected-shell hidden>
    <?php include __DIR__ . '/partials/shell-header.php'; ?>

    <main class="app-shell__content">
        <section class="app-shell__card">
            <?php if (is_file($pageFile)) : ?>
                <?php include $pageFile; ?>
            <?php else : ?>
                <section class="placeholder-card">
                    <h1>Pagina nao encontrada</h1>
                    <p>A rota solicitada nao esta disponivel.</p>
                </section>
            <?php endif; ?>
        </section>
    </main>
</div>
